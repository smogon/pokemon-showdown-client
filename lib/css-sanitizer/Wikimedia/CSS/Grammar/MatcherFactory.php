<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Parser\Parser;
use Wikimedia\CSS\Sanitizer\PropertySanitizer;

/**
 * Factory for predefined Grammar matchers
 * @note For security, the attr() and var() functions are not supported.
 */
class MatcherFactory {
	/** @var MatcherFactory|null */
	private static $instance = null;

	/** @var (Matcher|Matcher[])[] Cache of constructed matchers */
	protected $cache = [];

	/** @var string[] length units */
	protected static $lengthUnits = [
		'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax',
		'cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px'
	];

	/** @var string[] angle units */
	protected static $angleUnits = [ 'deg', 'grad', 'rad', 'turn' ];

	/** @var string[] time units */
	protected static $timeUnits = [ 's', 'ms' ];

	/** @var string[] frequency units */
	protected static $frequencyUnits = [ 'Hz', 'kHz' ];

	/**
	 * Return a static instance of the factory
	 * @return MatcherFactory
	 */
	public static function singleton() {
		if ( !self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Matcher for optional whitespace
	 * @return Matcher
	 */
	public function optionalWhitespace() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new WhitespaceMatcher( [ 'significant' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for required whitespace
	 * @return Matcher
	 */
	public function significantWhitespace() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new WhitespaceMatcher( [ 'significant' => true ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a comma
	 * @return Matcher
	 */
	public function comma() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_COMMA );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an arbitrary identifier
	 * @return Matcher
	 */
	public function ident() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_IDENT );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a <custom-ident>
	 *
	 * Note this doesn't implement the semantic restriction about assigning
	 * meaning to various idents in a complex value, as CSS Sanitizer doesn't
	 * deal with semantics on that level.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#identifier-value
	 * @param string[] $exclude Additional values to exclude, all-lowercase.
	 * @return Matcher
	 */
	public function customIdent( array $exclude = [] ) {
		$exclude = array_merge( [
			// https://www.w3.org/TR/2019/CR-css-values-3-20190606/#common-keywords
			'initial', 'inherit', 'unset', 'default',
			// https://www.w3.org/TR/2018/CR-css-cascade-4-20180828/#all-shorthand
			'revert'
		], $exclude );
		return new TokenMatcher( Token::T_IDENT, static function ( Token $t ) use ( $exclude ) {
			return !in_array( strtolower( $t->value() ), $exclude, true );
		} );
	}

	/**
	 * Matcher for a string
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#strings
	 * @warning If the string will be used as a URL, use self::urlstring() instead.
	 * @return Matcher
	 */
	public function string() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_STRING );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a string containing a URL
	 * @param string $type Type of resource referenced, e.g. "image" or "audio".
	 *  Not used here, but might be used by a subclass to validate the URL more strictly.
	 * @return Matcher
	 */
	public function urlstring( $type ) {
		return $this->string();
	}

	/**
	 * Matcher for a URL
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#urls
	 * @param string $type Type of resource referenced, e.g. "image" or "audio".
	 *  Not used here, but might be used by a subclass to validate the URL more strictly.
	 * @return Matcher
	 */
	public function url( $type ) {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new UrlMatcher();
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * CSS-wide value keywords
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#common-keywords
	 * @return Matcher
	 */
	public function cssWideKeywords() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new KeywordMatcher( [
				// https://www.w3.org/TR/2019/CR-css-values-3-20190606/#common-keywords
				'initial', 'inherit', 'unset',
				// added by https://www.w3.org/TR/2018/CR-css-cascade-4-20180828/#all-shorthand
				'revert'
			] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#calc-notation
	 * @param Matcher $typeMatcher Matcher for the type
	 * @param string $type Type being matched
	 * @return Matcher[]
	 */
	protected function calcInternal( Matcher $typeMatcher, $type ) {
		if ( $type === 'integer' ) {
			$num = $this->rawInteger();
		} else {
			$num = $this->rawNumber();
		}

		$ows = $this->optionalWhitespace();
		$ws = $this->significantWhitespace();

		// Definitions are recursive. This will be used by reference and later
		// will be replaced.
		$calcValue = new NothingMatcher();

		if ( $type === 'integer' ) {
			// Division will always resolve to a number, making the expression
			// invalid, so don't allow it.
			$calcProduct = new Juxtaposition( [
				&$calcValue,
				Quantifier::star( new Juxtaposition( [ $ows, new DelimMatcher( '*' ), $ows, &$calcValue ] ) )
			] );
		} elseif ( $typeMatcher === $this->rawNumber() ) {
			$calcProduct = new Juxtaposition( [
				&$calcValue,
				Quantifier::star(
					new Juxtaposition( [ $ows, new DelimMatcher( [ '*', '/' ] ), $ows, &$calcValue ] )
				),
			] );
		} else {
			$calcNumValue = $this->calcInternal( $this->rawNumber(), 'number' )[1];
			$calcProduct = new Juxtaposition( [
				&$calcValue,
				Quantifier::star(
					new Alternative( [
						new Juxtaposition( [ $ows, new DelimMatcher( '*' ), $ows, &$calcValue ] ),
						new Juxtaposition( [ $ows, new DelimMatcher( '/' ), $ows, $calcNumValue, ] ),
					] )
				),
			] );
		}

		$calcSum = new Juxtaposition( [
			$ows,
			$calcProduct,
			Quantifier::star( new Juxtaposition( [
				$ws, new DelimMatcher( [ '+', '-' ] ), $ws, $calcProduct
			] ) ),
			$ows,
		] );

		$calcFunc = new FunctionMatcher( 'calc', $calcSum );

		if ( $num === $typeMatcher ) {
			$calcValue = new Alternative( [
				$typeMatcher,
				new BlockMatcher( Token::T_LEFT_PAREN, $calcSum ),
				$calcFunc,
			] );
		} else {
			$calcValue = new Alternative( [
				$num,
				$typeMatcher,
				new BlockMatcher( Token::T_LEFT_PAREN, $calcSum ),
				$calcFunc,
			] );
		}

		return [
			new Alternative( [ $typeMatcher, $calcFunc ] ),
			$calcValue,
		];
	}

	/**
	 * Add calc() support to a basic type matcher
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#calc-notation
	 * @param Matcher $typeMatcher Matcher for the type
	 * @param string $type Type being matched
	 * @return Matcher
	 */
	public function calc( Matcher $typeMatcher, $type ) {
		return $this->calcInternal( $typeMatcher, $type )[0];
	}

	/**
	 * Matcher for an integer value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#integers
	 * @return Matcher
	 */
	protected function rawInteger() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
				// The spec says it must match /^[+-]\d+$/, but the tokenizer
				// should have marked any other number token as a 'number'
				// anyway so let's not bother checking.
				return $t->typeFlag() === 'integer';
			} );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an integer value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#integers
	 * @return Matcher
	 */
	public function integer() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawInteger(), 'integer' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a real number, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#numbers
	 * @return Matcher
	 */
	public function rawNumber() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_NUMBER );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a real number
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#numbers
	 * @return Matcher
	 */
	public function number() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawNumber(), 'number' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a percentage value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#percentages
	 * @return Matcher
	 */
	public function rawPercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_PERCENTAGE );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#percentages
	 * @return Matcher
	 */
	public function percentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawPercentage(), 'percentage' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a length-percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-length-percentage
	 * @return Matcher
	 */
	public function lengthPercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc(
				new Alternative( [ $this->rawLength(), $this->rawPercentage() ] ),
				'length'
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a frequency-percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-frequency-percentage
	 * @return Matcher
	 */
	public function frequencyPercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc(
				new Alternative( [ $this->rawFrequency(), $this->rawPercentage() ] ),
				'frequency'
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an angle-percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-angle-percentage
	 * @return Matcher
	 */
	public function anglePercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc(
				new Alternative( [ $this->rawAngle(), $this->rawPercentage() ] ),
				'angle'
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a time-percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-time-percentage
	 * @return Matcher
	 */
	public function timePercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc(
				new Alternative( [ $this->rawTime(), $this->rawPercentage() ] ),
				'time'
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a number-percentage value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-number-percentage
	 * @return Matcher
	 */
	public function numberPercentage() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc(
				new Alternative( [ $this->rawNumber(), $this->rawPercentage() ] ),
				'number'
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a dimension value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#dimensions
	 * @return Matcher
	 */
	public function dimension() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_DIMENSION );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matches the number 0
	 * @return Matcher
	 */
	public function zero() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
				return $t->value() === 0 || $t->value() === 0.0;
			} );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a length value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#lengths
	 * @return Matcher
	 */
	protected function rawLength() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$unitsRe = '/^(' . implode( '|', self::$lengthUnits ) . ')$/i';

			$this->cache[__METHOD__] = new Alternative( [
				$this->zero(),
				new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) use ( $unitsRe ) {
					return preg_match( $unitsRe, $t->unit() );
				} ),
			] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a length value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#lengths
	 * @return Matcher
	 */
	public function length() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawLength(), 'length' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an angle value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#angles
	 * @return Matcher
	 */
	protected function rawAngle() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$unitsRe = '/^(' . implode( '|', self::$angleUnits ) . ')$/i';

			$this->cache[__METHOD__] = new TokenMatcher( Token::T_DIMENSION,
				static function ( Token $t ) use ( $unitsRe ) {
					return preg_match( $unitsRe, $t->unit() );
				}
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an angle value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#angles
	 * @return Matcher
	 */
	public function angle() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawAngle(), 'angle' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a duration (time) value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#time
	 * @return Matcher
	 */
	protected function rawTime() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$unitsRe = '/^(' . implode( '|', self::$timeUnits ) . ')$/i';

			$this->cache[__METHOD__] = new TokenMatcher( Token::T_DIMENSION,
				static function ( Token $t ) use ( $unitsRe ) {
					return preg_match( $unitsRe, $t->unit() );
				}
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a duration (time) value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#time
	 * @return Matcher
	 */
	public function time() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawTime(), 'time' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a frequency value, without calc()
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#frequency
	 * @return Matcher
	 */
	protected function rawFrequency() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$unitsRe = '/^(' . implode( '|', self::$frequencyUnits ) . ')$/i';

			$this->cache[__METHOD__] = new TokenMatcher( Token::T_DIMENSION,
				static function ( Token $t ) use ( $unitsRe ) {
					return preg_match( $unitsRe, $t->unit() );
				}
			);
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a frequency value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#frequency
	 * @return Matcher
	 */
	public function frequency() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = $this->calc( $this->rawFrequency(), 'frequency' );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a resolution value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#resolution
	 * @return Matcher
	 */
	public function resolution() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) {
				return preg_match( '/^(dpi|dpcm|dppx)$/i', $t->unit() );
			} );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matchers for color functions
	 * @return Matcher[]
	 */
	protected function colorFuncs() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$i = $this->integer();
			$n = $this->number();
			$p = $this->percentage();
			$this->cache[__METHOD__] = [
				new FunctionMatcher( 'rgb', new Alternative( [
					Quantifier::hash( $i, 3, 3 ),
					Quantifier::hash( $p, 3, 3 ),
				] ) ),
				new FunctionMatcher( 'rgba', new Alternative( [
					new Juxtaposition( [ $i, $i, $i, $n ], true ),
					new Juxtaposition( [ $p, $p, $p, $n ], true ),
				] ) ),
				new FunctionMatcher( 'hsl', new Juxtaposition( [ $n, $p, $p ], true ) ),
				new FunctionMatcher( 'hsla', new Juxtaposition( [ $n, $p, $p, $n ], true ) ),
			];
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a color value
	 * @see https://www.w3.org/TR/2018/REC-css-color-3-20180619/#colorunits
	 * @return Matcher
	 */
	public function color() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Alternative( array_merge( [
				new KeywordMatcher( [
					// Basic colors
					'aqua', 'black', 'blue', 'fuchsia', 'gray', 'green',
					'lime', 'maroon', 'navy', 'olive', 'purple', 'red',
					'silver', 'teal', 'white', 'yellow',
					// Extended colors
					'aliceblue', 'antiquewhite', 'aquamarine', 'azure',
					'beige', 'bisque', 'blanchedalmond', 'blueviolet', 'brown',
					'burlywood', 'cadetblue', 'chartreuse', 'chocolate',
					'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
					'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
					'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
					'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
					'darksalmon', 'darkseagreen', 'darkslateblue',
					'darkslategray', 'darkslategrey', 'darkturquoise',
					'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
					'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite',
					'forestgreen', 'gainsboro', 'ghostwhite', 'gold',
					'goldenrod', 'greenyellow', 'grey', 'honeydew', 'hotpink',
					'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
					'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
					'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
					'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
					'lightsalmon', 'lightseagreen', 'lightskyblue',
					'lightslategray', 'lightslategrey', 'lightsteelblue',
					'lightyellow', 'limegreen', 'linen', 'magenta',
					'mediumaquamarine', 'mediumblue', 'mediumorchid',
					'mediumpurple', 'mediumseagreen', 'mediumslateblue',
					'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
					'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
					'navajowhite', 'oldlace', 'olivedrab', 'orange',
					'orangered', 'orchid', 'palegoldenrod', 'palegreen',
					'paleturquoise', 'palevioletred', 'papayawhip',
					'peachpuff', 'peru', 'pink', 'plum', 'powderblue',
					'rosybrown', 'royalblue', 'saddlebrown', 'salmon',
					'sandybrown', 'seagreen', 'seashell', 'sienna', 'skyblue',
					'slateblue', 'slategray', 'slategrey', 'snow',
					'springgreen', 'steelblue', 'tan', 'thistle', 'tomato',
					'turquoise', 'violet', 'wheat', 'whitesmoke',
					'yellowgreen',
					// Other keywords. Intentionally omitting the deprecated system colors.
					'transparent', 'currentColor',
				] ),
				new TokenMatcher( Token::T_HASH, static function ( Token $t ) {
					return preg_match( '/^([0-9a-f]{3}|[0-9a-f]{6})$/i', $t->value() );
				} ),
			], $this->colorFuncs() ) );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for an image value
	 * @see https://www.w3.org/TR/2019/CR-css-images-3-20191010/#image-values
	 * @return Matcher
	 */
	public function image() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			// https://www.w3.org/TR/2019/CR-css-images-3-20191010/#gradients
			$c = $this->comma();
			$colorStop = UnorderedGroup::allOf( [
				$this->color(),
				Quantifier::optional( $this->lengthPercentage() ),
			] );
			$colorStopList = new Juxtaposition( [
				$colorStop,
				Quantifier::hash( new Juxtaposition( [
					Quantifier::optional( $this->lengthPercentage() ),
					$colorStop
				], true ) ),
			], true );
			$atPosition = new Juxtaposition( [ new KeywordMatcher( 'at' ), $this->position() ] );

			$linearGradient = new Juxtaposition( [
				Quantifier::optional( new Juxtaposition( [
					new Alternative( [
						new Alternative( [
							$this->zero(),
							$this->angle(),
						] ),
						new Juxtaposition( [ new KeywordMatcher( 'to' ), UnorderedGroup::someOf( [
							new KeywordMatcher( [ 'left', 'right' ] ),
							new KeywordMatcher( [ 'top', 'bottom' ] ),
						] ) ] )
					] ),
					$c
				] ) ),
				$colorStopList,
			] );
			$radialGradient = new Juxtaposition( [
				Quantifier::optional( new Juxtaposition( [
					new Alternative( [
						new Juxtaposition( [
							new Alternative( [
								UnorderedGroup::someOf( [ new KeywordMatcher( 'circle' ), $this->length() ] ),
								UnorderedGroup::someOf( [
									new KeywordMatcher( 'ellipse' ),
									Quantifier::count( $this->lengthPercentage(), 2, 2 )
								] ),
								UnorderedGroup::someOf( [
									new KeywordMatcher( [ 'circle', 'ellipse' ] ),
									new KeywordMatcher( [
										'closest-corner', 'closest-side', 'farthest-corner', 'farthest-side',
									] ),
								] ),
							] ),
							Quantifier::optional( $atPosition ),
						] ),
						$atPosition
					] ),
					$c
				] ) ),
				$colorStopList,
			] );

			// Putting it all together
			$this->cache[__METHOD__] = new Alternative( [
				$this->url( 'image' ),
				new FunctionMatcher( 'linear-gradient', $linearGradient ),
				new FunctionMatcher( 'radial-gradient', $radialGradient ),
				new FunctionMatcher( 'repeating-linear-gradient', $linearGradient ),
				new FunctionMatcher( 'repeating-radial-gradient', $radialGradient ),
			] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a position value
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#typedef-position
	 * @return Matcher
	 */
	public function position() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$lp = $this->lengthPercentage();
			$center = new KeywordMatcher( 'center' );
			$leftRight = new KeywordMatcher( [ 'left', 'right' ] );
			$topBottom = new KeywordMatcher( [ 'top', 'bottom' ] );

			$this->cache[__METHOD__] = new Alternative( [
				UnorderedGroup::someOf( [
					new Alternative( [ $center, $leftRight ] ),
					new Alternative( [ $center, $topBottom ] ),
				] ),
				new Juxtaposition( [
					new Alternative( [ $center, $leftRight, $lp ] ),
					Quantifier::optional( new Alternative( [ $center, $topBottom, $lp ] ) ),
				] ),

				UnorderedGroup::allOf( [
					new Juxtaposition( [ $leftRight, $lp ] ),
					new Juxtaposition( [ $topBottom, $lp ] ),
				] ),
			] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a bg-position value
	 * @see https://www.w3.org/TR/2017/CR-css-backgrounds-3-20171017/#typedef-bg-position
	 * @return Matcher
	 */
	public function bgPosition() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$lp = $this->lengthPercentage();
			$olp = Quantifier::optional( $lp );
			$center = new KeywordMatcher( 'center' );
			$leftRight = new KeywordMatcher( [ 'left', 'right' ] );
			$topBottom = new KeywordMatcher( [ 'top', 'bottom' ] );

			$this->cache[__METHOD__] = new Alternative( [
				new Alternative( [ $center, $leftRight, $topBottom, $lp ] ),
				new Juxtaposition( [
					new Alternative( [ $center, $leftRight, $lp ] ),
					new Alternative( [ $center, $topBottom, $lp ] ),
				] ),
				UnorderedGroup::allOf( [
					new Alternative( [ $center, new Juxtaposition( [ $leftRight, $olp ] ) ] ),
					new Alternative( [ $center, new Juxtaposition( [ $topBottom, $olp ] ) ] ),
				] ),
			] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Matcher for a CSS media query
	 * @see https://www.w3.org/TR/2017/CR-mediaqueries-4-20170905/#mq-syntax
	 * @param bool $strict Only allow defined query types
	 * @return Matcher
	 */
	public function cssMediaQuery( $strict = true ) {
		$key = __METHOD__ . ':' . ( $strict ? 'strict' : 'unstrict' );
		if ( !isset( $this->cache[$key] ) ) {
			if ( $strict ) {
				$generalEnclosed = new NothingMatcher();

				$mediaType = new KeywordMatcher( [
					'all', 'print', 'screen', 'speech',
					// deprecated
					'tty', 'tv', 'projection', 'handheld', 'braille', 'embossed', 'aural'
				] );

				$rangeFeatures = [
					'width', 'height', 'aspect-ratio', 'resolution', 'color', 'color-index', 'monochrome',
					// deprecated
					'device-width', 'device-height', 'device-aspect-ratio'
				];
				$discreteFeatures = [
					'orientation', 'scan', 'grid', 'update', 'overflow-block', 'overflow-inline', 'color-gamut',
					'pointer', 'hover', 'any-pointer', 'any-hover', 'scripting'
				];
				$mfName = new KeywordMatcher( array_merge(
					$rangeFeatures,
					array_map( static function ( $f ) {
						return "min-$f";
					}, $rangeFeatures ),
					array_map( static function ( $f ) {
						return "max-$f";
					}, $rangeFeatures ),
					$discreteFeatures
				) );
			} else {
				$anythingPlus = new AnythingMatcher( [ 'quantifier' => '+' ] );
				$generalEnclosed = new Alternative( [
					new FunctionMatcher( null, $anythingPlus ),
					new BlockMatcher( Token::T_LEFT_PAREN,
						new Juxtaposition( [ $this->ident(), $anythingPlus ] )
					),
				] );
				$mediaType = $this->ident();
				$mfName = $this->ident();
			}

			$posInt = $this->calc(
				new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
					return $t->typeFlag() === 'integer' && preg_match( '/^\+?\d+$/', $t->representation() );
				} ),
				'integer'
			);
			$eq = new DelimMatcher( '=' );
			$oeq = Quantifier::optional( new Juxtaposition( [ new NoWhitespace, $eq ] ) );
			$ltgteq = Quantifier::optional( new Alternative( [
				$eq,
				new Juxtaposition( [ new DelimMatcher( [ '<', '>' ] ), $oeq ] ),
			] ) );
			$lteq = new Juxtaposition( [ new DelimMatcher( '<' ), $oeq ] );
			$gteq = new Juxtaposition( [ new DelimMatcher( '>' ), $oeq ] );
			$mfValue = new Alternative( [
				$this->number(),
				$this->dimension(),
				$this->ident(),
				new Juxtaposition( [ $posInt, new DelimMatcher( '/' ), $posInt ] ),
			] );

			// temporary
			$mediaInParens = new NothingMatcher();
			$mediaNot = new Juxtaposition( [ new KeywordMatcher( 'not' ), &$mediaInParens ] );
			$mediaAnd = new Juxtaposition( [ new KeywordMatcher( 'and' ), &$mediaInParens ] );
			$mediaOr = new Juxtaposition( [ new KeywordMatcher( 'or' ), &$mediaInParens ] );
			$mediaCondition = new Alternative( [
				$mediaNot,
				new Juxtaposition( [
					&$mediaInParens,
					new Alternative( [
						Quantifier::star( $mediaAnd ),
						Quantifier::star( $mediaOr ),
					] )
				] ),
			] );
			$mediaConditionWithoutOr = new Alternative( [
				$mediaNot,
				new Juxtaposition( [ &$mediaInParens, Quantifier::star( $mediaAnd ) ] ),
			] );
			$mediaFeature = new BlockMatcher( Token::T_LEFT_PAREN, new Alternative( [
				// <mf-plain>
				new Juxtaposition( [ $mfName, new TokenMatcher( Token::T_COLON ), $mfValue ] ),
				// <mf-boolean>
				$mfName,
				// <mf-range>, 1st alternative
				new Juxtaposition( [ $mfName, $ltgteq, $mfValue ] ),
				// <mf-range>, 2nd alternative
				new Juxtaposition( [ $mfValue, $ltgteq, $mfName ] ),
				// <mf-range>, 3rd alt
				new Juxtaposition( [ $mfValue, $lteq, $mfName, $lteq, $mfValue ] ),
				// <mf-range>, 4th alt
				new Juxtaposition( [ $mfValue, $gteq, $mfName, $gteq, $mfValue ] ),
			] ) );
			$mediaInParens = new Alternative( [
				new BlockMatcher( Token::T_LEFT_PAREN, $mediaCondition ),
				$mediaFeature,
				$generalEnclosed,
			] );

			$this->cache[$key] = new Alternative( [
				$mediaCondition,
				new Juxtaposition( [
					Quantifier::optional( new KeywordMatcher( [ 'not', 'only' ] ) ),
					$mediaType,
					Quantifier::optional( new Juxtaposition( [
						new KeywordMatcher( 'and' ),
						$mediaConditionWithoutOr,
					] ) )
				] )
			] );
		}

		return $this->cache[$key];
	}

	/**
	 * Matcher for a CSS media query list
	 * @see https://www.w3.org/TR/2017/CR-mediaqueries-4-20170905/#mq-syntax
	 * @param bool $strict Only allow defined query types
	 * @return Matcher
	 */
	public function cssMediaQueryList( $strict = true ) {
		$key = __METHOD__ . ':' . ( $strict ? 'strict' : 'unstrict' );
		if ( !isset( $this->cache[$key] ) ) {
			$this->cache[$key] = Quantifier::hash( $this->cssMediaQuery( $strict ), 0, INF );
		}

		return $this->cache[$key];
	}

	/**
	 * Matcher for a "supports-condition"
	 * @see https://www.w3.org/TR/2013/CR-css3-conditional-20130404/#supports_condition
	 * @param PropertySanitizer|null $declarationSanitizer Check declarations against this Sanitizer
	 * @param bool $strict Only accept defined syntax. Default true.
	 * @return Matcher
	 */
	public function cssSupportsCondition(
		PropertySanitizer $declarationSanitizer = null, $strict = true
	) {
		$ws = $this->significantWhitespace();
		$anythingPlus = new AnythingMatcher( [ 'quantifier' => '+' ] );

		if ( $strict ) {
			$generalEnclosed = new NothingMatcher();
		} else {
			$generalEnclosed = new Alternative( [
				new FunctionMatcher( null, $anythingPlus ),
				new BlockMatcher( Token::T_LEFT_PAREN, new Juxtaposition( [ $this->ident(), $anythingPlus ] ) ),
			] );
		}

		// temp
		$supportsConditionBlock = new NothingMatcher();
		$supportsConditionInParens = new Alternative( [
			&$supportsConditionBlock,
			new BlockMatcher( Token::T_LEFT_PAREN, $this->cssDeclaration( $declarationSanitizer ) ),
			$generalEnclosed,
		] );
		$supportsCondition = new Alternative( [
			new Juxtaposition( [ new KeywordMatcher( 'not' ), $ws, $supportsConditionInParens ] ),
			new Juxtaposition( [ $supportsConditionInParens, Quantifier::plus( new Juxtaposition( [
				$ws, new KeywordMatcher( 'and' ), $ws, $supportsConditionInParens
			] ) ) ] ),
			new Juxtaposition( [ $supportsConditionInParens, Quantifier::plus( new Juxtaposition( [
				$ws, new KeywordMatcher( 'or' ), $ws, $supportsConditionInParens
			] ) ) ] ),
			$supportsConditionInParens,
		] );
		$supportsConditionBlock = new BlockMatcher( Token::T_LEFT_PAREN, $supportsCondition );

		return $supportsCondition;
	}

	/**
	 * Matcher for a declaration
	 * @param PropertySanitizer|null $declarationSanitizer Check declarations against this Sanitizer
	 * @return Matcher
	 */
	public function cssDeclaration( PropertySanitizer $declarationSanitizer = null ) {
		$anythingPlus = new AnythingMatcher( [ 'quantifier' => '+' ] );

		return new CheckedMatcher(
			$anythingPlus,
			static function ( ComponentValueList $list, GrammarMatch $match, array $options )
				use ( $declarationSanitizer )
			{
				$cvlist = new ComponentValueList( $match->getValues() );
				$parser = Parser::newFromTokens( $cvlist->toTokenArray() );
				$declaration = $parser->parseDeclaration();
				if ( !$declaration || $parser->getParseErrors() ) {
					return false;
				}
				if ( !$declarationSanitizer ) {
					return true;
				}
				$reset = $declarationSanitizer->stashSanitizationErrors();
				$ret = $declarationSanitizer->sanitize( $declaration );
				$errors = $declarationSanitizer->getSanitizationErrors();
				unset( $reset );
				return $ret === $declaration && !$errors;
			}
		);
	}

	/**
	 * Matcher for single easing functions from CSS Easing Functions Level 1
	 * @see https://www.w3.org/TR/2019/CR-css-easing-1-20190430/#typedef-easing-function
	 * @return Matcher
	 */
	public function cssSingleEasingFunction() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Alternative( [
				new KeywordMatcher( [
					'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'
				] ),
				new FunctionMatcher( 'steps', new Juxtaposition( [
					$this->integer(),
					Quantifier::optional( new KeywordMatcher( [
						'jump-start', 'jump-end', 'jump-none', 'jump-both', 'start', 'end'
					] ) ),
				], true ) ),
				new FunctionMatcher( 'cubic-bezier', Quantifier::hash( $this->number(), 4, 4 ) ),
			] );
		}

		return $this->cache[__METHOD__];
	}

	/**
	 * @name   CSS Selectors Level 3
	 * @{
	 *
	 * https://www.w3.org/TR/2018/REC-selectors-3-20181106/#w3cselgrammar
	 */

	/**
	 * List of selectors (selectors_group)
	 *
	 *     selector [ COMMA S* selector ]*
	 *
	 * Capturing is set up for the `selector`s.
	 *
	 * @return Matcher
	 */
	public function cssSelectorList() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			// Technically the spec doesn't allow whitespace before the comma,
			// but I'd guess every browser does. So just use Quantifier::hash.
			$selector = $this->cssSelector()->capture( 'selector' );
			$this->cache[__METHOD__] = Quantifier::hash( $selector );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A single selector (selector)
	 *
	 *     simple_selector_sequence [ combinator simple_selector_sequence ]*
	 *
	 * Capturing is set up for the `simple_selector_sequence`s (as 'simple') and `combinator`.
	 *
	 * @return Matcher
	 */
	public function cssSelector() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$simple = $this->cssSimpleSelectorSeq()->capture( 'simple' );
			$this->cache[__METHOD__] = new Juxtaposition( [
				$simple,
				Quantifier::star( new Juxtaposition( [
					$this->cssCombinator()->capture( 'combinator' ),
					$simple,
				] ) )
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A CSS combinator (combinator)
	 *
	 *     PLUS S* | GREATER S* | TILDE S* | S+
	 *
	 * (combinators can be surrounded by whitespace)
	 *
	 * @return Matcher
	 */
	public function cssCombinator() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Alternative( [
				new Juxtaposition( [
					$this->optionalWhitespace(),
					new DelimMatcher( [ '+', '>', '~' ] ),
					$this->optionalWhitespace(),
				] ),
				$this->significantWhitespace(),
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A simple selector sequence (simple_selector_sequence)
	 *
	 *     [ type_selector | universal ]
	 *     [ HASH | class | attrib | pseudo | negation ]*
	 *     | [ HASH | class | attrib | pseudo | negation ]+
	 *
	 * The following captures are set:
	 *  - element: [ type_selector | universal ]
	 *  - id: HASH
	 *  - class: class
	 *  - attrib: attrib
	 *  - pseudo: pseudo
	 *  - negation: negation
	 *
	 * @return Matcher
	 */
	public function cssSimpleSelectorSeq() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$hashEtc = new Alternative( [
				$this->cssID()->capture( 'id' ),
				$this->cssClass()->capture( 'class' ),
				$this->cssAttrib()->capture( 'attrib' ),
				$this->cssPseudo()->capture( 'pseudo' ),
				$this->cssNegation()->capture( 'negation' ),
			] );

			$this->cache[__METHOD__] = new Alternative( [
				new Juxtaposition( [
					Alternative::create( [
						$this->cssTypeSelector(),
						$this->cssUniversal(),
					] )->capture( 'element' ),
					Quantifier::star( $hashEtc )
				] ),
				Quantifier::plus( $hashEtc )
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A type selector, i.e. a tag name (type_selector)
	 *
	 *     [ namespace_prefix ] ? element_name
	 *
	 * where element_name is
	 *
	 *     IDENT
	 *
	 * @return Matcher
	 */
	public function cssTypeSelector() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Juxtaposition( [
				$this->cssOptionalNamespacePrefix(),
				new TokenMatcher( Token::T_IDENT )
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A namespace prefix (namespace_prefix)
	 *
	 *      [ IDENT | '*' ]? '|'
	 *
	 * @return Matcher
	 */
	public function cssNamespacePrefix() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Juxtaposition( [
				Quantifier::optional( new Alternative( [
					$this->ident(),
					new DelimMatcher( [ '*' ] ),
				] ) ),
				new DelimMatcher( [ '|' ] ),
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * An optional namespace prefix
	 *
	 *     [ namespace_prefix ]?
	 *
	 * @return Matcher
	 */
	private function cssOptionalNamespacePrefix() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = Quantifier::optional( $this->cssNamespacePrefix() );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * The universal selector (universal)
	 *
	 *     [ namespace_prefix ]? '*'
	 *
	 * @return Matcher
	 */
	public function cssUniversal() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Juxtaposition( [
				$this->cssOptionalNamespacePrefix(),
				new DelimMatcher( [ '*' ] )
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * An ID selector
	 *
	 *     HASH
	 *
	 * @return Matcher
	 */
	public function cssID() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new TokenMatcher( Token::T_HASH, static function ( Token $t ) {
				return $t->typeFlag() === 'id';
			} );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A class selector (class)
	 *
	 *     '.' IDENT
	 *
	 * @return Matcher
	 */
	public function cssClass() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$this->cache[__METHOD__] = new Juxtaposition( [
				new DelimMatcher( [ '.' ] ),
				$this->ident()
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * An attribute selector (attrib)
	 *
	 *     '[' S* [ namespace_prefix ]? IDENT S*
	 *         [ [ PREFIXMATCH |
	 *             SUFFIXMATCH |
	 *             SUBSTRINGMATCH |
	 *             '=' |
	 *             INCLUDES |
	 *             DASHMATCH ] S* [ IDENT | STRING ] S*
	 *         ]? ']'
	 *
	 * Captures are set for the attribute, test, and value. Note that these
	 * captures will probably be relative to the contents of the SimpleBlock
	 * that this matcher matches!
	 *
	 * @return Matcher
	 */
	public function cssAttrib() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			// An attribute is going to be parsed by the parser as a
			// SimpleBlock, so that's what we need to look for here.

			$this->cache[__METHOD__] = new BlockMatcher( Token::T_LEFT_BRACKET,
				new Juxtaposition( [
					$this->optionalWhitespace(),
					Juxtaposition::create( [
						$this->cssOptionalNamespacePrefix(),
						$this->ident(),
					] )->capture( 'attribute' ),
					$this->optionalWhitespace(),
					Quantifier::optional( new Juxtaposition( [
						// Sigh. They removed various tokens from CSS Syntax 3, but didn't update the grammar
						// in CSS Selectors 3. Wing it with a hint from CSS Selectors 4's <attr-matcher>
						( new Juxtaposition( [
							Quantifier::optional( new DelimMatcher( [ '^', '$', '*', '~', '|' ] ) ),
							new DelimMatcher( [ '=' ] ),
						] ) )->capture( 'test' ),
						$this->optionalWhitespace(),
						Alternative::create( [
							$this->ident(),
							$this->string(),
						] )->capture( 'value' ),
						$this->optionalWhitespace(),
					] ) ),
				] )
			);
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A pseudo-class or pseudo-element (pseudo)
	 *
	 *     ':' ':'? [ IDENT | functional_pseudo ]
	 *
	 * Where functional_pseudo is
	 *
	 *     FUNCTION S* expression ')'
	 *
	 * Although this actually only matches the pseudo-selectors defined in the
	 * following sources:
	 * - https://www.w3.org/TR/2018/REC-selectors-3-20181106/#pseudo-classes
	 * - https://www.w3.org/TR/2019/WD-css-pseudo-4-20190225/
	 *
	 * @return Matcher
	 */
	public function cssPseudo() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$colon = new TokenMatcher( Token::T_COLON );
			$ows = $this->optionalWhitespace();
			$anplusb = new Juxtaposition( [ $ows, $this->cssANplusB(), $ows ] );
			$this->cache[__METHOD__] = new Alternative( [
				new Juxtaposition( [
					$colon,
					new Alternative( [
						new KeywordMatcher( [
							'link', 'visited', 'hover', 'active', 'focus', 'target', 'enabled', 'disabled', 'checked',
							'indeterminate', 'root', 'first-child', 'last-child', 'first-of-type',
							'last-of-type', 'only-child', 'only-of-type', 'empty',
							// CSS2-compat elements with class syntax
							'first-line', 'first-letter', 'before', 'after',
						] ),
						new FunctionMatcher( 'lang', new Juxtaposition( [ $ows, $this->ident(), $ows ] ) ),
						new FunctionMatcher( 'nth-child', $anplusb ),
						new FunctionMatcher( 'nth-last-child', $anplusb ),
						new FunctionMatcher( 'nth-of-type', $anplusb ),
						new FunctionMatcher( 'nth-last-of-type', $anplusb ),
					] ),
				] ),
				new Juxtaposition( [
					$colon,
					$colon,
					new KeywordMatcher( [
						'first-line', 'first-letter', 'before', 'after', 'selection', 'inactive-selection',
						'spelling-error', 'grammar-error', 'marker', 'placeholder'
					] ),
				] ),
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * An "AN+B" form
	 *
	 * https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#anb-microsyntax
	 *
	 * @return Matcher
	 */
	public function cssANplusB() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			// Quoth the spec:
			// > The An+B notation was originally defined using a slightly
			// > different tokenizer than the rest of CSS, resulting in a
			// > somewhat odd definition when expressed in terms of CSS tokens.
			// That's a bit of an understatement

			$plusQ = Quantifier::optional( new DelimMatcher( [ '+' ] ) );
			$n = new KeywordMatcher( [ 'n' ] );
			$dashN = new KeywordMatcher( [ '-n' ] );
			$nDash = new KeywordMatcher( [ 'n-' ] );
			$plusQN = new Juxtaposition( [ $plusQ, $n ] );
			$plusQNDash = new Juxtaposition( [ $plusQ, $nDash ] );
			$nDimension = new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) {
				return $t->typeFlag() === 'integer' && !strcasecmp( $t->unit(), 'n' );
			} );
			$nDashDimension = new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) {
				return $t->typeFlag() === 'integer' && !strcasecmp( $t->unit(), 'n-' );
			} );
			$nDashDigitDimension = new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) {
				return $t->typeFlag() === 'integer' && preg_match( '/^n-\d+$/i', $t->unit() );
			} );
			$nDashDigitIdent = new TokenMatcher( Token::T_IDENT, static function ( Token $t ) {
				return preg_match( '/^n-\d+$/i', $t->value() );
			} );
			$dashNDashDigitIdent = new TokenMatcher( Token::T_IDENT, static function ( Token $t ) {
				return preg_match( '/^-n-\d+$/i', $t->value() );
			} );
			$signedInt = new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
				return $t->typeFlag() === 'integer' && preg_match( '/^[+-]/', $t->representation() );
			} );
			$signlessInt = new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
				return $t->typeFlag() === 'integer' && preg_match( '/^\d/', $t->representation() );
			} );
			$plusOrMinus = new DelimMatcher( [ '+', '-' ] );
			$S = $this->optionalWhitespace();

			$this->cache[__METHOD__] = new Alternative( [
				new KeywordMatcher( [ 'odd', 'even' ] ),
				new TokenMatcher( Token::T_NUMBER, static function ( Token $t ) {
					return $t->typeFlag() === 'integer';
				} ),
				$nDimension,
				$plusQN,
				$dashN,
				$nDashDigitDimension,
				new Juxtaposition( [ $plusQ, $nDashDigitIdent ] ),
				$dashNDashDigitIdent,
				new Juxtaposition( [ $nDimension, $S, $signedInt ] ),
				new Juxtaposition( [ $plusQN, $S, $signedInt ] ),
				new Juxtaposition( [ $dashN, $S, $signedInt ] ),
				new Juxtaposition( [ $nDashDimension, $S, $signlessInt ] ),
				new Juxtaposition( [ $plusQNDash, $S, $signlessInt ] ),
				new Juxtaposition( [ new KeywordMatcher( [ '-n-' ] ), $S, $signlessInt ] ),
				new Juxtaposition( [ $nDimension, $S, $plusOrMinus, $S, $signlessInt ] ),
				new Juxtaposition( [ $plusQN, $S, $plusOrMinus, $S, $signlessInt ] ),
				new Juxtaposition( [ $dashN, $S, $plusOrMinus, $S, $signlessInt ] )
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * A negation (negation)
	 *
	 *     ':' not( S* [ type_selector | universal | HASH | class | attrib | pseudo ] S* ')'
	 *
	 * @return Matcher
	 */
	public function cssNegation() {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			// A negation is going to be parsed by the parser as a colon
			// followed by a CSSFunction, so that's what we need to look for
			// here.

			$this->cache[__METHOD__] = new Juxtaposition( [
				new TokenMatcher( Token::T_COLON ),
				new FunctionMatcher( 'not',
					new Juxtaposition( [
						$this->optionalWhitespace(),
						new Alternative( [
							$this->cssTypeSelector(),
							$this->cssUniversal(),
							$this->cssID(),
							$this->cssClass(),
							$this->cssAttrib(),
							$this->cssPseudo(),
						] ),
						$this->optionalWhitespace(),
					] )
				)
			] );
			$this->cache[__METHOD__]->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
		return $this->cache[__METHOD__];
	}

	/** @} */

}

/**
 * For really cool vim folding this needs to be at the end:
 * vim: foldmarker=@{,@} foldmethod=marker
 */

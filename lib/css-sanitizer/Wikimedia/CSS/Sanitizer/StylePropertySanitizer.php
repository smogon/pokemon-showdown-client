<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\BlockMatcher;
use Wikimedia\CSS\Grammar\DelimMatcher;
use Wikimedia\CSS\Grammar\FunctionMatcher;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\KeywordMatcher;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Grammar\TokenMatcher;
use Wikimedia\CSS\Grammar\UnorderedGroup;
use Wikimedia\CSS\Objects\Token;

/**
 * Sanitizes a Declaration representing a CSS style property
 * @note This intentionally doesn't support
 *  [cascading variables](https://www.w3.org/TR/css-variables/) since that
 *  seems impossible to securely sanitize.
 */
class StylePropertySanitizer extends PropertySanitizer {

	/** @var mixed[] */
	protected $cache = [];

	/**
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		parent::__construct( [], $matcherFactory->cssWideKeywords() );

		$this->addKnownProperties( [
			// https://www.w3.org/TR/2018/CR-css-cascade-4-20180828/#all-shorthand
			'all' => $matcherFactory->cssWideKeywords(),

			// https://www.w3.org/TR/2019/REC-pointerevents2-20190404/#the-touch-action-css-property
			'touch-action' => new Alternative( [
				new KeywordMatcher( [ 'auto', 'none', 'manipulation' ] ),
				UnorderedGroup::someOf( [
					new KeywordMatcher( 'pan-x' ),
					new KeywordMatcher( 'pan-y' ),
				] ),
			] ),

			// https://www.w3.org/TR/2018/WD-css-page-3-20181018/#using-named-pages
			'page' => $matcherFactory->ident(),
		] );
		$this->addKnownProperties( $this->css2( $matcherFactory ) );
		$this->addKnownProperties( $this->cssDisplay3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssPosition3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssColor3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssBorderBackground3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssImages3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssFonts3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssMulticol( $matcherFactory ) );
		$this->addKnownProperties( $this->cssOverflow3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssUI4( $matcherFactory ) );
		$this->addKnownProperties( $this->cssCompositing1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssWritingModes4( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTransitions( $matcherFactory ) );
		$this->addKnownProperties( $this->cssAnimations( $matcherFactory ) );
		$this->addKnownProperties( $this->cssFlexbox3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTransforms1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssText3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTextDecor3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssAlign3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssBreak3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssGrid1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssFilter1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssShapes1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssMasking1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssSizing3( $matcherFactory ) );
	}

	/**
	 * Properties from CSS 2.1
	 * @see https://www.w3.org/TR/2011/REC-CSS2-20110607/
	 * @note Omits properties that have been replaced by a CSS3 module
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function css2( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$none = new KeywordMatcher( 'none' );
		$auto = new KeywordMatcher( 'auto' );
		$autoLength = new Alternative( [ $auto, $matcherFactory->length() ] );
		$autoLengthPct = new Alternative( [ $auto, $matcherFactory->lengthPercentage() ] );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/box.html
		$props['margin-top'] = $autoLengthPct;
		$props['margin-bottom'] = $autoLengthPct;
		$props['margin-left'] = $autoLengthPct;
		$props['margin-right'] = $autoLengthPct;
		$props['margin'] = Quantifier::count( $autoLengthPct, 1, 4 );
		$props['padding-top'] = $matcherFactory->lengthPercentage();
		$props['padding-bottom'] = $matcherFactory->lengthPercentage();
		$props['padding-left'] = $matcherFactory->lengthPercentage();
		$props['padding-right'] = $matcherFactory->lengthPercentage();
		$props['padding'] = Quantifier::count( $matcherFactory->lengthPercentage(), 1, 4 );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/visuren.html
		$props['float'] = new KeywordMatcher( [ 'left', 'right', 'none' ] );
		$props['clear'] = new KeywordMatcher( [ 'none', 'left', 'right', 'both' ] );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/visudet.html
		$props['line-height'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			$matcherFactory->length(),
			$matcherFactory->numberPercentage(),
		] );
		$props['vertical-align'] = new Alternative( [
			new KeywordMatcher( [
				'baseline', 'sub', 'super', 'top', 'text-top', 'middle', 'bottom', 'text-bottom'
			] ),
			$matcherFactory->lengthPercentage(),
		] );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/visufx.html
		$props['clip'] = new Alternative( [
			$auto, new FunctionMatcher( 'rect', Quantifier::hash( $autoLength, 4, 4 ) ),
		] );
		$props['visibility'] = new KeywordMatcher( [ 'visible', 'hidden', 'collapse' ] );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/generate.html
		$props['list-style-type'] = new KeywordMatcher( [
			'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman',
			'lower-greek', 'lower-latin', 'upper-latin', 'armenian', 'georgian', 'lower-alpha',
			'upper-alpha', 'none'
		] );
		$props['content'] = new Alternative( [
			new KeywordMatcher( [ 'normal', 'none' ] ),
			Quantifier::plus( new Alternative( [
				$matcherFactory->string(),
				// Replaces <url> per https://www.w3.org/TR/css-images-3/#placement
				$matcherFactory->image(),
				new FunctionMatcher( 'counter', new Juxtaposition( [
					$matcherFactory->ident(),
					Quantifier::optional( $props['list-style-type'] ),
				], true ) ),
				new FunctionMatcher( 'counters', new Juxtaposition( [
					$matcherFactory->ident(),
					$matcherFactory->string(),
					Quantifier::optional( $props['list-style-type'] ),
				], true ) ),
				new FunctionMatcher( 'attr', $matcherFactory->ident() ),
				new KeywordMatcher( [ 'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote' ] ),
			] ) )
		] );
		$props['quotes'] = new Alternative( [
			$none, Quantifier::plus( new Juxtaposition( [
				$matcherFactory->string(), $matcherFactory->string()
			] ) ),
		] );
		$props['counter-reset'] = new Alternative( [
			$none,
			Quantifier::plus( new Juxtaposition( [
				$matcherFactory->ident(), Quantifier::optional( $matcherFactory->integer() )
			] ) ),
		] );
		$props['counter-increment'] = $props['counter-reset'];
		$props['list-style-image'] = new Alternative( [
			$none,
			// Replaces <url> per https://www.w3.org/TR/css-images-3/#placement
			$matcherFactory->image()
		] );
		$props['list-style-position'] = new KeywordMatcher( [ 'inside', 'outside' ] );
		$props['list-style'] = UnorderedGroup::someOf( [
			$props['list-style-type'], $props['list-style-position'], $props['list-style-image']
		] );

		// https://www.w3.org/TR/2011/REC-CSS2-20110607/tables.html
		$props['caption-side'] = new KeywordMatcher( [ 'top', 'bottom' ] );
		$props['table-layout'] = new KeywordMatcher( [ 'auto', 'fixed' ] );
		$props['border-collapse'] = new KeywordMatcher( [ 'collapse', 'separate' ] );
		$props['border-spacing'] = Quantifier::count( $matcherFactory->length(), 1, 2 );
		$props['empty-cells'] = new KeywordMatcher( [ 'show', 'hide' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Display Module Level 3
	 * @see https://www.w3.org/TR/2019/CR-css-display-3-20190711/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssDisplay3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$displayOutside = new KeywordMatcher( [ 'block', 'inline', 'run-in' ] );

		$props['display'] = new Alternative( [
			// <display-outside> || <display-inside>
			UnorderedGroup::someOf( [
				$displayOutside,
				new KeywordMatcher( [ 'flow', 'flow-root', 'table', 'flex', 'grid', 'ruby' ] ),
			] ),
			// <display-listitem>
			UnorderedGroup::allOf( [
				Quantifier::optional( $displayOutside ),
				Quantifier::optional( new KeywordMatcher( [ 'flow', 'flow-root' ] ) ),
				new KeywordMatcher( 'list-item' ),
			] ),
			new KeywordMatcher( [
				// <display-internal>
				'table-row-group', 'table-header-group', 'table-footer-group', 'table-row', 'table-cell',
				'table-column-group', 'table-column', 'table-caption', 'ruby-base', 'ruby-text',
				'ruby-base-container', 'ruby-text-container',
				// <display-box>
				'contents', 'none',
				// <display-legacy>
				'inline-block', 'inline-table', 'inline-flex', 'inline-grid',
			] ),
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Positioned Layout Module Level 3
	 * @see https://www.w3.org/TR/2016/WD-css-position-3-20160517/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssPosition3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$auto = new KeywordMatcher( 'auto' );
		$autoLengthPct = new Alternative( [ $auto, $matcherFactory->lengthPercentage() ] );

		$props = [];

		$props['position'] = new KeywordMatcher( [
			'static', 'relative', 'absolute', 'sticky', 'fixed'
		] );
		$props['top'] = $autoLengthPct;
		$props['right'] = $autoLengthPct;
		$props['bottom'] = $autoLengthPct;
		$props['left'] = $autoLengthPct;
		$props['offset-before'] = $autoLengthPct;
		$props['offset-after'] = $autoLengthPct;
		$props['offset-start'] = $autoLengthPct;
		$props['offset-end'] = $autoLengthPct;
		$props['z-index'] = new Alternative( [ $auto, $matcherFactory->integer() ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Color Module Level 3
	 * @see https://www.w3.org/TR/2018/REC-css-color-3-20180619/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssColor3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$props['color'] = $matcherFactory->color();
		$props['opacity'] = $matcherFactory->number();

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Data types for backgrounds
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return array
	 */
	protected function backgroundTypes( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$types = [];

		$types['bgrepeat'] = new Alternative( [
			new KeywordMatcher( [ 'repeat-x', 'repeat-y' ] ),
			Quantifier::count( new KeywordMatcher( [ 'repeat', 'space', 'round', 'no-repeat' ] ), 1, 2 ),
		] );
		$types['bgsize'] = new Alternative( [
			Quantifier::count( new Alternative( [
				$matcherFactory->lengthPercentage(),
				new KeywordMatcher( 'auto' )
			] ), 1, 2 ),
			new KeywordMatcher( [ 'cover', 'contain' ] )
		] );
		$types['boxKeywords'] = [ 'border-box', 'padding-box', 'content-box' ];

		$this->cache[__METHOD__] = $types;
		return $types;
	}

	/**
	 * Properties for CSS Backgrounds and Borders Module Level 3
	 * @see https://www.w3.org/TR/2017/CR-css-backgrounds-3-20171017/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssBorderBackground3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$types = $this->backgroundTypes( $matcherFactory );
		$slash = new DelimMatcher( '/' );
		$bgimage = new Alternative( [ new KeywordMatcher( 'none' ), $matcherFactory->image() ] );
		$bgrepeat = $types['bgrepeat'];
		$bgattach = new KeywordMatcher( [ 'scroll', 'fixed', 'local' ] );
		$position = $matcherFactory->bgPosition();
		$box = new KeywordMatcher( $types['boxKeywords'] );
		$bgsize = $types['bgsize'];
		$bglayer = UnorderedGroup::someOf( [
			$bgimage,
			new Juxtaposition( [
				$position, Quantifier::optional( new Juxtaposition( [ $slash, $bgsize ] ) )
			] ),
			$bgrepeat,
			$bgattach,
			$box,
			$box,
		] );
		$finalBglayer = UnorderedGroup::someOf( [
			$matcherFactory->color(),
			$bgimage,
			new Juxtaposition( [
				$position, Quantifier::optional( new Juxtaposition( [ $slash, $bgsize ] ) )
			] ),
			$bgrepeat,
			$bgattach,
			$box,
			$box,
		] );

		$props['background-color'] = $matcherFactory->color();
		$props['background-image'] = Quantifier::hash( $bgimage );
		$props['background-repeat'] = Quantifier::hash( $bgrepeat );
		$props['background-attachment'] = Quantifier::hash( $bgattach );
		$props['background-position'] = Quantifier::hash( $position );
		$props['background-clip'] = Quantifier::hash( $box );
		$props['background-origin'] = $props['background-clip'];
		$props['background-size'] = Quantifier::hash( $bgsize );
		$props['background'] = new Juxtaposition(
			[ Quantifier::hash( $bglayer, 0, INF ), $finalBglayer ], true
		);

		$lineStyle = new KeywordMatcher( [
			'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'
		] );
		$lineWidth = new Alternative( [
			new KeywordMatcher( [ 'thin', 'medium', 'thick' ] ), $matcherFactory->length(),
		] );
		$borderCombo = UnorderedGroup::someOf( [ $lineWidth, $lineStyle, $matcherFactory->color() ] );
		$radius = Quantifier::count( $matcherFactory->lengthPercentage(), 1, 2 );
		$radius4 = Quantifier::count( $matcherFactory->lengthPercentage(), 1, 4 );

		$props['border-top-color'] = $matcherFactory->color();
		$props['border-right-color'] = $matcherFactory->color();
		$props['border-bottom-color'] = $matcherFactory->color();
		$props['border-left-color'] = $matcherFactory->color();
		$props['border-color'] = Quantifier::count( $matcherFactory->color(), 1, 4 );
		$props['border-top-style'] = $lineStyle;
		$props['border-right-style'] = $lineStyle;
		$props['border-bottom-style'] = $lineStyle;
		$props['border-left-style'] = $lineStyle;
		$props['border-style'] = Quantifier::count( $lineStyle, 1, 4 );
		$props['border-top-width'] = $lineWidth;
		$props['border-right-width'] = $lineWidth;
		$props['border-bottom-width'] = $lineWidth;
		$props['border-left-width'] = $lineWidth;
		$props['border-width'] = Quantifier::count( $lineWidth, 1, 4 );
		$props['border-top'] = $borderCombo;
		$props['border-right'] = $borderCombo;
		$props['border-bottom'] = $borderCombo;
		$props['border-left'] = $borderCombo;
		$props['border'] = $borderCombo;
		$props['border-top-left-radius'] = $radius;
		$props['border-top-right-radius'] = $radius;
		$props['border-bottom-left-radius'] = $radius;
		$props['border-bottom-right-radius'] = $radius;
		$props['border-radius'] = new Juxtaposition( [
			$radius4, Quantifier::optional( new Juxtaposition( [ $slash, $radius4 ] ) )
		] );
		$props['border-image-source'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			$matcherFactory->image()
		] );
		$props['border-image-slice'] = UnorderedGroup::allOf( [
			Quantifier::count( $matcherFactory->numberPercentage(), 1, 4 ),
			Quantifier::optional( new KeywordMatcher( 'fill' ) ),
		] );
		$props['border-image-width'] = Quantifier::count( new Alternative( [
			$matcherFactory->length(),
			$matcherFactory->percentage(),
			$matcherFactory->number(),
			new KeywordMatcher( 'auto' ),
		] ), 1, 4 );
		$props['border-image-outset'] = Quantifier::count( new Alternative( [
			$matcherFactory->length(),
			$matcherFactory->number(),
		] ), 1, 4 );
		$props['border-image-repeat'] = Quantifier::count( new KeywordMatcher( [
			'stretch', 'repeat', 'round', 'space'
		] ), 1, 2 );
		$props['border-image'] = UnorderedGroup::someOf( [
			$props['border-image-source'],
			new Juxtaposition( [
				$props['border-image-slice'],
				Quantifier::optional( new Alternative( [
					new Juxtaposition( [ $slash, $props['border-image-width'] ] ),
					new Juxtaposition( [
						$slash,
						Quantifier::optional( $props['border-image-width'] ),
						$slash,
						$props['border-image-outset']
					] )
				] ) )
			] ),
			$props['border-image-repeat']
		] );

		$props['box-shadow'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::hash( UnorderedGroup::allOf( [
				Quantifier::optional( new KeywordMatcher( 'inset' ) ),
				Quantifier::count( $matcherFactory->length(), 2, 4 ),
				Quantifier::optional( $matcherFactory->color() ),
			] ) )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Images Module Level 3
	 * @see https://www.w3.org/TR/2019/CR-css-images-3-20191010/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssImages3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['object-fit'] = new KeywordMatcher( [ 'fill', 'contain', 'cover', 'none', 'scale-down' ] );
		$props['object-position'] = $matcherFactory->position();

		// Not documented as allowing bare 0, but predates the redefinition of <angle> so let's
		// be conservative
		$a = new Alternative( [
			$matcherFactory->zero(),
			$matcherFactory->angle(),
		] );
		$props['image-orientation'] = new Alternative( [
			new KeywordMatcher( [ 'from-image', 'none', 'flip' ] ),
			$a,
			new Juxtaposition( [
				$a,
				new KeywordMatcher( [ 'flip' ] ),
			] ),
		] );

		$props['image-rendering'] = new KeywordMatcher( [
			'auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated'
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Fonts Module Level 3
	 * @see https://www.w3.org/TR/2018/REC-css-fonts-3-20180920/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssFonts3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$css2 = $this->css2( $matcherFactory );
		$props = [];

		$matchData = FontFaceAtRuleSanitizer::fontMatchData( $matcherFactory );

		// Note: <generic-family> is syntactically a subset of <family-name>,
		// so no point in separately listing it.
		$props['font-family'] = Quantifier::hash( $matchData['familyName'] );
		$props['font-weight'] = new Alternative( [
			new KeywordMatcher( [ 'normal', 'bold', 'bolder', 'lighter' ] ),
			$matchData['numWeight'],
		] );
		$props['font-stretch'] = $matchData['font-stretch'];
		$props['font-style'] = $matchData['font-style'];
		$props['font-size'] = new Alternative( [
			new KeywordMatcher( [
				'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'larger', 'smaller'
			] ),
			$matcherFactory->lengthPercentage(),
		] );
		$props['font-size-adjust'] = new Alternative( [
			new KeywordMatcher( 'none' ), $matcherFactory->number()
		] );
		$props['font'] = new Alternative( [
			new Juxtaposition( [
				Quantifier::optional( UnorderedGroup::someOf( [
					$props['font-style'],
					new KeywordMatcher( [ 'normal', 'small-caps' ] ),
					$props['font-weight'],
					$props['font-stretch'],
				] ) ),
				$props['font-size'],
				Quantifier::optional( new Juxtaposition( [
					new DelimMatcher( '/' ),
					$css2['line-height'],
				] ) ),
				$props['font-family'],
			] ),
			new KeywordMatcher( [ 'caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar' ] )
		] );
		$props['font-synthesis'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'weight' ),
				new KeywordMatcher( 'style' ),
			] )
		] );
		$props['font-kerning'] = new KeywordMatcher( [ 'auto', 'normal', 'none' ] );
		$props['font-variant-ligatures'] = new Alternative( [
			new KeywordMatcher( [ 'normal', 'none' ] ),
			UnorderedGroup::someOf( $matchData['ligatures'] )
		] );
		$props['font-variant-position'] = new KeywordMatcher(
			array_merge( [ 'normal' ], $matchData['positionKeywords'] )
		);
		$props['font-variant-caps'] = new KeywordMatcher(
			array_merge( [ 'normal' ], $matchData['capsKeywords'] )
		);
		$props['font-variant-numeric'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( $matchData['numeric'] )
		] );
		$props['font-variant-east-asian'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( $matchData['eastAsian'] )
		] );
		$props['font-variant'] = $matchData['font-variant'];
		$props['font-feature-settings'] = $matchData['font-feature-settings'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Multi-column Layout Module
	 * @see https://www.w3.org/TR/2019/WD-css-multicol-1-20191015/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssMulticol( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$borders = $this->cssBorderBackground3( $matcherFactory );
		$props = [];

		$auto = new KeywordMatcher( 'auto' );

		$props['column-width'] = new Alternative( array_merge(
			[ $matcherFactory->length(), $auto ],
			// Additional values from https://www.w3.org/TR/2019/WD-css-sizing-3-20190522/
			$this->getSizingAdditions( $matcherFactory )
		) );
		$props['column-count'] = new Alternative( [ $matcherFactory->integer(), $auto ] );
		$props['columns'] = UnorderedGroup::someOf( [ $props['column-width'], $props['column-count'] ] );
		// Copy these from similar items in the Border module
		$props['column-rule-color'] = $borders['border-right-color'];
		$props['column-rule-style'] = $borders['border-right-style'];
		$props['column-rule-width'] = $borders['border-right-width'];
		$props['column-rule'] = $borders['border-right'];
		$props['column-span'] = new KeywordMatcher( [ 'none', 'all' ] );
		$props['column-fill'] = new KeywordMatcher( [ 'auto', 'balance', 'balance-all' ] );

		// Copy these from cssBreak3(), the duplication is allowed as long as
		// they're the identical Matcher object.
		$breaks = $this->cssBreak3( $matcherFactory );
		$props['break-before'] = $breaks['break-before'];
		$props['break-after'] = $breaks['break-after'];
		$props['break-inside'] = $breaks['break-inside'];

		// And one from cssAlign3
		$props['column-gap'] = $this->cssAlign3( $matcherFactory )['column-gap'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Overflow Module Level 3
	 * @see https://www.w3.org/TR/2018/WD-css-overflow-3-20180731/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssOverflow3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$overflow = new KeywordMatcher( [ 'visible', 'hidden', 'clip', 'scroll', 'auto' ] );
		$props['overflow'] = Quantifier::count( $overflow, 1, 2 );
		$props['overflow-x'] = $overflow;
		$props['overflow-y'] = $overflow;
		$props['overflow-inline'] = $overflow;
		$props['overflow-block'] = $overflow;

		$props['text-overflow'] = new KeywordMatcher( [ 'clip', 'ellipsis' ] );
		$props['block-overflow'] = new Alternative( [
			new KeywordMatcher( [ 'clip', 'ellipsis' ] ),
			$matcherFactory->string(),
		] );

		$props['line-clamp'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			new Juxtaposition( [
				$matcherFactory->integer(),
				Quantifier::optional( $props['block-overflow'] ),
			] ),
		] );
		$props['max-lines'] = new Alternative( [
			new KeywordMatcher( 'none' ), $matcherFactory->integer()
		] );
		$props['continue'] = new KeywordMatcher( [ 'auto', 'discard' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Basic User Interface Module Level 4
	 * @see https://www.w3.org/TR/2018/REC-css-ui-3-20180621/
	 * @see https://www.w3.org/TR/2020/WD-css-ui-4-20200102/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssUI4( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$border = $this->cssBorderBackground3( $matcherFactory );
		$props = [];

		// Copy these from similar border properties
		$props['outline-width'] = $border['border-top-width'];
		$props['outline-style'] = new Alternative( [
			new KeywordMatcher( 'auto' ), $border['border-top-style']
		] );
		$props['outline-color'] = new Alternative( [
			new KeywordMatcher( 'invert' ), $matcherFactory->color()
		] );
		$props['outline'] = UnorderedGroup::someOf( [
			$props['outline-width'], $props['outline-style'], $props['outline-color']
		] );
		$props['outline-offset'] = $matcherFactory->length();
		$props['resize'] = new KeywordMatcher( [ 'none', 'both', 'horizontal', 'vertical' ] );
		$props['cursor'] = new Juxtaposition( [
			Quantifier::star( new Juxtaposition( [
				$matcherFactory->image(),
				Quantifier::optional( new Juxtaposition( [
					$matcherFactory->number(), $matcherFactory->number()
				] ) ),
				$matcherFactory->comma(),
			] ) ),
			new KeywordMatcher( [
				'auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell',
				'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab',
				'grabbing', 'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 's-resize', 'se-resize',
				'sw-resize', 'w-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'col-resize',
				'row-resize', 'all-scroll', 'zoom-in', 'zoom-out',
			] ),
		] );
		$props['caret-color'] = new Alternative( [
			new KeywordMatcher( 'auto' ), $matcherFactory->color()
		] );
		$props['caret-shape'] = new KeywordMatcher( [ 'auto', 'bar', 'block', 'underscore' ] );
		$props['caret'] = UnorderedGroup::someOf( [ $props['caret-color'], $props['caret-shape'] ] );
		$props['nav-up'] = new Alternative( [
			new KeywordMatcher( 'auto' ),
			new Juxtaposition( [
				$matcherFactory->cssID(),
				Quantifier::optional( new Alternative( [
					new KeywordMatcher( [ 'current', 'root' ] ),
					$matcherFactory->string(),
				] ) )
			] )
		] );
		$props['nav-right'] = $props['nav-up'];
		$props['nav-down'] = $props['nav-up'];
		$props['nav-left'] = $props['nav-up'];

		$props['user-select'] = new KeywordMatcher( [ 'auto', 'text', 'none', 'contain', 'all' ] );
		// Seems potentially useful enough to let the prefixed versions work.
		$props['-moz-user-select'] = $props['user-select'];
		$props['-ms-user-select'] = $props['user-select'];
		$props['-webkit-user-select'] = $props['user-select'];

		$props['appearance'] = new KeywordMatcher( [
			'none', 'auto', 'button', 'textfield', 'menulist-button',
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Compositing and Blending Level 1
	 * @see https://www.w3.org/TR/2015/CR-compositing-1-20150113/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssCompositing1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['mix-blend-mode'] = new KeywordMatcher( [
			'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
			'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
		] );
		$props['isolation'] = new KeywordMatcher( [ 'auto', 'isolate' ] );

		// The linked spec incorrectly has this without the hash, despite the
		// textual description and examples showing it as such. The draft has it fixed.
		$props['background-blend-mode'] = Quantifier::hash( $props['mix-blend-mode'] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Writing Modes Level 4
	 * @see https://www.w3.org/TR/2019/CR-css-writing-modes-4-20190730/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssWritingModes4( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['direction'] = new KeywordMatcher( [ 'ltr', 'rtl' ] );
		$props['unicode-bidi'] = new KeywordMatcher( [
			'normal', 'embed', 'isolate', 'bidi-override', 'isolate-override', 'plaintext'
		] );
		$props['writing-mode'] = new KeywordMatcher( [
			'horizontal-tb', 'vertical-rl', 'vertical-lr', 'sideways-rl', 'sideways-lr',
		] );
		$props['text-orientation'] = new KeywordMatcher( [ 'mixed', 'upright', 'sideways' ] );
		$props['text-combine-upright'] = new Alternative( [
			new KeywordMatcher( [ 'none', 'all' ] ),
			new Juxtaposition( [
				new KeywordMatcher( [ 'digits' ] ),
				Quantifier::optional( $matcherFactory->integer() ),
			] ),
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Transitions
	 * @see https://www.w3.org/TR/2018/WD-css-transitions-1-20181011/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssTransitions( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$property = new Alternative( [
			new KeywordMatcher( [ 'all' ] ),
			$matcherFactory->customIdent( [ 'none' ] ),
		] );
		$none = new KeywordMatcher( 'none' );
		$singleEasingFunction = $matcherFactory->cssSingleEasingFunction();

		$props['transition-property'] = new Alternative( [
			$none, Quantifier::hash( $property )
		] );
		$props['transition-duration'] = Quantifier::hash( $matcherFactory->time() );
		$props['transition-timing-function'] = Quantifier::hash( $singleEasingFunction );
		$props['transition-delay'] = Quantifier::hash( $matcherFactory->time() );
		$props['transition'] = Quantifier::hash( UnorderedGroup::someOf( [
			new Alternative( [ $none, $property ] ),
			$matcherFactory->time(),
			$singleEasingFunction,
			$matcherFactory->time(),
		] ) );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Animations
	 * @see https://www.w3.org/TR/2018/WD-css-animations-1-20181011/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssAnimations( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$name = new Alternative( [
			new KeywordMatcher( [ 'none' ] ),
			$matcherFactory->customIdent( [ 'none' ] ),
			$matcherFactory->string(),
		] );
		$singleEasingFunction = $matcherFactory->cssSingleEasingFunction();
		$count = new Alternative( [
			new KeywordMatcher( 'infinite' ),
			$matcherFactory->number()
		] );
		$direction = new KeywordMatcher( [ 'normal', 'reverse', 'alternate', 'alternate-reverse' ] );
		$playState = new KeywordMatcher( [ 'running', 'paused' ] );
		$fillMode = new KeywordMatcher( [ 'none', 'forwards', 'backwards', 'both' ] );

		$props['animation-name'] = Quantifier::hash( $name );
		$props['animation-duration'] = Quantifier::hash( $matcherFactory->time() );
		$props['animation-timing-function'] = Quantifier::hash( $singleEasingFunction );
		$props['animation-iteration-count'] = Quantifier::hash( $count );
		$props['animation-direction'] = Quantifier::hash( $direction );
		$props['animation-play-state'] = Quantifier::hash( $playState );
		$props['animation-delay'] = Quantifier::hash( $matcherFactory->time() );
		$props['animation-fill-mode'] = Quantifier::hash( $fillMode );
		$props['animation'] = Quantifier::hash( UnorderedGroup::someOf( [
			$matcherFactory->time(),
			$singleEasingFunction,
			$matcherFactory->time(),
			$count,
			$direction,
			$fillMode,
			$playState,
			$name,
		] ) );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Flexible Box Layout Module Level 1
	 * @see https://www.w3.org/TR/2018/CR-css-flexbox-1-20181119/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssFlexbox3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$props['flex-direction'] = new KeywordMatcher( [
			'row', 'row-reverse', 'column', 'column-reverse'
		] );
		$props['flex-wrap'] = new KeywordMatcher( [ 'nowrap', 'wrap', 'wrap-reverse' ] );
		$props['flex-flow'] = UnorderedGroup::someOf( [ $props['flex-direction'], $props['flex-wrap'] ] );
		$props['order'] = $matcherFactory->integer();
		$props['flex-grow'] = $matcherFactory->number();
		$props['flex-shrink'] = $matcherFactory->number();
		$props['flex-basis'] = new Alternative( [
			new KeywordMatcher( [ 'content' ] ),
			$this->cssSizing3( $matcherFactory )['width']
		] );
		$props['flex'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new Juxtaposition( [ $props['flex-grow'], Quantifier::optional( $props['flex-shrink'] ) ] ),
				$props['flex-basis'],
			] )
		] );

		// The alignment module supersedes the ones in flexbox. Copying is ok as long as
		// it's the identical object.
		$align = $this->cssAlign3( $matcherFactory );
		$props['justify-content'] = $align['justify-content'];
		$props['align-items'] = $align['align-items'];
		$props['align-self'] = $align['align-self'];
		$props['align-content'] = $align['align-content'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Transforms Module Level 1
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-transforms-1-20190214/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssTransforms1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$a = $matcherFactory->angle();
		$az = new Alternative( [
			$matcherFactory->zero(),
			$a,
		] );
		$n = $matcherFactory->number();
		$l = $matcherFactory->length();
		$ol = Quantifier::optional( $l );
		$lp = $matcherFactory->lengthPercentage();
		$center = new KeywordMatcher( 'center' );
		$leftRight = new KeywordMatcher( [ 'left', 'right' ] );
		$topBottom = new KeywordMatcher( [ 'top', 'bottom' ] );

		$props['transform'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::plus( new Alternative( [
				new FunctionMatcher( 'matrix', Quantifier::hash( $n, 6, 6 ) ),
				new FunctionMatcher( 'translate', Quantifier::hash( $lp, 1, 2 ) ),
				new FunctionMatcher( 'translateX', $lp ),
				new FunctionMatcher( 'translateY', $lp ),
				new FunctionMatcher( 'scale', Quantifier::hash( $n, 1, 2 ) ),
				new FunctionMatcher( 'scaleX', $n ),
				new FunctionMatcher( 'scaleY', $n ),
				new FunctionMatcher( 'rotate', $az ),
				new FunctionMatcher( 'skew', Quantifier::hash( $az, 1, 2 ) ),
				new FunctionMatcher( 'skewX', $az ),
				new FunctionMatcher( 'skewY', $az ),
			] ) )
		] );

		$props['transform-origin'] = new Alternative( [
			new Alternative( [ $center, $leftRight, $topBottom, $lp ] ),
			new Juxtaposition( [
				new Alternative( [ $center, $leftRight, $lp ] ),
				new Alternative( [ $center, $topBottom, $lp ] ),
				$ol
			] ),
			new Juxtaposition( [
				UnorderedGroup::allOf( [
					new Alternative( [ $center, $leftRight ] ),
					new Alternative( [ $center, $topBottom ] ),
				] ),
				$ol,
			] )
		] );
		$props['transform-box'] = new KeywordMatcher( [
			'content-box', 'border-box', 'fill-box', 'stroke-box', 'view-box'
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Text Module Level 3
	 * @see https://www.w3.org/TR/2019/WD-css-text-3-20191113/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssText3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['text-transform'] = new Alternative( [
			new KeywordMatcher( [ 'none' ] ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( [ 'capitalize', 'uppercase', 'lowercase', 'full-width' ] ),
				new KeywordMatcher( [ 'full-width' ] ),
				new KeywordMatcher( [ 'full-size-kana' ] ),
			] ),
		] );
		$props['white-space'] = new KeywordMatcher( [
			'normal', 'pre', 'nowrap', 'pre-wrap', 'break-spaces', 'pre-line'
		] );
		$props['tab-size'] = new Alternative( [ $matcherFactory->number(), $matcherFactory->length() ] );
		$props['line-break'] = new KeywordMatcher( [ 'auto', 'loose', 'normal', 'strict', 'anywhere' ] );
		$props['word-break'] = new KeywordMatcher( [ 'normal', 'keep-all', 'break-all', 'break-word' ] );
		$props['hyphens'] = new KeywordMatcher( [ 'none', 'manual', 'auto' ] );
		$props['word-wrap'] = new KeywordMatcher( [ 'normal', 'break-word', 'anywhere' ] );
		$props['overflow-wrap'] = $props['word-wrap'];
		$props['text-align'] = new KeywordMatcher( [
			'start', 'end', 'left', 'right', 'center', 'justify', 'match-parent', 'justify-all'
		] );
		$props['text-align-all'] = new KeywordMatcher( [
			'start', 'end', 'left', 'right', 'center', 'justify', 'match-parent'
		] );
		$props['text-align-last'] = new KeywordMatcher( [
			'auto', 'start', 'end', 'left', 'right', 'center', 'justify', 'match-parent'
		] );
		$props['text-justify'] = new KeywordMatcher( [
			'auto', 'none', 'inter-word', 'inter-character'
		] );
		$props['word-spacing'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			$matcherFactory->length()
		] );
		$props['letter-spacing'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			$matcherFactory->length()
		] );
		$props['text-indent'] = UnorderedGroup::allOf( [
			$matcherFactory->lengthPercentage(),
			Quantifier::optional( new KeywordMatcher( 'hanging' ) ),
			Quantifier::optional( new KeywordMatcher( 'each-line' ) ),
		] );
		$props['hanging-punctuation'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'first' ),
				new KeywordMatcher( [ 'force-end', 'allow-end' ] ),
				new KeywordMatcher( 'last' ),
			] )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Text Decoration Module Level 3
	 * @see https://www.w3.org/TR/2019/CR-css-text-decor-3-20190813/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssTextDecor3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['text-decoration-line'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'underline' ),
				new KeywordMatcher( 'overline' ),
				new KeywordMatcher( 'line-through' ),
				// new KeywordMatcher( 'blink' ), // NOOO!!!
			] )
		] );
		$props['text-decoration-color'] = $matcherFactory->color();
		$props['text-decoration-style'] = new KeywordMatcher( [
			'solid', 'double', 'dotted', 'dashed', 'wavy'
		] );
		$props['text-decoration'] = UnorderedGroup::someOf( [
			$props['text-decoration-line'],
			$props['text-decoration-style'],
			$props['text-decoration-color'],
		] );
		$props['text-underline-position'] = new Alternative( [
			new KeywordMatcher( 'auto' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'under' ),
				new KeywordMatcher( [ 'left', 'right' ] ),
			] )
		] );
		$props['text-emphasis-style'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( [ 'filled', 'open' ] ),
				new KeywordMatcher( [ 'dot', 'circle', 'double-circle', 'triangle', 'sesame' ] )
			] ),
			$matcherFactory->string(),
		] );
		$props['text-emphasis-color'] = $matcherFactory->color();
		$props['text-emphasis'] = UnorderedGroup::someOf( [
			$props['text-emphasis-style'],
			$props['text-emphasis-color'],
		] );
		$props['text-emphasis-position'] = UnorderedGroup::allOf( [
			new KeywordMatcher( [ 'over', 'under' ] ),
			Quantifier::optional( new KeywordMatcher( [ 'right', 'left' ] ) ),
		] );
		$props['text-shadow'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::hash( UnorderedGroup::allOf( [
				Quantifier::count( $matcherFactory->length(), 2, 3 ),
				Quantifier::optional( $matcherFactory->color() ),
			] ) )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Box Alignment Module Level 3
	 * @see https://www.w3.org/TR/2018/WD-css-align-3-20181206/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssAlign3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$normal = new KeywordMatcher( 'normal' );
		$normalStretch = new KeywordMatcher( [ 'normal', 'stretch' ] );
		$autoNormalStretch = new KeywordMatcher( [ 'auto', 'normal', 'stretch' ] );
		$overflowPosition = Quantifier::optional( new KeywordMatcher( [ 'safe', 'unsafe' ] ) );
		$baselinePosition = new Juxtaposition( [
			Quantifier::optional( new KeywordMatcher( [ 'first', 'last' ] ) ),
			new KeywordMatcher( 'baseline' )
		] );
		$contentDistribution = new KeywordMatcher( [
			'space-between', 'space-around', 'space-evenly', 'stretch'
		] );
		$overflowAndSelfPosition = new Juxtaposition( [
			$overflowPosition,
			new KeywordMatcher( [
				'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end',
			] ),
		] );
		$overflowAndSelfPositionLR = new Juxtaposition( [
			$overflowPosition,
			new KeywordMatcher( [
				'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end', 'left', 'right',
			] ),
		] );
		$overflowAndContentPos = new Juxtaposition( [
			$overflowPosition,
			new KeywordMatcher( [ 'center', 'start', 'end', 'flex-start', 'flex-end' ] ),
		] );
		$overflowAndContentPosLR = new Juxtaposition( [
			$overflowPosition,
			new KeywordMatcher( [ 'center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right' ] ),
		] );

		$props['align-content'] = new Alternative( [
			$normal,
			$baselinePosition,
			$contentDistribution,
			$overflowAndContentPos,
		] );
		$props['justify-content'] = new Alternative( [
			$normal,
			$contentDistribution,
			$overflowAndContentPosLR,
		] );
		$props['place-content'] = new Juxtaposition( [
			$props['align-content'], Quantifier::optional( $props['justify-content'] )
		] );
		$props['align-self'] = new Alternative( [
			$autoNormalStretch,
			$baselinePosition,
			$overflowAndSelfPosition,
		] );
		$props['justify-self'] = new Alternative( [
			$autoNormalStretch,
			$baselinePosition,
			$overflowAndSelfPositionLR,
		] );
		$props['place-self'] = new Juxtaposition( [
			$props['align-self'], Quantifier::optional( $props['justify-self'] )
		] );
		$props['align-items'] = new Alternative( [
			$normalStretch,
			$baselinePosition,
			$overflowAndSelfPosition,
		] );
		$props['justify-items'] = new Alternative( [
			$normalStretch,
			$baselinePosition,
			$overflowAndSelfPositionLR,
			new KeywordMatcher( 'legacy' ),
			UnorderedGroup::allOf( [
				new KeywordMatcher( 'legacy' ),
				new KeywordMatcher( [ 'left', 'right', 'center' ] ),
			] ),
		] );
		$props['place-items'] = new Juxtaposition( [
			$props['align-items'], Quantifier::optional( $props['justify-items'] )
		] );
		$props['row-gap'] = new Alternative( [ $normal, $matcherFactory->lengthPercentage() ] );
		$props['column-gap'] = $props['row-gap'];
		$props['gap'] = new Juxtaposition( [
			$props['row-gap'], Quantifier::optional( $props['column-gap'] )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Fragmentation Module Level 3
	 * @see https://www.w3.org/TR/2018/CR-css-break-3-20181204/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssBreak3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$props['break-before'] = new KeywordMatcher( [
			'auto', 'avoid', 'avoid-page', 'page', 'left', 'right', 'recto', 'verso', 'avoid-column',
			'column', 'avoid-region', 'region'
		] );
		$props['break-after'] = $props['break-before'];
		$props['break-inside'] = new KeywordMatcher( [
			'auto', 'avoid', 'avoid-page', 'avoid-column', 'avoid-region'
		] );
		$props['orphans'] = $matcherFactory->integer();
		$props['widows'] = $matcherFactory->integer();
		$props['box-decoration-break'] = new KeywordMatcher( [ 'slice', 'clone' ] );
		$props['page-break-before'] = new KeywordMatcher( [
			'auto', 'always', 'avoid', 'left', 'right'
		] );
		$props['page-break-after'] = $props['page-break-before'];
		$props['page-break-inside'] = new KeywordMatcher( [ 'auto', 'avoid' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Grid Layout Module Level 1
	 * @see https://www.w3.org/TR/2017/CR-css-grid-1-20171214/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssGrid1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$comma = $matcherFactory->comma();
		$slash = new DelimMatcher( '/' );
		$customIdent = $matcherFactory->customIdent( [ 'span' ] );
		$lineNamesO = Quantifier::optional( new BlockMatcher(
			Token::T_LEFT_BRACKET, Quantifier::star( $customIdent )
		) );
		$trackBreadth = new Alternative( [
			$matcherFactory->lengthPercentage(),
			new TokenMatcher( Token::T_DIMENSION, static function ( Token $t ) {
				return $t->value() >= 0 && !strcasecmp( $t->unit(), 'fr' );
			} ),
			new KeywordMatcher( [ 'min-content', 'max-content', 'auto' ] )
		] );
		$inflexibleBreadth = new Alternative( [
			$matcherFactory->lengthPercentage(),
			new KeywordMatcher( [ 'min-content', 'max-content', 'auto' ] )
		] );
		$fixedBreadth = $matcherFactory->lengthPercentage();
		$trackSize = new Alternative( [
			$trackBreadth,
			new FunctionMatcher( 'minmax',
				new Juxtaposition( [ $inflexibleBreadth, $trackBreadth ], true )
			),
			new FunctionMatcher( 'fit-content', $matcherFactory->lengthPercentage() )
		] );
		$fixedSize = new Alternative( [
			$fixedBreadth,
			new FunctionMatcher( 'minmax', new Juxtaposition( [ $fixedBreadth, $trackBreadth ], true ) ),
			new FunctionMatcher( 'minmax',
				new Juxtaposition( [ $inflexibleBreadth, $fixedBreadth ], true )
			),
		] );
		$trackRepeat = new FunctionMatcher( 'repeat', new Juxtaposition( [
			$matcherFactory->integer(),
			$comma,
			Quantifier::plus( new Juxtaposition( [ $lineNamesO, $trackSize ] ) ),
			$lineNamesO
		] ) );
		$autoRepeat = new FunctionMatcher( 'repeat', new Juxtaposition( [
			new KeywordMatcher( [ 'auto-fill', 'auto-fit' ] ),
			$comma,
			Quantifier::plus( new Juxtaposition( [ $lineNamesO, $fixedSize ] ) ),
			$lineNamesO
		] ) );
		$fixedRepeat = new FunctionMatcher( 'repeat', new Juxtaposition( [
			$matcherFactory->integer(),
			$comma,
			Quantifier::plus( new Juxtaposition( [ $lineNamesO, $fixedSize ] ) ),
			$lineNamesO
		] ) );
		$trackList = new Juxtaposition( [
			Quantifier::plus( new Juxtaposition( [
				$lineNamesO, new Alternative( [ $trackSize, $trackRepeat ] )
			] ) ),
			$lineNamesO
		] );
		$autoTrackList = new Juxtaposition( [
			Quantifier::star( new Juxtaposition( [
				$lineNamesO, new Alternative( [ $fixedSize, $fixedRepeat ] )
			] ) ),
			$lineNamesO,
			$autoRepeat,
			Quantifier::star( new Juxtaposition( [
				$lineNamesO, new Alternative( [ $fixedSize, $fixedRepeat ] )
			] ) ),
			$lineNamesO,
		] );
		$explicitTrackList = new Juxtaposition( [
			Quantifier::plus( new Juxtaposition( [ $lineNamesO, $trackSize ] ) ),
			$lineNamesO
		] );
		$autoDense = UnorderedGroup::allOf( [
			new KeywordMatcher( 'auto-flow' ),
			Quantifier::optional( new KeywordMatcher( 'dense' ) )
		] );

		$props['grid-template-columns'] = new Alternative( [
			new KeywordMatcher( 'none' ), $trackList, $autoTrackList
		] );
		$props['grid-template-rows'] = $props['grid-template-columns'];
		$props['grid-template-areas'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::plus( $matcherFactory->string() ),
		] );
		$props['grid-template'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			new Juxtaposition( [ $props['grid-template-rows'], $slash, $props['grid-template-columns'] ] ),
			new Juxtaposition( [
				Quantifier::plus( new Juxtaposition( [
					$lineNamesO, $matcherFactory->string(), Quantifier::optional( $trackSize ), $lineNamesO
				] ) ),
				Quantifier::optional( new Juxtaposition( [ $slash, $explicitTrackList ] ) ),
			] )
		] );
		$props['grid-auto-columns'] = Quantifier::plus( $trackSize );
		$props['grid-auto-rows'] = $props['grid-auto-columns'];
		$props['grid-auto-flow'] = UnorderedGroup::someOf( [
			new KeywordMatcher( [ 'row', 'column' ] ),
			new KeywordMatcher( 'dense' )
		] );
		$props['grid'] = new Alternative( [
			$props['grid-template'],
			new Juxtaposition( [
				$props['grid-template-rows'],
				$slash,
				$autoDense,
				Quantifier::optional( $props['grid-auto-columns'] ),
			] ),
			new Juxtaposition( [
				$autoDense,
				Quantifier::optional( $props['grid-auto-rows'] ),
				$slash,
				$props['grid-template-columns'],
			] )
		] );

		$gridLine = new Alternative( [
			new KeywordMatcher( 'auto' ),
			$customIdent,
			UnorderedGroup::allOf( [
				$matcherFactory->integer(),
				Quantifier::optional( $customIdent )
			] ),
			UnorderedGroup::allOf( [
				new KeywordMatcher( 'span' ),
				UnorderedGroup::someOf( [
					$matcherFactory->integer(),
					$customIdent,
				] )
			] )
		] );
		$props['grid-row-start'] = $gridLine;
		$props['grid-column-start'] = $gridLine;
		$props['grid-row-end'] = $gridLine;
		$props['grid-column-end'] = $gridLine;
		$props['grid-row'] = new Juxtaposition( [
			$gridLine, Quantifier::optional( new Juxtaposition( [ $slash, $gridLine ] ) )
		] );
		$props['grid-column'] = $props['grid-row'];
		$props['grid-area'] = new Juxtaposition( [
			$gridLine, Quantifier::count( new Juxtaposition( [ $slash, $gridLine ] ), 0, 3 )
		] );

		// Replaced by the alignment module
		$align = $this->cssAlign3( $matcherFactory );
		$props['grid-row-gap'] = $align['row-gap'];
		$props['grid-column-gap'] = $align['column-gap'];
		$props['grid-gap'] = $align['gap'];

		// Also, these are copied from the alignment module. Copying is ok as long as
		// it's the identical object.
		$props['row-gap'] = $align['row-gap'];
		$props['column-gap'] = $align['column-gap'];
		$props['gap'] = $align['gap'];
		$props['justify-self'] = $align['justify-self'];
		$props['justify-items'] = $align['justify-items'];
		$props['align-self'] = $align['align-self'];
		$props['align-items'] = $align['align-items'];
		$props['justify-content'] = $align['justify-content'];
		$props['align-content'] = $align['align-content'];

		// Grid uses Flexbox's order property too. Copying is ok as long as
		// it's the identical object.
		$props['order'] = $this->cssFlexbox3( $matcherFactory )['order'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Filter Effects Module Level 1
	 * @see https://www.w3.org/TR/2018/WD-filter-effects-1-20181218/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssFilter1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$onp = Quantifier::optional( $matcherFactory->numberPercentage() );

		$props = [];

		$props['filter'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::plus( new Alternative( [
				new FunctionMatcher( 'blur', Quantifier::optional( $matcherFactory->length() ) ),
				new FunctionMatcher( 'brightness', $onp ),
				new FunctionMatcher( 'contrast', $onp ),
				new FunctionMatcher( 'drop-shadow', UnorderedGroup::allOf( [
					Quantifier::optional( $matcherFactory->color() ),
					Quantifier::count( $matcherFactory->length(), 2, 3 ),
				] ) ),
				new FunctionMatcher( 'grayscale', $onp ),
				new FunctionMatcher( 'hue-rotate', Quantifier::optional( new Alternative( [
					$matcherFactory->zero(),
					$matcherFactory->angle(),
				] ) ) ),
				new FunctionMatcher( 'invert', $onp ),
				new FunctionMatcher( 'opacity', $onp ),
				new FunctionMatcher( 'saturate', $onp ),
				new FunctionMatcher( 'sepia', $onp ),
				$matcherFactory->url( 'svg' ),
			] ) )
		] );
		$props['flood-color'] = $matcherFactory->color();
		$props['flood-opacity'] = $matcherFactory->numberPercentage();
		$props['color-interpolation-filters'] = new KeywordMatcher( [ 'auto', 'sRGB', 'linearRGB' ] );
		$props['lighting-color'] = $matcherFactory->color();

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Shapes and masking share these basic shapes
	 * @see https://www.w3.org/TR/2014/CR-css-shapes-1-20140320/#basic-shape-functions
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher
	 */
	protected function basicShapes( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$border = $this->cssBorderBackground3( $matcherFactory );
		$sa = $matcherFactory->lengthPercentage();
		$sr = new Alternative( [
			$sa,
			new KeywordMatcher( [ 'closest-side', 'farthest-side' ] ),
		] );

		$basicShape = new Alternative( [
			new FunctionMatcher( 'inset', new Juxtaposition( [
				Quantifier::count( $sa, 1, 4 ),
				Quantifier::optional( new Juxtaposition( [
					new KeywordMatcher( 'round' ), $border['border-radius']
				] ) )
			] ) ),
			new FunctionMatcher( 'circle', new Juxtaposition( [
				Quantifier::optional( $sr ),
				Quantifier::optional( new Juxtaposition( [
					new KeywordMatcher( 'at' ), $matcherFactory->position()
				] ) )
			] ) ),
			new FunctionMatcher( 'ellipse', new Juxtaposition( [
				Quantifier::optional( Quantifier::count( $sr, 2, 2 ) ),
				Quantifier::optional( new Juxtaposition( [
					new KeywordMatcher( 'at' ), $matcherFactory->position()
				] ) )
			] ) ),
			new FunctionMatcher( 'polygon', new Juxtaposition( [
				Quantifier::optional( new KeywordMatcher( [ 'nonzero', 'evenodd' ] ) ),
				Quantifier::hash( Quantifier::count( $sa, 2, 2 ) ),
			], true ) ),
		] );

		$this->cache[__METHOD__] = $basicShape;
		return $basicShape;
	}

	/**
	 * Properties for CSS Shapes Module Level 1
	 * @see https://www.w3.org/TR/2014/CR-css-shapes-1-20140320/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssShapes1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$shapeBoxKW = $this->backgroundTypes( $matcherFactory )['boxKeywords'];
		$shapeBoxKW[] = 'margin-box';

		$props = [];

		$props['shape-outside'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				$this->basicShapes( $matcherFactory ),
				new KeywordMatcher( $shapeBoxKW ),
			] ),
			$matcherFactory->url( 'image' ),
		] );
		$props['shape-image-threshold'] = $matcherFactory->number();
		$props['shape-margin'] = $matcherFactory->lengthPercentage();

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Masking Module Level 1
	 * @see https://www.w3.org/TR/2014/CR-css-masking-1-20140826/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssMasking1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$slash = new DelimMatcher( '/' );
		$bgtypes = $this->backgroundTypes( $matcherFactory );
		$bg = $this->cssBorderBackground3( $matcherFactory );
		$geometryBoxKeywords = array_merge( $bgtypes['boxKeywords'], [
			'margin-box', 'fill-box', 'stroke-box', 'view-box'
		] );
		$geometryBox = new KeywordMatcher( $geometryBoxKeywords );
		$maskRef = new Alternative( [
			new KeywordMatcher( 'none' ),
			$matcherFactory->image(),
			$matcherFactory->url( 'svg' ),
		] );
		$maskMode = new KeywordMatcher( [ 'alpha', 'luminance', 'auto' ] );
		$maskClip = new KeywordMatcher( array_merge( $geometryBoxKeywords, [ 'no-clip' ] ) );
		$maskComposite = new KeywordMatcher( [ 'add', 'subtract', 'intersect', 'exclude' ] );

		$props = [];

		$props['clip-path'] = new Alternative( [
			$matcherFactory->url( 'svg' ),
			UnorderedGroup::someOf( [
				$this->basicShapes( $matcherFactory ),
				$geometryBox,
			] ),
			new KeywordMatcher( 'none' ),
		] );
		$props['clip-rule'] = new KeywordMatcher( [ 'nonzero', 'evenodd' ] );
		$props['mask-image'] = Quantifier::hash( $maskRef );
		$props['mask-mode'] = Quantifier::hash( $maskMode );
		$props['mask-repeat'] = $bg['background-repeat'];
		$props['mask-position'] = Quantifier::hash( $matcherFactory->position() );
		$props['mask-clip'] = Quantifier::hash( $maskClip );
		$props['mask-origin'] = Quantifier::hash( $geometryBox );
		$props['mask-size'] = $bg['background-size'];
		$props['mask-composite'] = Quantifier::hash( $maskComposite );
		$props['mask'] = Quantifier::hash( UnorderedGroup::someOf( [
			new Juxtaposition( [ $maskRef, Quantifier::optional( $maskMode ) ] ),
			new Juxtaposition( [
				$matcherFactory->position(),
				Quantifier::optional( new Juxtaposition( [ $slash, $bgtypes['bgsize'] ] ) ),
			] ),
			$bgtypes['bgrepeat'],
			$geometryBox,
			$maskClip,
			$maskComposite,
		] ) );
		$props['mask-border-source'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			$matcherFactory->image(),
		] );
		$props['mask-border-mode'] = new KeywordMatcher( [ 'luminance', 'alpha' ] );
		// Different from border-image-slice, sigh
		$props['mask-border-slice'] = new Juxtaposition( [
			Quantifier::count( $matcherFactory->numberPercentage(), 1, 4 ),
			Quantifier::optional( new KeywordMatcher( 'fill' ) ),
		] );
		$props['mask-border-width'] = $bg['border-image-width'];
		$props['mask-border-outset'] = $bg['border-image-outset'];
		$props['mask-border-repeat'] = $bg['border-image-repeat'];
		$props['mask-border'] = UnorderedGroup::someOf( [
			$props['mask-border-source'],
			new Juxtaposition( [
				$props['mask-border-slice'],
				Quantifier::optional( new Juxtaposition( [
					$slash,
					Quantifier::optional( $props['mask-border-width'] ),
					Quantifier::optional( new Juxtaposition( [
						$slash,
						$props['mask-border-outset'],
					] ) ),
				] ) ),
			] ),
			$props['mask-border-repeat'],
			$props['mask-border-mode'],
		] );
		$props['mask-type'] = new KeywordMatcher( [ 'luminance', 'alpha' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Additional keywords and functions from CSS Intrinsic and Extrinsic Sizing Level 3
	 * @see https://www.w3.org/TR/2019/WD-css-sizing-3-20190522/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array of matchers
	 */
	protected function getSizingAdditions( MatcherFactory $matcherFactory ) {
		if ( !isset( $this->cache[__METHOD__] ) ) {
			$lengthPct = $matcherFactory->lengthPercentage();
			$this->cache[__METHOD__] = [
				new KeywordMatcher( [
					'max-content', 'min-content',
				] ),
				new FunctionMatcher( 'fit-content', $lengthPct ),
				// Browser-prefixed versions of the function, needed by Firefox as of January 2020
				new FunctionMatcher( '-moz-fit-content', $lengthPct ),
			];
		}
		return $this->cache[__METHOD__];
	}

	/**
	 * Properties for CSS Intrinsic and Extrinsic Sizing Level 3
	 * @see https://www.w3.org/TR/2019/WD-css-sizing-3-20190522/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssSizing3( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$none = new KeywordMatcher( 'none' );
		$auto = new KeywordMatcher( 'auto' );
		$lengthPct = $matcherFactory->lengthPercentage();
		$sizingValues = array_merge( [ $lengthPct ], $this->getSizingAdditions( $matcherFactory ) );

		$props = [];
		$props['width'] = new Alternative( array_merge( [ $auto ], $sizingValues ) );
		$props['min-width'] = $props['width'];
		$props['max-width'] = new Alternative( array_merge( [ $none ], $sizingValues ) );
		$props['height'] = $props['width'];
		$props['min-height'] = $props['min-width'];
		$props['max-height'] = $props['max-width'];

		$props['box-sizing'] = new KeywordMatcher( [ 'content-box', 'border-box' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}
}

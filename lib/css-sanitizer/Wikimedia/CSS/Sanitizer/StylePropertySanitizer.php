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

	/** @var Matcher[][] */
	protected $cache = [];

	/**
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		parent::__construct( [], $matcherFactory->cssWideKeywords() );

		$this->addKnownProperties( [
			// https://www.w3.org/TR/2016/CR-css-cascade-3-20160519/#all-shorthand
			'all' => $matcherFactory->cssWideKeywords(),

			// https://www.w3.org/TR/2015/REC-pointerevents-20150224/#the-touch-action-css-property
			'touch-action' => new Alternative( [
				new KeywordMatcher( [ 'auto', 'none', 'manipulation' ] ),
				UnorderedGroup::someOf( [
					new KeywordMatcher( 'pan-x' ),
					new KeywordMatcher( 'pan-y' ),
				] ),
			] ),

			// https://www.w3.org/TR/2013/WD-css3-page-20130314/#using-named-pages
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
		$this->addKnownProperties( $this->cssWritingModes3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTransitions( $matcherFactory ) );
		$this->addKnownProperties( $this->cssAnimations( $matcherFactory ) );
		$this->addKnownProperties( $this->cssFlexbox3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTransforms1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssText3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssTextDecor3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssAlign3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssBreak3( $matcherFactory ) );
		$this->addKnownProperties( $this->cssSpeech( $matcherFactory ) );
		$this->addKnownProperties( $this->cssGrid1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssFilter1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssShapes1( $matcherFactory ) );
		$this->addKnownProperties( $this->cssMasking1( $matcherFactory ) );
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
		$props['width'] = $autoLengthPct;
		$props['min-width'] = $matcherFactory->lengthPercentage();
		$props['max-width'] = new Alternative( [ $none, $matcherFactory->lengthPercentage() ] );
		$props['height'] = $autoLengthPct;
		$props['min-height'] = $matcherFactory->lengthPercentage();
		$props['max-height'] = $props['max-width'];
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
				$matcherFactory->image(), // Replaces <url> per https://www.w3.org/TR/css3-images/#placement
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
			$matcherFactory->image() // Replaces <url> per https://www.w3.org/TR/css3-images/#placement
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
	 * @see https://www.w3.org/TR/2017/WD-css-display-3-20170126/
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

		$props['display'] = new Alternative( [
			UnorderedGroup::someOf( [ // <display-outside> || <display-inside>
				new KeywordMatcher( [ 'block', 'inline', 'run-in' ] ),
				new KeywordMatcher( [ 'flow', 'flow-root', 'table', 'flex', 'grid', 'ruby' ] ),
			] ),
			UnorderedGroup::allOf( [ // <display-listitem>
				new KeywordMatcher( 'list-item' ),
				Quantifier::optional( new KeywordMatcher( [ 'block', 'inline', 'run-in' ] ) ),
				Quantifier::optional( new KeywordMatcher( [ 'flow', 'flow-root' ] ) ),
			] ),
			new KeywordMatcher( [
				// <display-internal>
				'table-row-group', 'table-header-group', 'table-footer-group', 'table-row', 'table-cell',
				'table-column-group', 'table-column', 'table-caption', 'ruby-base', 'ruby-text',
				'ruby-base-container', 'ruby-text-container',
				// <display-box>
				'contents', 'none',
				// <display-legacy>
				'inline-block', 'inline-list-item', 'inline-table', 'inline-flex', 'inline-grid',
				// https://www.w3.org/TR/2017/CR-css-grid-1-20170209/
				'subgrid',
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
	 * @see https://www.w3.org/TR/2011/REC-css3-color-20110607/
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
	 * @see https://www.w3.org/TR/2014/CR-css3-background-20140909/
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
		$position = $matcherFactory->position();
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
			$bgimage,
			new Juxtaposition( [
				$position, Quantifier::optional( new Juxtaposition( [ $slash, $bgsize ] ) )
			] ),
			$bgrepeat,
			$bgattach,
			$box,
			$box,
			$matcherFactory->color(),
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
	 * Properties for CSS Image Values and Replaced Content Module Level 3
	 * @see https://www.w3.org/TR/2012/CR-css3-images-20120417/
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
		$props['image-resolution'] = UnorderedGroup::allOf( [
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'from-image' ),
				$matcherFactory->resolution(),
			] ),
			Quantifier::optional( new KeywordMatcher( 'snap' ) )
		] );
		$props['image-orientation'] = $matcherFactory->angle();

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Fonts Module Level 3
	 * @see https://www.w3.org/TR/2013/CR-css-fonts-3-20131003/
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
			new TokenMatcher( Token::T_NUMBER, function ( Token $t ) {
				return $t->typeFlag() === 'integer' && preg_match( '/^[1-9]00$/', $t->representation() );
			} ),
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
		$props['font-variant-position'] = new KeywordMatcher( [ 'normal', 'sub', 'super' ] );
		$props['font-variant-caps'] = new KeywordMatcher(
			array_merge( [ 'normal' ], $matchData['capsKeywords'] )
		);
		$props['font-variant-numeric'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( $matchData['numeric'] )
		] );
		$props['font-variant-alternates'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( $matchData['alt'] )
		] );
		$props['font-variant-east-asian'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( $matchData['eastAsian'] )
		] );
		$props['font-variant'] = $matchData['font-variant'];
		$props['font-feature-settings'] = $matchData['font-feature-settings'];
		$props['font-language-override'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			new TokenMatcher( Token::T_STRING, function ( Token $t ) {
				return preg_match( '/^[A-Z]{3}$/', $t->value() );
			} ),
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Multi-column Layout Module
	 * @see https://www.w3.org/TR/2011/CR-css3-multicol-20110412/
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
		$breaks = $this->cssBreak3( $matcherFactory );
		$props = [];

		$auto = new KeywordMatcher( 'auto' );
		$normal = new KeywordMatcher( 'normal' );

		$props['column-width'] = new Alternative( [ $matcherFactory->length(), $auto ] );
		$props['column-count'] = new Alternative( [ $matcherFactory->integer(), $auto ] );
		$props['columns'] = UnorderedGroup::someOf( [ $props['column-width'], $props['column-count'] ] );
		$props['column-gap'] = new Alternative( [ $matcherFactory->length(), $normal ] );
		// Copy these from similar items in the Border module
		$props['column-rule-color'] = $borders['border-right-color'];
		$props['column-rule-style'] = $borders['border-right-style'];
		$props['column-rule-width'] = $borders['border-right-width'];
		$props['column-rule'] = $borders['border-right'];
		$props['column-span'] = new KeywordMatcher( [ 'none', 'all' ] );
		$props['column-fill'] = new KeywordMatcher( [ 'auto', 'balance' ] );

		// Copy these from cssBreak3(), the duplication is allowed as long as
		// they're the identical Matcher object.
		$props['break-before'] = $breaks['break-before'];
		$props['break-after'] = $breaks['break-after'];
		$props['break-inside'] = $breaks['break-inside'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Overflow Module Level 3
	 * @see https://www.w3.org/TR/2016/WD-css-overflow-3-20160531/
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

		$props['overflow'] = new KeywordMatcher( [ 'visible', 'hidden', 'clip', 'scroll', 'auto' ] );
		$props['overflow-x'] = $props['overflow'];
		$props['overflow-y'] = $props['overflow'];
		$props['max-lines'] = new Alternative( [
			new KeywordMatcher( 'none' ), $matcherFactory->integer()
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Basic User Interface Module Level 4
	 * @see https://www.w3.org/TR/2017/CR-css-ui-3-20170302/
	 * @see https://www.w3.org/TR/2015/WD-css-ui-4-20150922/
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

		$props['box-sizing'] = new KeywordMatcher( [ 'content-box', 'border-box' ] );
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
		$props['text-overflow'] = Quantifier::count( new Alternative( [
			new KeywordMatcher( [ 'clip', 'ellipsis', 'fade' ] ),
			new FunctionMatcher( 'fade', $matcherFactory->lengthPercentage() ),
			// Including <string> and count that were removed in the latest UI3
			// but added in the UI4 editor's draft.
			$matcherFactory->string(),
		] ), 1, 2 );
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
		// Skipping caret-animation, it has been removed in the latest editor's draft
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

		$props['appearance'] = new KeywordMatcher( [ 'auto', 'none' ] );

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
	 * Properties for CSS Writing Modes Level 3
	 * @see https://www.w3.org/TR/2015/CR-css-writing-modes-3-20151215/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssWritingModes3( MatcherFactory $matcherFactory ) {
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
			'horizontal-tb', 'vertical-rl', 'vertical-lr', 'sideways-rl', 'sideways-lr'
		] );
		$props['text-orientation'] = new KeywordMatcher( [ 'mixed', 'upright', 'sideways' ] );
		$props['text-combine-upright'] = new Alternative( [
			new KeywordMatcher( [ 'none', 'all' ] ),
			new Juxtaposition( [
				new KeywordMatcher( 'digits' ),
				Quantifier::optional( $matcherFactory->integer() )
			] )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Transitions and animations share these functions
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher
	 */
	protected function transitionTimingFunction( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$timingFunction = new Alternative( [
			new KeywordMatcher( [
				'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'
			] ),
			new FunctionMatcher( 'steps', new Juxtaposition( [
				$matcherFactory->integer(),
				Quantifier::optional( new KeywordMatcher( [ 'start', 'end' ] ) ),
			], true ) ),
			new FunctionMatcher( 'cubic-bezier', Quantifier::hash( $matcherFactory->number(), 4, 4 ) ),
		] );

		$this->cache[__METHOD__] = $timingFunction;
		return $timingFunction;
	}

	/**
	 * Properties for CSS Transitions
	 * @see https://www.w3.org/TR/2013/WD-css3-transitions-20131119/
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
		$none = new KeywordMatcher( 'none' );
		$timingFunction = $this->transitionTimingFunction( $matcherFactory );

		$props['transition-property'] = new Alternative( [
			$none, Quantifier::hash( $matcherFactory->ident() )
		] );
		$props['transition-duration'] = Quantifier::hash( $matcherFactory->time() );
		$props['transition-timing-function'] = Quantifier::hash( $timingFunction );
		$props['transition-delay'] = Quantifier::hash( $matcherFactory->time() );
		$props['transition'] = Quantifier::hash( UnorderedGroup::someOf( [
			$matcherFactory->ident(), // none and <single-transition-property> are grammatically the same
			$matcherFactory->time(),
			$timingFunction,
			$matcherFactory->time(),
		] ) );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Animations
	 * @see https://www.w3.org/TR/2013/WD-css3-animations-20130219/
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
		$timingFunction = $this->transitionTimingFunction( $matcherFactory );
		$count = new Alternative( [
			new KeywordMatcher( 'infinite' ),
			$matcherFactory->number()
		] );
		$direction = new KeywordMatcher( [ 'normal', 'reverse', 'alternate', 'alternate-reverse' ] );
		$playState = new KeywordMatcher( [ 'running', 'paused' ] );
		$fillMode = new KeywordMatcher( [ 'none', 'forwards', 'backwards', 'both' ] );

		$props['animation-name'] = Quantifier::hash( $matcherFactory->ident() );
		$props['animation-duration'] = Quantifier::hash( $matcherFactory->time() );
		$props['animation-timing-function'] = Quantifier::hash( $timingFunction );
		$props['animation-iteration-count'] = Quantifier::hash( $count );
		$props['animation-direction'] = Quantifier::hash( $direction );
		$props['animation-play-state'] = Quantifier::hash( $playState );
		$props['animation-delay'] = Quantifier::hash( $matcherFactory->time() );
		$props['animation-fill-mode'] = Quantifier::hash( $fillMode );
		$props['animation'] = Quantifier::hash( UnorderedGroup::someOf( [
			$matcherFactory->ident(),
			$matcherFactory->time(),
			$timingFunction,
			$matcherFactory->time(),
			$count,
			$direction,
			$fillMode,
			$playState
		] ) );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Flexible Box Layout Module Level 1
	 * @see https://www.w3.org/TR/2016/CR-css-flexbox-1-20160526/
	 * @note Omits align-* and justify-* properties redefined by self::cssAlign3()
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
			new KeywordMatcher( [ 'content', 'auto' ] ),
			$matcherFactory->lengthPercentage(),
		] );
		$props['flex'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new Juxtaposition( [ $props['flex-grow'], Quantifier::optional( $props['flex-shrink'] ) ] ),
				$props['flex-basis'],
			] )
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Transforms Module Level 1
	 * @see https://www.w3.org/TR/2013/WD-css-transforms-1-20131126/
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
		$n = $matcherFactory->number();
		$l = $matcherFactory->length();
		$v = new Alternative( [ $l, $n ] );
		$lp = $matcherFactory->lengthPercentage();
		$olp = Quantifier::optional( $lp );
		$center = new KeywordMatcher( 'center' );
		$leftRight = new KeywordMatcher( [ 'left', 'right' ] );
		$topBottom = new KeywordMatcher( [ 'top', 'bottom' ] );

		$props['transform'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::plus( new Alternative( [
				new FunctionMatcher( 'matrix', Quantifier::hash( $n, 6, 6 ) ),
				new FunctionMatcher( 'translate', Quantifier::hash( $v, 1, 2 ) ),
				new FunctionMatcher( 'translateX', $v ),
				new FunctionMatcher( 'translateY', $v ),
				new FunctionMatcher( 'scale', Quantifier::hash( $n, 1, 2 ) ),
				new FunctionMatcher( 'scaleX', $n ),
				new FunctionMatcher( 'scaleY', $n ),
				new FunctionMatcher( 'rotate', $a ),
				new FunctionMatcher( 'skew', Quantifier::hash( $a, 1, 2 ) ),
				new FunctionMatcher( 'skewX', $a ),
				new FunctionMatcher( 'skewY', $a ),
				new FunctionMatcher( 'matrix3d', Quantifier::hash( $n, 16, 16 ) ),
				new FunctionMatcher( 'translate3d', new Juxtaposition( [ $v, $v, $l ], true ) ),
				new FunctionMatcher( 'translateZ', $l ),
				new FunctionMatcher( 'scale3d', Quantifier::hash( $n, 3, 3 ) ),
				new FunctionMatcher( 'scaleZ', $n ),
				new FunctionMatcher( 'rotate3d', new Juxtaposition( [ $n, $n, $n, $a ], true ) ),
				new FunctionMatcher( 'rotateX', $a ),
				new FunctionMatcher( 'rotateY', $a ),
				new FunctionMatcher( 'rotateZ', $a ),
				new FunctionMatcher( 'perspective', $l ),
			] ) )
		] );
		$props['transform-origin'] = new Alternative( [
			new Alternative( [ $center, $leftRight, $topBottom, $lp ] ),
			new Juxtaposition( [
				new Alternative( [ $center, $leftRight, $lp ] ),
				new Alternative( [ $center, $topBottom, $lp ] ),
				$olp
			] ),
			UnorderedGroup::allOf( [
				new Alternative( [ $center, $leftRight ] ),
				new Juxtaposition( [ new Alternative( [ $center, $topBottom ] ), $olp ] ),
			] )
		] );
		$props['transform-style'] = new KeywordMatcher( [ 'flat', 'preserve-3d' ] );
		$props['perspective'] = new Alternative( [ new KeywordMatcher( 'none' ), $l ] );
		$props['perspective-origin'] = new Alternative( [
			new Alternative( [ $center, $leftRight, $topBottom, $lp ] ),
			new Juxtaposition( [
				new Alternative( [ $center, $leftRight, $lp ] ),
				new Alternative( [ $center, $topBottom, $lp ] ),
			] ),
			UnorderedGroup::allOf( [
				new Alternative( [ $center, $leftRight ] ),
				new Alternative( [ $center, $topBottom ] ),
			] )
		] );
		$props['backface-visibility'] = new KeywordMatcher( [ 'visible', 'hidden' ] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Text Module Level 3
	 * @see https://www.w3.org/TR/2013/WD-css-text-3-20131010/
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

		$props['text-transform'] = new KeywordMatcher( [
			'none', 'capitalize', 'uppercase', 'lowercase', 'full-width'
		] );
		$props['white-space'] = new KeywordMatcher( [
			'normal', 'pre', 'nowrap', 'pre-wrap', 'pre-line'
		] );
		$props['tab-size'] = new Alternative( [ $matcherFactory->integer(), $matcherFactory->length() ] );
		$props['line-break'] = new KeywordMatcher( [ 'auto', 'loose', 'normal', 'strict' ] );
		$props['word-break'] = new KeywordMatcher( [ 'normal', 'keep-all', 'break-all' ] );
		$props['hyphens'] = new KeywordMatcher( [ 'none', 'manual', 'auto' ] );
		$props['word-wrap'] = new KeywordMatcher( [ 'normal', 'break-word' ] );
		$props['overflow-wrap'] = $props['word-wrap'];
		$props['text-align'] = new Alternative( [
			new KeywordMatcher( [ 'start', 'end', 'left', 'right', 'center', 'justify', 'match-parent' ] ),
			new Juxtaposition( [ new KeywordMatcher( 'start' ), new KeywordMatcher( 'end' ) ] ),
		] );
		$props['text-align-last'] = new KeywordMatcher( [
			'auto', 'start', 'end', 'left', 'right', 'center', 'justify'
		] );
		$props['text-justify'] = new KeywordMatcher( [ 'auto', 'none', 'inter-word', 'distribute' ] );
		$props['word-spacing'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			$matcherFactory->lengthPercentage()
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
	 * Properties for CSS ext Decoration Module Level 3
	 * @see https://www.w3.org/TR/2013/CR-css-text-decor-3-20130801/
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
		$props['text-decoration-skip'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'objects' ),
				new KeywordMatcher( 'spaces' ),
				new KeywordMatcher( 'ink' ),
				new KeywordMatcher( 'edges' ),
				new KeywordMatcher( 'box-decoration' ),
			] )
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
			new KeywordMatcher( [ 'right', 'left' ] ),
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
	 * @see https://www.w3.org/TR/2017/WD-css-align-3-20170215/
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
		$selfPosition = new KeywordMatcher( [
			'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end', 'left', 'right'
		] );
		$overflowAndSelfPosition = UnorderedGroup::allOf( [ $overflowPosition, $selfPosition ] );
		$baselinePosition = new Juxtaposition( [
			Quantifier::optional( new KeywordMatcher( [ 'first', 'last' ] ) ),
			new KeywordMatcher( 'baseline' )
		] );
		$contentDistribution = new KeywordMatcher( [
			'space-between', 'space-around', 'space-evenly', 'stretch'
		] );
		$contentPosition = new KeywordMatcher( [
			'center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right'
		] );

		$props['align-content'] = new Alternative( [
			$normal,
			$baselinePosition,
			UnorderedGroup::someOf( [
				$contentDistribution,
				UnorderedGroup::allOf( [ $overflowPosition, $contentPosition ] ),
			] )
		] );
		$props['justify-content'] = $props['align-content'];
		$props['place-content'] = Quantifier::count( new Alternative( [
			$normal,
			$baselinePosition,
			$contentDistribution,
			$contentPosition,
		] ), 1, 2 );
		$props['align-self'] = new Alternative( [
			$autoNormalStretch,
			$baselinePosition,
			$overflowAndSelfPosition,
		] );
		$props['justify-self'] = $props['align-self'];
		$props['place-self'] = Quantifier::count( new Alternative( [
			$autoNormalStretch,
			$baselinePosition,
			$selfPosition,
		] ), 1, 2 );
		$props['align-items'] = new Alternative( [
			$normalStretch,
			$baselinePosition,
			$overflowAndSelfPosition,
		] );
		$props['justify-items'] = new Alternative( [
			$autoNormalStretch,
			$baselinePosition,
			$overflowAndSelfPosition,
			UnorderedGroup::allOf( [
				new KeywordMatcher( 'legacy' ),
				new KeywordMatcher( [ 'left', 'right', 'center' ] ),
			] ),
		] );
		$props['place-items'] = new Juxtaposition( [
			new Alternative( [ $normalStretch, $baselinePosition, $selfPosition ] ),
			Quantifier::optional( new Alternative( [
				$autoNormalStretch, $baselinePosition, $selfPosition
			] ) ),
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Fragmentation Module Level 3
	 * @see https://www.w3.org/TR/2017/CR-css-break-3-20170209/
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
	 * Properties for CSS Speech Module
	 * @see https://www.w3.org/TR/2012/CR-css3-speech-20120320/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssSpeech( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];
		$decibel = new TokenMatcher( Token::T_DIMENSION, function ( Token $t ) {
			return !strcasecmp( $t->unit(), 'dB' );
		} );

		$props['voice-volume'] = new Alternative( [
			new KeywordMatcher( 'silent' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( [ 'x-soft', 'soft', 'medium', 'loud', 'x-loud' ] ),
				$decibel
			] ),
		] );
		$props['voice-balance'] = new Alternative( [
			$matcherFactory->number(),
			new KeywordMatcher( [ 'left', 'center', 'right', 'leftwards', 'rightwards' ] ),
		] );
		$props['speak'] = new KeywordMatcher( [ 'auto', 'none', 'normal' ] );
		$props['speak-as'] = new Alternative( [
			new KeywordMatcher( 'normal' ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( 'spell-out' ),
				new KeywordMatcher( 'digits' ),
				new KeywordMatcher( [ 'literal-punctuation', 'no-punctuation' ] ),
			] )
		] );
		$props['pause-before'] = new Alternative( [
			$matcherFactory->time(),
			new KeywordMatcher( [ 'none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong' ] ),
		] );
		$props['pause-after'] = $props['pause-before'];
		$props['pause'] = new Juxtaposition( [
			$props['pause-before'],
			Quantifier::optional( $props['pause-after'] )
		] );
		$props['rest-before'] = $props['pause-before'];
		$props['rest-after'] = $props['pause-after'];
		$props['rest'] = $props['pause'];
		$props['cue-before'] = new Alternative( [
			new Juxtaposition( [ $matcherFactory->url( 'audio' ), Quantifier::optional( $decibel ) ] ),
			new KeywordMatcher( 'none' )
		] );
		$props['cue-after'] = $props['cue-before'];
		$props['cue'] = new Juxtaposition( [
			$props['cue-before'],
			Quantifier::optional( $props['cue-after'] )
		] );
		$props['voice-family'] = new Alternative( [
			Quantifier::hash( new Alternative( [
				new Alternative( [ // <name>
					$matcherFactory->string(),
					Quantifier::plus( $matcherFactory->ident() ),
				] ),
				new Juxtaposition( [ // <generic-voice>
					Quantifier::optional( new KeywordMatcher( [ 'child', 'young', 'old' ] ) ),
					new KeywordMatcher( [ 'male', 'female', 'neutral' ] ),
					Quantifier::optional( $matcherFactory->integer() ),
				] ),
			] ) ),
			new KeywordMatcher( 'preserve' )
		] );
		$props['voice-rate'] = UnorderedGroup::someOf( [
			new KeywordMatcher( [ 'normal', 'x-slow', 'slow', 'medium', 'fast', 'x-fast' ] ),
			$matcherFactory->percentage()
		] );
		$props['voice-pitch'] = new Alternative( [
			UnorderedGroup::allOf( [
				new KeywordMatcher( 'absolute' ),
				$matcherFactory->frequency(),
			] ),
			UnorderedGroup::someOf( [
				new KeywordMatcher( [ 'x-low', 'low', 'medium', 'high', 'x-high' ] ),
				new Alternative( [
					$matcherFactory->frequency(),
					new TokenMatcher( Token::T_DIMENSION, function ( Token $t ) {
						return !strcasecmp( $t->unit(), 'st' );
					} ),
					$matcherFactory->percentage()
				] ),
			] ),
		] );
		$props['voice-range'] = $props['voice-pitch'];
		$props['voice-stress'] = new KeywordMatcher( [
			'normal', 'strong', 'moderate', 'none', 'reduced'
		] );
		$props['voice-duration'] = new Alternative( [
			new KeywordMatcher( 'auto' ),
			$matcherFactory->time()
		] );

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Grid Layout Module Level 1
	 * @see https://www.w3.org/TR/2017/CR-css-grid-1-20170209/
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
		$lineNamesO = Quantifier::optional( new BlockMatcher(
			Token::T_LEFT_BRACKET, Quantifier::star( $matcherFactory->ident() )
		) );
		$trackBreadth = new Alternative( [
			$matcherFactory->lengthPercentage(),
			new TokenMatcher( Token::T_DIMENSION, function ( Token $t ) {
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
			$matcherFactory->ident(),
			UnorderedGroup::allOf( [
				$matcherFactory->integer(),
				Quantifier::optional( $matcherFactory->ident() )
			] ),
			UnorderedGroup::allOf( [
				new KeywordMatcher( 'span' ),
				UnorderedGroup::someOf( [
					$matcherFactory->integer(),
					$matcherFactory->ident(),
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

		$props['grid-row-gap'] = $matcherFactory->lengthPercentage();
		$props['grid-column-gap'] = $matcherFactory->lengthPercentage();
		$props['grid-gap'] = new Juxtaposition( [
			$props['grid-row-gap'], Quantifier::optional( $props['grid-column-gap'] )
		] );

		// Grid uses Flexbox's order property too. Copying is ok as long as
		// it's the identical object.
		$props['order'] = $this->cssFlexbox3( $matcherFactory )['order'];

		$this->cache[__METHOD__] = $props;
		return $props;
	}

	/**
	 * Properties for CSS Filter Effects Module Level 1
	 * @see https://www.w3.org/TR/2014/WD-filter-effects-1-20141125/
	 * @param MatcherFactory $matcherFactory Factory for Matchers
	 * @return Matcher[] Array mapping declaration names (lowercase) to Matchers for the values
	 */
	protected function cssFilter1( MatcherFactory $matcherFactory ) {
		// @codeCoverageIgnoreStart
		if ( isset( $this->cache[__METHOD__] ) ) {
			return $this->cache[__METHOD__];
		}
		// @codeCoverageIgnoreEnd

		$props = [];

		$props['filter'] = new Alternative( [
			new KeywordMatcher( 'none' ),
			Quantifier::plus( new Alternative( [
				new FunctionMatcher( 'blur', $matcherFactory->length() ),
				new FunctionMatcher( 'brightness', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'contrast', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'drop-shadow', new Juxtaposition( [
					Quantifier::count( $matcherFactory->length(), 2, 3 ),
					Quantifier::optional( $matcherFactory->color() ),
				] ) ),
				new FunctionMatcher( 'grayscale', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'hue-rotate', $matcherFactory->angle() ),
				new FunctionMatcher( 'invert', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'opacity', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'saturate', $matcherFactory->numberPercentage() ),
				new FunctionMatcher( 'sepia', $matcherFactory->numberPercentage() ),
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
		$props['mask-border-slice'] = new Juxtaposition( [ // Different from border-image-slice, sigh
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
}

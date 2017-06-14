<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\FunctionMatcher;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\KeywordMatcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Grammar\TokenMatcher;
use Wikimedia\CSS\Grammar\UnorderedGroup;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@font-face rule
 * @see https://www.w3.org/TR/2013/CR-css-fonts-3-20131003/#font-resources
 */
class FontFaceAtRuleSanitizer extends RuleSanitizer {

	/** @var PropertySanitizer */
	protected $propertySanitizer;

	/**
	 * @param MatcherFactory $matcherFactory
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		$matchData = self::fontMatchData( $matcherFactory );

		$this->propertySanitizer = new PropertySanitizer();
		$this->propertySanitizer->setKnownProperties( [
			'font-family' => $matchData['familyName'],
			'src' => Quantifier::hash( new Alternative( [
				new Juxtaposition( [
					$matcherFactory->url( 'font' ),
					Quantifier::optional(
						new FunctionMatcher( 'format', Quantifier::hash( $matcherFactory->string() ) )
					),
				] ),
				new FunctionMatcher( 'local', $matchData['familyName'] ),
			] ) ),
			'font-style' => $matchData['font-style'],
			'font-weight' => new Alternative( [
				new KeywordMatcher( [ 'normal', 'bold' ] ), $matchData['numWeight']
			] ),
			'font-stretch' => $matchData['font-stretch'],
			'unicode-range' => Quantifier::hash(
				new TokenMatcher( Token::T_UNICODE_RANGE, function ( Token $t ) {
					list( $start, $end ) = $t->range();
					return $start <= $end && $end <= 0x10ffff;
				} )
			),
			'font-variant' => $matchData['font-variant'],
			'font-feature-settings' => $matchData['font-feature-settings'],
		] );
	}

	/**
	 * Get some shared data for font declaration matchers
	 * @param MatcherFactory $matcherFactory
	 * @return array
	 */
	public static function fontMatchData( MatcherFactory $matcherFactory ) {
		$featureValueName = $matcherFactory->ident();
		$featureValueNameHash = Quantifier::hash( $featureValueName );
		$ret = [
			'familyName' => new Alternative( [
				$matcherFactory->string(),
				Quantifier::plus( $matcherFactory->ident() ),
			] ),
			'numWeight' => new TokenMatcher( Token::T_NUMBER, function ( Token $t ) {
				return $t->typeFlag() === 'integer' && preg_match( '/^[1-9]00$/', $t->representation() );
			} ),
			'font-style' => new KeywordMatcher( [ 'normal', 'italic', 'oblique' ] ),
			'font-stretch' => new KeywordMatcher( [
				'normal', 'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded',
				'expanded', 'extra-expanded', 'ultra-expanded'
			] ),
			'font-feature-settings' => new Alternative( [
				new KeywordMatcher( 'normal' ),
				Quantifier::hash( new Juxtaposition( [
					new TokenMatcher( Token::T_STRING, function ( Token $t ) {
						return preg_match( '/^[\x20-\x7e]{4}$/', $t->value() );
					} ),
					Quantifier::optional( new Alternative( [
						$matcherFactory->integer(),
						new KeywordMatcher( [ 'on', 'off' ] ),
					] ) )
				] ) )
			] ),
			'ligatures' => [
				new KeywordMatcher( [ 'common-ligatures', 'no-common-ligatures' ] ),
				new KeywordMatcher( [ 'discretionary-ligatures', 'no-discretionary-ligatures' ] ),
				new KeywordMatcher( [ 'historical-ligatures', 'no-historical-ligatures' ] ),
				new KeywordMatcher( [ 'contextual', 'no-contextual' ] )
			],
			'alt' => [
				new FunctionMatcher( 'stylistic', $featureValueName ),
				new KeywordMatcher( 'historical-forms' ),
				new FunctionMatcher( 'styleset', $featureValueNameHash ),
				new FunctionMatcher( 'character-variant', $featureValueNameHash ),
				new FunctionMatcher( 'swash', $featureValueName ),
				new FunctionMatcher( 'ornaments', $featureValueName ),
				new FunctionMatcher( 'annotation', $featureValueName ),
			],
			'capsKeywords' => [
				'small-caps', 'all-small-caps', 'petite-caps', 'all-petite-caps', 'unicase', 'titling-caps'
			],
			'numeric' => [
				new KeywordMatcher( [ 'lining-nums', 'oldstyle-nums' ] ),
				new KeywordMatcher( [ 'proportional-nums', 'tabular-nums' ] ),
				new KeywordMatcher( [ 'diagonal-fractions', 'stacked-fractions' ] ),
				new KeywordMatcher( 'ordinal' ),
				new KeywordMatcher( 'slashed-zero' ),
			],
			'eastAsian' => [
				new KeywordMatcher( [ 'jis78', 'jis83', 'jis90', 'jis04', 'simplified', 'traditional' ] ),
				new KeywordMatcher( [ 'full-width', 'proportional-width' ] ),
				new KeywordMatcher( 'ruby' ),
			]
		];
		$ret['font-variant'] = new Alternative( [
			new KeywordMatcher( [ 'normal', 'none' ] ),
			UnorderedGroup::someOf( array_merge(
				$ret['ligatures'],
				$ret['alt'],
				[ new KeywordMatcher( $ret['capsKeywords'] ) ],
				$ret['numeric'],
				$ret['eastAsian']
			) )
		] );
		return $ret;
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'font-face' );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'font-face' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'font-face' ] );
			return null;
		}

		// No non-whitespace prelude allowed
		if ( Util::findFirstNonWhitespace( $object->getPrelude() ) ) {
			$this->sanitizationError( 'invalid-font-face-at-rule', $object );
			return null;
		}

		$ret = clone( $object );
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeDeclarationBlock( $ret->getBlock(), $this->propertySanitizer );

		return $ret;
	}
}

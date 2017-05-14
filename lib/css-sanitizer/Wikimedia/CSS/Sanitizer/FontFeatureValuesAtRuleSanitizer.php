<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@font-feature-values rule
 * @see https://www.w3.org/TR/2013/CR-css-fonts-3-20131003/#at-font-feature-values-rule
 */
class FontFeatureValuesAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $fontListMatcher;

	/** @var FontFeatureValueAtRuleSanitizer[] */
	protected $ruleSanitizers;

	/**
	 * @param MatcherFactory $matcherFactory
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		$this->fontListMatcher = Quantifier::hash( new Alternative( [
			$matcherFactory->string(),
			Quantifier::plus( $matcherFactory->ident() ),
		] ) );

		$n = $matcherFactory->rawNumber();
		$n2 = Quantifier::count( $n, 1, 2 );
		$nPlus = Quantifier::plus( $n );
		$this->ruleSanitizers = [
			new FontFeatureValueAtRuleSanitizer( 'stylistic', $n ),
			new FontFeatureValueAtRuleSanitizer( 'styleset', $nPlus ),
			new FontFeatureValueAtRuleSanitizer( 'character-variant', $n2 ),
			new FontFeatureValueAtRuleSanitizer( 'swash', $n ),
			new FontFeatureValueAtRuleSanitizer( 'ornaments', $n ),
			new FontFeatureValueAtRuleSanitizer( 'annotation', $n ),
		];
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'font-feature-values' );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'font-feature-values' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'font-feature-values' ] );
			return null;
		}

		// Test the page selector
		if ( !$this->fontListMatcher->match( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-font-feature-values-font-list', $cv );
			} else {
				$this->sanitizationError( 'missing-font-feature-values-font-list', $object );
			}
			return null;
		}

		$ret = clone( $object );
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), $this->ruleSanitizers );

		return $ret;
	}
}

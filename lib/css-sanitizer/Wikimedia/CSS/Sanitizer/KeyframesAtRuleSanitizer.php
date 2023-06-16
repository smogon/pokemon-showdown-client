<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\KeywordMatcher;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@keyframes rule
 * @see https://www.w3.org/TR/2018/WD-css-animations-1-20181011/#keyframes
 */
class KeyframesAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $nameMatcher;

	/** @var Sanitizer */
	protected $ruleSanitizer;

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param PropertySanitizer $propertySanitizer Sanitizer for declarations
	 */
	public function __construct(
		MatcherFactory $matcherFactory, PropertySanitizer $propertySanitizer
	) {
		$this->nameMatcher = new Alternative( [
			$matcherFactory->customIdent( [ 'none' ] ),
			$matcherFactory->string(),
		] );
		$this->ruleSanitizer = new StyleRuleSanitizer(
			Quantifier::hash( new Alternative( [
				new KeywordMatcher( [ 'from', 'to' ] ), $matcherFactory->rawPercentage()
			] ) ),
			$propertySanitizer
		);
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'keyframes' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'keyframes' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'keyframes' ] );
			return null;
		}

		// Test the keyframe name
		if ( !$this->nameMatcher->matchAgainst( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-keyframe-name', $cv );
			} else {
				$this->sanitizationError( 'missing-keyframe-name', $object );
			}
			return null;
		}

		$ret = clone $object;
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), [ $this->ruleSanitizer ] );

		return $ret;
	}
}

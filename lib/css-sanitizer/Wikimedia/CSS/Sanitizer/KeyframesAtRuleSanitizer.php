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
 * @see https://www.w3.org/TR/2013/WD-css3-animations-20130219/#keyframes
 */
class KeyframesAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $identMatcher;

	/** @var Sanitizer */
	protected $ruleSanitizer;

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param PropertySanitizer $propertySanitizer Sanitizer for declarations
	 */
	public function __construct(
		MatcherFactory $matcherFactory, PropertySanitizer $propertySanitizer
	) {
		$this->identMatcher = $matcherFactory->ident();
		$this->ruleSanitizer = new StyleRuleSanitizer(
			Quantifier::hash( new Alternative( [
				new KeywordMatcher( [ 'from', 'to' ] ), $matcherFactory->rawPercentage()
			] ) ),
			$propertySanitizer
		);
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'keyframes' );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'keyframes' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'keyframes' ] );
			return null;
		}

		// Test the keyframe name
		if ( !$this->identMatcher->match( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-keyframe-name', $cv );
			} else {
				$this->sanitizationError( 'missing-keyframe-name', $object );
			}
			return null;
		}

		$ret = clone( $object );
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), [ $this->ruleSanitizer ] );

		return $ret;
	}
}

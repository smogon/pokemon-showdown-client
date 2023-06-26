<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@supports rule
 * @see https://www.w3.org/TR/2013/CR-css3-conditional-20130404/#at-supports
 */
class SupportsAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $conditionMatcher;

	/** @var RuleSanitizer[] */
	protected $ruleSanitizers = [];

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param array $options Additional options:
	 *  - strict: (bool) Only accept defined syntax. Default true.
	 *  - declarationSanitizer: (PropertySanitizer) Check declarations against this Sanitizer.
	 */
	public function __construct( MatcherFactory $matcherFactory, array $options = [] ) {
		$this->conditionMatcher = $matcherFactory->cssSupportsCondition(
			$options['declarationSanitizer'] ?? null,
			$options['strict'] ?? true
		);
	}

	/**
	 * Access the list of rule sanitizers
	 * @return RuleSanitizer[]
	 */
	public function getRuleSanitizers() {
		return $this->ruleSanitizers;
	}

	/**
	 * Set the list of rule sanitizers
	 * @param RuleSanitizer[] $ruleSanitizers
	 */
	public function setRuleSanitizers( array $ruleSanitizers ) {
		Util::assertAllInstanceOf( $ruleSanitizers, RuleSanitizer::class, '$ruleSanitizers' );
		$this->ruleSanitizers = $ruleSanitizers;
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'supports' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'supports' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'supports' ] );
			return null;
		}

		// Test the media query
		if ( !$this->conditionMatcher->matchAgainst( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-supports-condition', $cv );
			} else {
				$this->sanitizationError( 'missing-supports-condition', $object );
			}
			return null;
		}

		$ret = clone $object;
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), $this->ruleSanitizers );

		return $ret;
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@media rule
 * @see https://www.w3.org/TR/2013/CR-css3-conditional-20130404/#at-media
 */
class MediaAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $mediaQueryListMatcher;

	/** @var RuleSanitizer[] */
	protected $ruleSanitizers = [];

	/**
	 * @param Matcher $mediaQueryListMatcher Matcher for media query lists.
	 *  Probably from MatcherFactory::cssMediaQueryList().
	 */
	public function __construct( Matcher $mediaQueryListMatcher ) {
		$this->mediaQueryListMatcher = $mediaQueryListMatcher;
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
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'media' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'media' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'media' ] );
			return null;
		}

		// Test the media query
		$match = $this->mediaQueryListMatcher->matchAgainst(
			$object->getPrelude(), [ 'mark-significance' => true ]
		);
		if ( !$match ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() ) ?: $object->getPrelude();
			$this->sanitizationError( 'invalid-media-query', $cv );
			return null;
		}

		$ret = clone $object;
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), $this->ruleSanitizers );

		return $ret;
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use Wikimedia\CSS\Util;

/**
 * Represent a stylesheet
 * @note This isn't necessarily a "CSS stylesheet" though.
 * @warning If you're not using the provided Sanitizer classes to further sanitize
 *  the CSS, you'll want to manually filter out any at-rules named "charset"
 *  before stringifying and/or prepend `@charset "utf-8";` after stringifying
 *  this object.
 */
class Stylesheet implements CSSObject {

	/** @var RuleList */
	protected $ruleList;

	/**
	 * @param RuleList|null $rules
	 */
	public function __construct( RuleList $rules = null ) {
		$this->ruleList = $rules ?: new RuleList();
	}

	public function __clone() {
		$this->ruleList = clone $this->ruleList;
	}

	/**
	 * @return RuleList
	 */
	public function getRuleList() {
		return $this->ruleList;
	}

	/** @inheritDoc */
	public function getPosition() {
		// Stylesheets don't really have a position
		return [ 0, 0 ];
	}

	/** @inheritDoc */
	public function toTokenArray() {
		return $this->ruleList->toTokenArray();
	}

	/** @inheritDoc */
	public function toComponentValueArray() {
		return $this->ruleList->toComponentValueArray();
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

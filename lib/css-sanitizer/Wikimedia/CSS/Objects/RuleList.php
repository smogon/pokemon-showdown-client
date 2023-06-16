<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a list of CSS rules
 */
class RuleList extends CSSObjectList {
	/**
	 * @var string
	 */
	protected static $objectType = Rule::class;

	/** @inheritDoc */
	protected function getSeparator( CSSObject $left, CSSObject $right = null ) {
		return $right ? [ new Token( Token::T_WHITESPACE, [ 'significant' => false ] ) ] : [];
	}
}

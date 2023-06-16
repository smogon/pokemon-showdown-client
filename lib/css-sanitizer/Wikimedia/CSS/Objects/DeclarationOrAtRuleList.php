<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a list of CSS declarations and at-rules
 */
class DeclarationOrAtRuleList extends CSSObjectList {
	/**
	 * @var string
	 */
	protected static $objectType = DeclarationOrAtRule::class;

	/** @inheritDoc */
	protected function getSeparator( CSSObject $left, CSSObject $right = null ) {
		$ret = [];
		if ( $left instanceof Declaration ) {
			$ret[] = new Token( Token::T_SEMICOLON, [ 'significant' => (bool)$right ] );
		}
		if ( $right ) {
			$ret[] = new Token( Token::T_WHITESPACE, [ 'significant' => false ] );
		}
		return $ret;
	}
}

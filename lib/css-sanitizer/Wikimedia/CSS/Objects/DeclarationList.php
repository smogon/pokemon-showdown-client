<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a list of declarations
 */
class DeclarationList extends CSSObjectList {
	/**
	 * @var string
	 */
	protected static $objectType = Declaration::class;

	/** @inheritDoc */
	protected function getSeparator( CSSObject $left, CSSObject $right = null ) {
		if ( $right ) {
			return [
				new Token( Token::T_SEMICOLON ),
				new Token( Token::T_WHITESPACE, [ 'significant' => false ] ),
			];
		}

		return [ new Token( Token::T_SEMICOLON, [ 'significant' => false ] ) ];
	}
}

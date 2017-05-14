<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use Wikimedia\CSS\Parser\Parser;

/**
 * Represent a list of CSS tokens
 */
class TokenList extends CSSObjectList {
	protected static $objectType = Token::class;

	// We can greatly simplify this, assuming no separator
	public function toTokenArray() {
		return $this->objects;
	}

	// This one, though, is complicated
	public function toComponentValueArray() {
		$parser = Parser::newFromTokens( $this->objects );
		$ret = $parser->parseComponentValueList();
		if ( $parser->getParseErrors() ) {
			$ex = new \UnexpectedValueException( 'TokenList cannot be converted to a ComponentValueList' );
			$ex->parseErrors = $parser->getParseErrors();
			throw $ex;
		}
		return $ret->toComponentValueArray();
	}
}

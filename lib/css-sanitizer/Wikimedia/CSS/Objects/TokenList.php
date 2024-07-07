<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use UnexpectedValueException;
use Wikimedia\CSS\Parser\Parser;

/**
 * Represent a list of CSS tokens
 */
class TokenList extends CSSObjectList {
	/**
	 * @var string
	 */
	protected static $objectType = Token::class;

	/** @var Token[] The objects contained */
	protected $objects;

	/** @inheritDoc */
	public function toTokenArray() {
		// We can greatly simplify this, assuming no separator
		return $this->objects;
	}

	/** @inheritDoc */
	public function toComponentValueArray() {
		// This one, though, is complicated
		$parser = Parser::newFromTokens( $this->objects );
		$ret = $parser->parseComponentValueList();
		if ( $parser->getParseErrors() ) {
			$ex = new UnexpectedValueException( 'TokenList cannot be converted to a ComponentValueList' );
			// @phan-suppress-next-line PhanUndeclaredProperty
			$ex->parseErrors = $parser->getParseErrors();
			throw $ex;
		}
		return $ret->toComponentValueArray();
	}
}

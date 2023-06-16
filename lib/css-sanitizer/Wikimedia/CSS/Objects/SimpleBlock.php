<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use InvalidArgumentException;
use Wikimedia\CSS\Util;

/**
 * Represent a CSS simple block
 */
class SimpleBlock extends ComponentValue {

	/** @var string */
	protected $startTokenType;

	/** @var string */
	protected $endTokenType;

	/** @var ComponentValueList */
	protected $value;

	/**
	 * @param Token $token Associated token
	 */
	public function __construct( Token $token ) {
		$this->endTokenType = static::matchingDelimiter( $token->type() );
		if ( $this->endTokenType === null ) {
			throw new InvalidArgumentException(
				'A SimpleBlock is delimited by either {}, [], or ().'
			);
		}

		[ $this->line, $this->pos ] = $token->getPosition();
		$this->startTokenType = $token->type();
		$this->value = new ComponentValueList();
	}

	public function __clone() {
		$this->value = clone $this->value;
	}

	/**
	 * Create simple block by token type
	 * @param string $delimiter Token::T_LEFT_PAREN, Token::T_LEFT_BRACE, or
	 *  Token::T_LEFT_BRACKET
	 * @return SimpleBlock
	 */
	public static function newFromDelimiter( $delimiter ) {
		return new static( new Token( $delimiter ) );
	}

	/**
	 * Return the ending delimiter for a starting delimiter
	 * @param string $delim Token::T_* constant
	 * @return string|null Matching Token::T_* constant, if any
	 */
	public static function matchingDelimiter( $delim ) {
		switch ( $delim ) {
			case Token::T_LEFT_BRACE:
				return Token::T_RIGHT_BRACE;
			case Token::T_LEFT_BRACKET:
				return Token::T_RIGHT_BRACKET;
			case Token::T_LEFT_PAREN:
				return Token::T_RIGHT_PAREN;
			default:
				return null;
		}
	}

	/**
	 * Get the start token type
	 * @return string
	 */
	public function getStartTokenType() {
		return $this->startTokenType;
	}

	/**
	 * Get the end token type
	 * @return string
	 */
	public function getEndTokenType() {
		return $this->endTokenType;
	}

	/**
	 * Return the block's value
	 * @return ComponentValueList
	 */
	public function getValue() {
		return $this->value;
	}

	/** @inheritDoc */
	public function toTokenArray() {
		$ret = [
			new Token( $this->startTokenType, [ 'position' => [ $this->line, $this->pos ] ] ),
		];

		// Manually looping and appending turns out to be noticeably faster than array_merge.
		$tokens = $this->value->toTokenArray();
		if ( $tokens && $this->startTokenType === Token::T_LEFT_BRACE ) {
			if ( $tokens[0]->type() !== Token::T_WHITESPACE ) {
				$ret[] = new Token( Token::T_WHITESPACE, [ 'significant' => false ] );
			}
			foreach ( $tokens as $v ) {
				$ret[] = $v;
			}
			if ( $tokens[count( $tokens ) - 1]->type() !== Token::T_WHITESPACE ) {
				$ret[] = new Token( Token::T_WHITESPACE, [ 'significant' => false ] );
			}
		} else {
			foreach ( $tokens as $v ) {
				$ret[] = $v;
			}
		}

		$ret[] = new Token( $this->endTokenType );

		return $ret;
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

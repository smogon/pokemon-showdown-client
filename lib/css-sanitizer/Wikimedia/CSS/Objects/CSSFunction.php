<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use InvalidArgumentException;
use Wikimedia\CSS\Util;

/**
 * Represent a CSS function
 */
class CSSFunction extends ComponentValue {

	/** @var string */
	protected $name;

	/** @var ComponentValueList */
	protected $value;

	/**
	 * @param Token $token Function token starting the rule
	 */
	public function __construct( Token $token ) {
		if ( $token->type() !== Token::T_FUNCTION ) {
			throw new InvalidArgumentException(
				"CSS function must begin with a function token, got {$token->type()}"
			);
		}

		[ $this->line, $this->pos ] = $token->getPosition();
		$this->name = $token->value();
		$this->value = new ComponentValueList();
	}

	public function __clone() {
		$this->value = clone $this->value;
	}

	/**
	 * Create a function by name
	 * @param string $name
	 * @return CSSFunction
	 */
	public static function newFromName( $name ) {
		return new static( new Token( Token::T_FUNCTION, $name ) );
	}

	/**
	 * Return the function's name
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Return the function's value
	 * @return ComponentValueList
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Return an array of Tokens that correspond to this object.
	 * @return Token[]
	 */
	public function toTokenArray() {
		$ret = [];

		$ret[] = new Token(
			Token::T_FUNCTION,
			[ 'value' => $this->name, 'position' => [ $this->line, $this->pos ] ]
		);
		// Manually looping and appending turns out to be noticeably faster than array_merge.
		foreach ( $this->value->toTokenArray() as $v ) {
			$ret[] = $v;
		}
		$ret[] = new Token( Token::T_RIGHT_PAREN );

		return $ret;
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

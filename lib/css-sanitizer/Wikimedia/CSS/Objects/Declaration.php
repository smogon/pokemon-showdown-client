<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use InvalidArgumentException;
use Wikimedia\CSS\Util;

/**
 * Represent a CSS declaration
 */
class Declaration implements DeclarationOrAtRule {

	/** @var int Line in the input where this declaration starts */
	protected $line = -1;

	/** @var int Position in the input where this declaration starts */
	protected $pos = -1;

	/** @var string */
	protected $name;

	/** @var ComponentValueList */
	protected $value;

	/** @var bool */
	protected $important = false;

	/**
	 * @param Token $token Token starting the declaration
	 */
	public function __construct( Token $token ) {
		if ( $token->type() !== Token::T_IDENT ) {
			throw new InvalidArgumentException(
				"Declaration must begin with an ident token, got {$token->type()}"
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
	 * Get the position of this Declaration in the input stream
	 * @return array [ $line, $pos ]
	 */
	public function getPosition() {
		return [ $this->line, $this->pos ];
	}

	/**
	 * Return the declaration's name
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Return the declaration's value
	 * @return ComponentValueList
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Return the declaration's 'important' flag
	 * @return bool
	 */
	public function getImportant() {
		return $this->important;
	}

	/**
	 * Set the 'important' flag
	 * @param bool $flag
	 */
	public function setImportant( $flag ) {
		$this->important = (bool)$flag;
	}

	/**
	 * @param string $function Function to call, toTokenArray() or toComponentValueArray()
	 * @return Token[]|ComponentValue[]
	 */
	private function toTokenOrCVArray( $function ) {
		$ret = [];

		$ret[] = new Token(
			Token::T_IDENT,
			[ 'value' => $this->name, 'position' => [ $this->line, $this->pos ] ]
		);
		$ret[] = $v = new Token( Token::T_COLON );
		// Manually looping and appending turns out to be noticeably faster than array_merge.
		foreach ( $this->value->$function() as $v ) {
			$ret[] = $v;
		}
		if ( $this->important ) {
			if ( !$v instanceof Token || $v->type() !== Token::T_WHITESPACE ) {
				$ret[] = new Token( Token::T_WHITESPACE, [ 'significant' => false ] );
			}
			$ret[] = new Token( Token::T_DELIM, '!' );
			$ret[] = new Token( Token::T_IDENT, 'important' );
		}
		return $ret;
	}

	/** @inheritDoc */
	public function toTokenArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	/** @inheritDoc */
	public function toComponentValueArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use Wikimedia\CSS\Util;

/**
 * Represent a CSS at-rule
 */
class AtRule extends Rule implements DeclarationOrAtRule {

	/** @var string */
	protected $name;

	/** @var ComponentValueList */
	protected $prelude;

	/** @var SimpleBlock|null */
	protected $block = null;

	/**
	 * @param Token $token An at-keyword token
	 */
	public function __construct( Token $token ) {
		if ( $token->type() !== Token::T_AT_KEYWORD ) {
			throw new \InvalidArgumentException(
				"At rule must begin with an at-keyword token, got {$token->type()}"
			);
		}

		parent::__construct( $token );
		$this->name = $token->value();
		$this->prelude = new ComponentValueList();
	}

	public function __clone() {
		$this->prelude = clone( $this->prelude );
		if ( $this->block ) {
			$this->block = clone( $this->block );
		}
	}

	/**
	 * Create an at-rule by name
	 * @param string $name
	 * @return AtRule
	 */
	public static function newFromName( $name ) {
		return new static( new Token( Token::T_AT_KEYWORD, $name ) );
	}

	/**
	 * Return the at-rule's name, e.g. "media"
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Return the at-rule's prelude
	 * @return ComponentValueList
	 */
	public function getPrelude() {
		return $this->prelude;
	}

	/**
	 * Return the at-rule's block
	 * @return SimpleBlock|null
	 */
	public function getBlock() {
		return $this->block;
	}

	/**
	 * Set the block
	 * @param SimpleBlock|null $block
	 */
	public function setBlock( SimpleBlock $block = null ) {
		if ( $block->getStartTokenType() !== Token::T_LEFT_BRACE ) {
			throw new \InvalidArgumentException( 'At-rule block must be delimited by {}' );
		}
		$this->block = $block;
	}

	/**
	 * @param string $function Function to call, toTokenArray() or toComponentValueArray()
	 */
	private function toTokenOrCVArray( $function ) {
		$ret = [];

		$ret[] = new Token(
			Token::T_AT_KEYWORD, [ 'value' => $this->name, 'position' => [ $this->line, $this->pos ] ]
		);
		// Manually looping and appending turns out to be noticably faster than array_merge.
		foreach ( $this->prelude->$function() as $v ) {
			$ret[] = $v;
		}
		if ( $this->block ) {
			foreach ( $this->block->$function() as $v ) {
				$ret[] = $v;
			}
		} else {
			$ret[] = new Token( Token::T_SEMICOLON );
		}

		return $ret;
	}

	public function toTokenArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	public function toComponentValueArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

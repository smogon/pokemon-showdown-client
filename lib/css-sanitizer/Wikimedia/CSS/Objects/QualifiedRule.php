<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use InvalidArgumentException;
use Wikimedia\CSS\Util;

/**
 * Represent a CSS qualified rule
 */
class QualifiedRule extends Rule {

	/** @var ComponentValueList */
	protected $prelude;

	/** @var SimpleBlock */
	protected $block;

	/** @inheritDoc */
	public function __construct( Token $token = null ) {
		parent::__construct( $token ?: new Token( Token::T_EOF ) );
		$this->prelude = new ComponentValueList();
		$this->block = SimpleBlock::newFromDelimiter( Token::T_LEFT_BRACE );
	}

	public function __clone() {
		$this->prelude = clone $this->prelude;
		$this->block = clone $this->block;
	}

	/**
	 * Return the rule's prelude
	 * @return ComponentValueList
	 */
	public function getPrelude() {
		return $this->prelude;
	}

	/**
	 * Return the rule's block
	 * @return SimpleBlock
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
			throw new InvalidArgumentException( 'Qualified rule block must be delimited by {}' );
		}
		$this->block = $block;
	}

	/**
	 * @param string $function Function to call, toTokenArray() or toComponentValueArray()
	 * @return Token[]|ComponentValue[]
	 */
	private function toTokenOrCVArray( $function ) {
		$ret = [];

		// Manually looping and appending turns out to be noticeably faster than array_merge.
		foreach ( $this->prelude->$function() as $v ) {
			$ret[] = $v;
		}
		foreach ( $this->block->$function() as $v ) {
			$ret[] = $v;
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

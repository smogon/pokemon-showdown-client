<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use InvalidArgumentException;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\SimpleBlock;

/**
 * Matcher that matches a SimpleBlock
 *
 * The grammar definitions in the standards seem to be written assuming they're
 * being passed a sequence of Tokens only, even though they're defined over a
 * sequence of ComponentValues (which includes SimpleBlocks and CSSFunctions)
 * instead.
 *
 * Thus, to be safe you'll want to use this when a grammar specifies something
 * like `'[' <stuff> ']'`.
 */
class BlockMatcher extends Matcher {
	/** @var string One of the Token::T_* constants */
	protected $blockType;

	/** @var Matcher */
	protected $matcher;

	/**
	 * @param string $blockType One of the Token::T_* constants
	 * @param Matcher $matcher Matcher for the contents of the block
	 */
	public function __construct( $blockType, Matcher $matcher ) {
		if ( SimpleBlock::matchingDelimiter( $blockType ) === null ) {
			throw new InvalidArgumentException(
				'A block is delimited by either {}, [], or ().'
			);
		}
		$this->blockType = $blockType;
		$this->matcher = $matcher;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start] ?? null;
		if ( $cv instanceof SimpleBlock && $cv->getStartTokenType() === $this->blockType ) {
			// To successfully match, our sub-Matcher needs to match the whole
			// content of the block.
			$l = $cv->getValue()->count();
			$s = $this->next( $cv->getValue(), -1, $options );
			foreach ( $this->matcher->generateMatches( $cv->getValue(), $s, $options ) as $match ) {
				if ( $match->getNext() === $l ) {
					// Matched the whole content of the block, so yield the
					// token after the block.
					yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ), $match );
					return;
				}
			}
		}
	}
}

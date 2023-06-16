<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Iterator;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Util;

/**
 * Matcher that groups other matchers (juxtaposition)
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-combinators
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#comb-comma
 */
class Juxtaposition extends Matcher {
	/** @var Matcher[] */
	protected $matchers;

	/** @var bool Whether non-empty matches are comma-separated */
	protected $commas;

	/**
	 * @param Matcher[] $matchers
	 * @param bool $commas Whether matches are comma-separated
	 */
	public function __construct( array $matchers, $commas = false ) {
		Util::assertAllInstanceOf( $matchers, Matcher::class, '$matchers' );
		$this->matchers = $matchers;
		$this->commas = (bool)$commas;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$used = [];

		// Match each of our matchers in turn, pushing each one onto a stack as
		// we process it and popping a match once it's exhausted.
		$stack = [
			[
				new GrammarMatch( $values, $start, 0 ),
				$start,
				$this->matchers[0]->generateMatches( $values, $start, $options ),
				false
			]
		];
		do {
			/** @var $lastEnd int */
			/** @var $iter Iterator<GrammarMatch> */
			/** @var $needEmpty bool */
			[ , $lastEnd, $iter, $needEmpty ] = $stack[count( $stack ) - 1];

			// If the top of the stack has no more matches, pop it and loop.
			if ( !$iter->valid() ) {
				array_pop( $stack );
				continue;
			}

			// Find the next match for the current top of the stack.
			$match = $iter->current();
			$iter->next();

			// In some cases, we can only match if the rest of the pattern
			// is empty. If we're in that situation, ignore all non-empty
			// matches.
			if ( $needEmpty && $match->getLength() !== 0 ) {
				continue;
			}

			$thisEnd = $nextFrom = $match->getNext();

			// Dealing with commas is a bit tricky. There are three cases:
			// 1. If the current match is empty, don't look for a following
			// comma now and reset $thisEnd to $lastEnd.
			// 2. If there is a comma following, update $nextFrom to be after
			// the comma.
			// 3. If there's no comma following, every subsequent Matcher must
			// be empty in order for the group as a whole to match, so set
			// the flag.
			// Unlike '#', this doesn't specify skipping whitespace around the
			// commas if the production isn't already skipping whitespace.
			if ( $this->commas ) {
				if ( $match->getLength() === 0 ) {
					$thisEnd = $lastEnd;
				} elseif ( isset( $values[$nextFrom] ) && $values[$nextFrom] instanceof Token &&
					// @phan-suppress-next-line PhanNonClassMethodCall False positive
					$values[$nextFrom]->type() === Token::T_COMMA
				) {
					$nextFrom = $this->next( $values, $nextFrom, $options );
				} else {
					$needEmpty = true;
				}
			}

			// If we ran out of Matchers, yield the final position. Otherwise,
			// push the next matcher onto the stack.
			if ( count( $stack ) >= count( $this->matchers ) ) {
				$newMatch = $this->makeMatch( $values, $start, $thisEnd, $match, $stack );
				$mid = $newMatch->getUniqueID();
				if ( !isset( $used[$mid] ) ) {
					$used[$mid] = 1;
					yield $newMatch;
				}
			} else {
				$stack[] = [
					$match,
					$thisEnd,
					$this->matchers[count( $stack )]->generateMatches( $values, $nextFrom, $options ),
					$needEmpty
				];
			}
		} while ( $stack );
	}
}

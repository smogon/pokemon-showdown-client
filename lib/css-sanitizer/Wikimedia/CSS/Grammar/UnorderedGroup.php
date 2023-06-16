<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use ArrayIterator;
use EmptyIterator;
use Iterator;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Util;

/**
 * Matcher that groups other matchers without ordering ("&&" and "||" combiners)
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-combinators
 */
class UnorderedGroup extends Matcher {
	/** @var Matcher[] */
	protected $matchers;

	/** @var bool Whether all matchers must be used */
	protected $all;

	/**
	 * @param Matcher[] $matchers
	 * @param bool $all Whether all matchers must be used
	 */
	public function __construct( array $matchers, $all ) {
		Util::assertAllInstanceOf( $matchers, Matcher::class, '$matchers' );
		$this->matchers = $matchers;
		$this->all = (bool)$all;
	}

	/**
	 * Implements "&&": All of the options, in any order
	 * @param Matcher[] $matchers
	 * @return static
	 */
	public static function allOf( array $matchers ) {
		return new static( $matchers, true );
	}

	/**
	 * Implements "||": One or more of the options, in any order
	 * @param Matcher[] $matchers
	 * @return static
	 */
	public static function someOf( array $matchers ) {
		return new static( $matchers, false );
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$used = [];

		// As each Matcher is used, push it onto the stack along with the set
		// of remaining matchers.
		$stack = [
			[
				new GrammarMatch( $values, $start, 0 ),
				$this->matchers,
				new ArrayIterator( $this->matchers ),
				null,
				new EmptyIterator
			]
		];
		do {
			/** @var $lastMatch GrammarMatch */
			/** @var $matchers Matcher[] */
			/** @var $matcherIter Iterator<Matcher> */
			/** @var $curMatcher Matcher|null */
			/** @var $iter Iterator<GrammarMatch> */
			[ $lastMatch, $matchers, $matcherIter, $curMatcher, $iter ] = $stack[count( $stack ) - 1];

			// If the top of the stack has more matches, process the next one.
			if ( $iter->valid() ) {
				$match = $iter->current();
				$iter->next();

				// If we have unused matchers to try after this one, do so.
				// Otherwise, yield and continue with the current one.
				if ( $matchers ) {
					$stack[] = [ $match, $matchers, new ArrayIterator( $matchers ), null, new EmptyIterator ];
				} else {
					$newMatch = $this->makeMatch( $values, $start, $match->getNext(), $match, $stack );
					$mid = $newMatch->getUniqueID();
					if ( !isset( $used[$mid] ) ) {
						$used[$mid] = 1;
						yield $newMatch;
					}
				}
				continue;
			}

			// We ran out of matches for the current top of the stack. Pop it,
			// and put $curMatcher back into $matchers, so it can be tried again
			// at a later position.
			array_pop( $stack );
			if ( $curMatcher ) {
				$matchers[$matcherIter->key()] = $curMatcher;
				$matcherIter->next();
			}

			$fromPos = $lastMatch->getNext();

			// If there are more matchers to try, pull the next one out of
			// $matchers and try it at the current position. Otherwise, maybe
			// yield the current position and backtrack.
			if ( $matcherIter->valid() ) {
				$curMatcher = $matcherIter->current();
				unset( $matchers[$matcherIter->key()] );
				$iter = $curMatcher->generateMatches( $values, $fromPos, $options );
				$stack[] = [ $lastMatch, $matchers, $matcherIter, $curMatcher, $iter ];
			} elseif ( $stack && !$this->all ) {
				$newMatch = $this->makeMatch( $values, $start, $fromPos, $lastMatch, $stack );
				$mid = $newMatch->getUniqueID();
				if ( !isset( $used[$mid] ) ) {
					$used[$mid] = 1;
					yield $newMatch;
				}
			}
		} while ( $stack );
	}
}

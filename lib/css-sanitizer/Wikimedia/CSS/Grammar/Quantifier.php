<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Iterator;
use UnexpectedValueException;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches a sub-Matcher a certain number of times
 * ("?", "*", "+", "#", "{A,B}" multipliers)
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-multipliers
 */
class Quantifier extends Matcher {
	/** @var Matcher */
	protected $matcher;

	/** @var int */
	protected $min;

	/** @var int */
	protected $max;

	/** @var bool Whether matches are comma-separated */
	protected $commas;

	/**
	 * @param Matcher $matcher
	 * @param int|float $min Minimum number of matches
	 * @param int|float $max Maximum number of matches
	 * @param bool $commas Whether matches are comma-separated
	 */
	public function __construct( Matcher $matcher, $min, $max, $commas ) {
		$this->matcher = $matcher;
		$this->min = $min;
		$this->max = $max;
		$this->commas = (bool)$commas;
	}

	/**
	 * Implements "?": 0 or 1 matches
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-opt
	 * @param Matcher $matcher
	 * @return static
	 */
	public static function optional( Matcher $matcher ) {
		return new static( $matcher, 0, 1, false );
	}

	/**
	 * Implements "*": 0 or more matches
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-zero-plus
	 * @param Matcher $matcher
	 * @return static
	 */
	public static function star( Matcher $matcher ) {
		return new static( $matcher, 0, INF, false );
	}

	/**
	 * Implements "+": 1 or more matches
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-one-plus
	 * @param Matcher $matcher
	 * @return static
	 */
	public static function plus( Matcher $matcher ) {
		return new static( $matcher, 1, INF, false );
	}

	/**
	 * Implements "{A,B}": Between A and B matches
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-num-range
	 * @param Matcher $matcher
	 * @param int|float $min Minimum number of matches
	 * @param int|float $max Maximum number of matches
	 * @return static
	 */
	public static function count( Matcher $matcher, $min, $max ) {
		return new static( $matcher, $min, $max, false );
	}

	/**
	 * Implements "#" and "#{A,B}": Between A and B matches, comma-separated
	 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-comma
	 * @param Matcher $matcher
	 * @param int|float $min Minimum number of matches
	 * @param int|float $max Maximum number of matches
	 * @return static
	 */
	public static function hash( Matcher $matcher, $min = 1, $max = INF ) {
		return new static( $matcher, $min, $max, true );
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$used = [];

		// Maintain a stack of matches for backtracking purposes.
		$stack = [
			[
				new GrammarMatch( $values, $start, 0 ),
				$this->matcher->generateMatches( $values, $start, $options )
			]
		];
		do {
			/** @var $lastMatch GrammarMatch */
			/** @var $iter Iterator<GrammarMatch> */
			[ $lastMatch, $iter ] = $stack[count( $stack ) - 1];

			// If the top of the stack has no more matches, pop it, maybe
			// yield the last matched position, and loop.
			if ( !$iter->valid() ) {
				array_pop( $stack );
				$ct = count( $stack );
				$pos = $lastMatch->getNext();
				if ( $ct >= $this->min && $ct <= $this->max ) {
					$newMatch = $this->makeMatch( $values, $start, $pos, $lastMatch, $stack );
					$mid = $newMatch->getUniqueID();
					if ( !isset( $used[$mid] ) ) {
						$used[$mid] = 1;
						yield $newMatch;
					}
				}
				continue;
			}

			// Find the next match for the current top of the stack.
			$match = $iter->current();
			$iter->next();

			// Quantifiers don't work well when the quantified thing can be empty.
			if ( $match->getLength() === 0 ) {
				throw new UnexpectedValueException( 'Empty match in quantifier!' );
			}

			$nextFrom = $match->getNext();

			// There can only be more matches after this one if we haven't
			// reached our maximum yet.
			$canBeMore = count( $stack ) < $this->max;

			// Commas are slightly tricky:
			// 1. If there is a following comma, start the next Matcher after it.
			// 2. If not, there can't be any more Matchers following.
			// And in either case optional whitespace is always allowed.
			if ( $this->commas ) {
				$n = $nextFrom;
				if ( isset( $values[$n] ) && $values[$n] instanceof Token &&
					// @phan-suppress-next-line PhanNonClassMethodCall False positive
					$values[$n]->type() === Token::T_WHITESPACE
				) {
					$n = $this->next( $values, $n, [ 'skip-whitespace' => true ] + $options );
				}
				if ( isset( $values[$n] ) && $values[$n] instanceof Token &&
					// @phan-suppress-next-line PhanNonClassMethodCall False positive
					$values[$n]->type() === Token::T_COMMA
				) {
					$nextFrom = $this->next( $values, $n, [ 'skip-whitespace' => true ] + $options );
				} else {
					$canBeMore = false;
				}
			}

			// If there can be more matches, push another one onto the stack
			// and try it. Otherwise, yield and continue with the current match.
			if ( $canBeMore ) {
				$stack[] = [ $match, $this->matcher->generateMatches( $values, $nextFrom, $options ) ];
			} else {
				$ct = count( $stack );
				$pos = $match->getNext();
				if ( $ct >= $this->min && $ct <= $this->max ) {
					$newMatch = $this->makeMatch( $values, $start, $pos, $match, $stack );
					$mid = $newMatch->getUniqueID();
					if ( !isset( $used[$mid] ) ) {
						$used[$mid] = 1;
						yield $newMatch;
					}
				}
			}
		} while ( $stack );
	}
}

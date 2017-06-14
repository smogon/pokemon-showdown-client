<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSFunction;
use Wikimedia\CSS\Objects\SimpleBlock;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Util;

/**
 * Represent a match from a Matcher.
 */
class Match {

	/** @var int */
	protected $start, $length;

	/** @var ComponentValue[] Matched ComponentValues */
	protected $values;

	/** @var string|null */
	protected $name = null;

	/** @var Match[] Captured submatches */
	protected $capturedMatches = [];

	/**
	 * @param ComponentValueList $list List containing the match
	 * @param int $start Starting index of the match.
	 * @param int $length Number of tokens in the match.
	 * @param string|null $name Give a name to this match.
	 * @param Match[] $capturedMatches Captured submatches of this match.
	 */
	public function __construct(
		ComponentValueList $list, $start, $length, $name = null, array $capturedMatches = []
	) {
		Util::assertAllInstanceOf( $capturedMatches, Match::class, '$capturedMatches' );

		$this->values = $list->slice( $start, $length );
		$this->start = $start;
		$this->length = $length;
		$this->name = $name;
		$this->capturedMatches = $capturedMatches;
	}

	/**
	 * The matched values
	 * @return ComponentValue[]
	 */
	public function getValues() {
		return $this->values;
	}

	/**
	 * The starting position of this match within the original list of values.
	 * @return int
	 */
	public function getStart() {
		return $this->start;
	}

	/**
	 * The length of this match
	 * @return int
	 */
	public function getLength() {
		return $this->length;
	}

	/**
	 * The position after this match, as in index into the original list of values.
	 * @return int
	 */
	public function getNext() {
		return $this->start + $this->length;
	}

	/**
	 * The name of this match
	 * @return string|null
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * The captured submatches of this match
	 *
	 * This returns the matches from capturing submatchers (see
	 * Matcher::capture()) that matched during the matching of the top-level
	 * matcher that returned this match. If capturing submatchers were nested,
	 * the Match objects returned here will themselves have captured submatches to
	 * return.
	 *
	 * To borrow PCRE regular expression syntax, if the "pattern" described by
	 * the Matchers resembled `www(?<A>xxx(?<B>yyy)xxx)(?<C>zzz)*` then the
	 * top-level Match's getCapturedMatches() would return a Match named "A"
	 * (containing the "xxxyyyxxx" bit) and zero or more matches named "C" (for
	 * each "zzz"), and that "A" Match's getCapturedMatches() would return a Match
	 * named "B" (containing just the "yyy").
	 *
	 * Note that the start and end positions reported by captured matches may be
	 * relative to a containing SimpleBlock or CSSFunction's value rather than
	 * to the ComponentValueList passed to the top-level Matcher.
	 *
	 * @return Match[]
	 */
	public function getCapturedMatches() {
		return $this->capturedMatches;
	}

	/**
	 * Return a key for this matcher's state
	 * @return string
	 */
	public function getUniqueID() {
		$data = [ $this->start, $this->length, $this->name ];
		foreach ( $this->capturedMatches as $m ) {
			$data[] = $m->getUniqueId();
		}
		return md5( join( "\n", $data ) );
	}

	/**
	 * Replace whitespace in the matched values
	 * @private For use by Matcher only
	 * @param Token $old
	 * @param Token $new
	 */
	public function fixWhitespace( Token $old, Token $new ) {
		foreach ( $this->values as $k => $v ) {
			if ( $v === $old ) {
				$this->values[$k] = $new;
			}
		}
		foreach ( $this->capturedMatches as $m ) {
			$m->fixWhitespace( $old, $new );
		}
	}
}

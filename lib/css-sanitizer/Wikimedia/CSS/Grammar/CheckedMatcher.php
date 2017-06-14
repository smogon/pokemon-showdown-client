<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;

/**
 * Wrap another matcher in a callback to verify the matches
 */
class CheckedMatcher extends Matcher {
	/** @var Matcher */
	private $matcher = null;

	/** @var callable */
	protected $check;

	/**
	 * @param Matcher $matcher Base matcher
	 * @param callable $check Function to check the match is really valid.
	 *  Prototype is bool func( ComponentValueList $values, Match $match, array $options )
	 */
	public function __construct( Matcher $matcher, callable $check ) {
		$this->matcher = $matcher;
		$this->check = $check;
	}

	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		foreach ( $this->matcher->generateMatches( $values, $start, $options ) as $match ) {
			if ( call_user_func( $this->check, $values, $match, $options ) ) {
				yield $this->makeMatch( $values, $start, $match->getNext(), $match );
			}
		}
	}
}

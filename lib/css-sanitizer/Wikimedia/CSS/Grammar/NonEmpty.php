<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;

/**
 * Matcher that requires its sub-Matcher has only non-empty matches ("!" multiplier)
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#mult-req
 */
class NonEmpty extends Matcher {
	/** @var Matcher */
	protected $matcher;

	/**
	 * @param Matcher $matcher
	 */
	public function __construct( Matcher $matcher ) {
		$this->matcher = $matcher;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		foreach ( $this->matcher->generateMatches( $values, $start, $options ) as $match ) {
			if ( $match->getLength() !== 0 ) {
				yield $this->makeMatch( $values, $start, $match->getNext(), $match );
			}
		}
	}
}

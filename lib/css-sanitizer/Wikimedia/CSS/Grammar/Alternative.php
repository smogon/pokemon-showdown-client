<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Util;

/**
 * Matcher that matches one out of a set of Matchers ("|" combiner).
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#comb-one
 */
class Alternative extends Matcher {
	/** @var Matcher[] */
	protected $matchers;

	/**
	 * @param Matcher[] $matchers
	 */
	public function __construct( array $matchers ) {
		Util::assertAllInstanceOf( $matchers, Matcher::class, '$matchers' );
		$this->matchers = $matchers;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$used = [];
		foreach ( $this->matchers as $matcher ) {
			foreach ( $matcher->generateMatches( $values, $start, $options ) as $match ) {
				$newMatch = $this->makeMatch( $values, $start, $match->getNext(), $match );
				$mid = $newMatch->getUniqueID();
				if ( !isset( $used[$mid] ) ) {
					$used[$mid] = 1;
					yield $newMatch;
				}
			}
		}
	}
}

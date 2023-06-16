<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that asserts there was no whitespace before the current position.
 */
class NoWhitespace extends Matcher {

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start - 1] ?? null;
		if ( !$cv instanceof Token || $cv->type() !== Token::T_WHITESPACE ) {
			yield $this->makeMatch( $values, $start, $start );
		}
	}
}

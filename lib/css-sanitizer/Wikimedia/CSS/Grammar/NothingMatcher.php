<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\ComponentValueList;

/**
 * Matcher that matches nothing
 */
class NothingMatcher extends Matcher {
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		return new \EmptyIterator;
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches runs of whitespace.
 */
class WhitespaceMatcher extends Matcher {

	/** @var bool */
	protected $significant;

	/**
	 * @param array $options
	 *  - significant: (bool) Whether the whitespace being matched is significant.
	 *    This also controls whether it behaves as `<ws>*` (false) or `<ws>+` (true).
	 */
	public function __construct( array $options = [] ) {
		$this->significant = !empty( $options['significant'] );
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$end = $start;
		while ( isset( $values[$end] ) &&
			// @phan-suppress-next-line PhanNonClassMethodCall False positive
			$values[$end] instanceof Token && $values[$end]->type() === Token::T_WHITESPACE
		) {
			$end++;
		}

		// If it's not significant, return whatever we found.
		if ( !$this->significant ) {
			yield $this->makeMatch( $values, $start, $end );
			return;
		}

		// If we found zero whitespace, $options says we're skipping
		// whitespace, and whitespace was actually skipped, rewind one token.
		// Otherwise, return no match.
		if ( $end === $start ) {
			$start--;
			if ( !$options['skip-whitespace'] || !isset( $values[$start] ) ||
				// @phan-suppress-next-line PhanNonClassMethodCall False positive
				!$values[$start] instanceof Token || $values[$start]->type() !== Token::T_WHITESPACE
			) {
				return;
			}
		}

		// Return the match. Include a 'significantWhitespace' capture.
		yield $this->makeMatch( $values, $start, $end,
			new GrammarMatch( $values, $start, 1, 'significantWhitespace' )
		);
	}
}

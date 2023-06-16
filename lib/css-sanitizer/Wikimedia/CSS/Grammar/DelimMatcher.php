<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches one of a set of values.
 *
 * This is intended for matching specific <delim-token>s, but will work for
 * other types (case-sensitively) too. For the more common case-insensitive
 * identifier matching, use KeywordMatcher.
 *
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-types
 */
class DelimMatcher extends Matcher {
	/** @var string One of the Token::T_* constants */
	protected $type;

	/** @var string[] Values to match */
	protected $values;

	/**
	 * @param string|string[] $values Token values to match
	 * @param array $options Options
	 *  - type: (string) Token type to match. Default is Token::T_DELIM.
	 */
	public function __construct( $values, array $options = [] ) {
		$options += [
			'type' => Token::T_DELIM,
		];

		$this->values = array_map( 'strval', (array)$values );
		$this->type = $options['type'];
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start] ?? null;
		if ( $cv instanceof Token && $cv->type() === $this->type &&
			in_array( $cv->value(), $this->values, true )
		) {
			yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ) );
		}
	}
}

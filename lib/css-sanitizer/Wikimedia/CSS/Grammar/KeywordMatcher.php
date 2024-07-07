<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches one of a set of keywords, case-insensitively
 *
 * This is intended for matching specific <ident-token>s, but will work for
 * other types (case-insensitively) too. For delimiter (or case-sensitive)
 * matching, use DelimMatcher.
 *
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-types
 */
class KeywordMatcher extends Matcher {
	/** @var string One of the Token::T_* constants */
	protected $type;

	/** @var array Associative array with keys being the values to match */
	protected $values;

	/**
	 * @param string|string[] $values Token values to match
	 * @param array $options Options
	 *  - type: (string) Token type to match. Default is Token::T_IDENT.
	 */
	public function __construct( $values, array $options = [] ) {
		$options += [
			'type' => Token::T_IDENT,
		];

		$this->values = array_flip( array_map( 'strtolower', (array)$values ) );
		$this->type = $options['type'];
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start] ?? null;
		if ( $cv instanceof Token && $cv->type() === $this->type &&
			isset( $this->values[strtolower( $cv->value() )] )
		) {
			yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ) );
		}
	}
}

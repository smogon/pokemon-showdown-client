<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches a token of a particular type
 * @see https://www.w3.org/TR/2019/CR-css-values-3-20190606/#component-types
 */
class TokenMatcher extends Matcher {
	/** @var string One of the Token::T_* constants */
	protected $type;

	/** @var callable|null Something to call to further validate the token */
	protected $callback = null;

	/**
	 * @param string $type Token type to match
	 * @param callable|null $callback Something to call to further validate the token.
	 *  bool callback( Token )
	 */
	public function __construct( $type, callable $callback = null ) {
		$this->type = $type;
		$this->callback = $callback;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start] ?? null;
		if ( $cv instanceof Token && $cv->type() === $this->type &&
			( !$this->callback || call_user_func( $this->callback, $cv ) )
		) {
			yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ) );
		}
	}
}

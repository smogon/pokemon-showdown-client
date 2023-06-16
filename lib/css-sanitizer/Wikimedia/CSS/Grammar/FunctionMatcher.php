<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Closure;
use InvalidArgumentException;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSFunction;

/**
 * Matcher that matches a CSSFunction
 *
 * The grammar definitions in the standards seem to be written assuming they're
 * being passed a sequence of Tokens only, even though they're defined over a
 * sequence of ComponentValues (which includes SimpleBlocks and CSSFunctions)
 * instead.
 *
 * Thus, to be safe you'll want to use this when a grammar specifies something
 * like `FUNCTION <stuff> ')'`.
 */
class FunctionMatcher extends Matcher {
	/** @var callable|null Function name */
	protected $nameCheck;

	/** @var Matcher */
	protected $matcher;

	/**
	 * @param string|Closure|null $name Function name, case-insensitive, or a
	 *  function to check the name.
	 * @param Matcher $matcher Matcher for the contents of the function
	 */
	public function __construct( $name, Matcher $matcher ) {
		if ( is_string( $name ) ) {
			$this->nameCheck = static function ( $s ) use ( $name ) {
				return !strcasecmp( $s, $name );
			};
		} elseif ( is_callable( $name ) || $name === null ) {
			$this->nameCheck = $name;
		} else {
			throw new InvalidArgumentException( '$name must be a string, callable, or null' );
		}
		$this->matcher = $matcher;
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$cv = $values[$start] ?? null;
		if ( $cv instanceof CSSFunction &&
			( !$this->nameCheck || call_user_func( $this->nameCheck, $cv->getName() ) )
		) {
			// To successfully match, our sub-Matcher needs to match the whole
			// content of the function.
			$l = $cv->getValue()->count();
			$s = $this->next( $cv->getValue(), -1, $options );
			foreach ( $this->matcher->generateMatches( $cv->getValue(), $s, $options ) as $match ) {
				if ( $match->getNext() === $l ) {
					// Matched the whole content of the function, so yield the
					// token after the function.
					yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ), $match );
					return;
				}
			}
		}
	}
}

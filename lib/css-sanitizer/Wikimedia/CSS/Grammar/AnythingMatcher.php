<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use InvalidArgumentException;
use UnexpectedValueException;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSFunction;
use Wikimedia\CSS\Objects\SimpleBlock;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches anything except bad strings, bad urls, and unmatched
 * left-paren, left-brace, or left-bracket.
 * @warning Be very careful using this!
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#any-value
 */
class AnythingMatcher extends Matcher {

	/** @var bool */
	protected $toplevel;

	/** @var string '', '*', or '+' */
	protected $quantifier;

	/** @var Matcher[] */
	protected $matchers;

	/**
	 * @param array $options
	 *  - toplevel: (bool) If true, disallows some extra tokens (i.e. it's the
	 *    draft's `<declaration-value>` instead of `<any-value>`)
	 *  - quantifier: (string) Set to '*' or '+' to work like `<value>*` or
	 *    `<value>+` but without backtracking. Note this will probably fail to
	 *    match correctly if anything else is supposed to come after the
	 *    AnythingMatcher, i.e. only use this where there's nothing else to the
	 *    end of the input.
	 * @note To properly match the draft's `<declaration-value>` or
	 *  `<any-value>`, specify '+' for the 'quantifier' option.
	 */
	public function __construct( array $options = [] ) {
		$this->toplevel = !empty( $options['toplevel'] );
		$this->quantifier = $options['quantifier'] ?? '';
		if ( !in_array( $this->quantifier, [ '', '+', '*' ], true ) ) {
			throw new InvalidArgumentException( 'Invalid quantifier' );
		}

		$recurse = !$this->toplevel && $this->quantifier === '*'
			? $this : new static( [ 'quantifier' => '*' ] );
		$this->matchers[Token::T_FUNCTION] = new FunctionMatcher( null, $recurse );
		foreach ( [ Token::T_LEFT_PAREN, Token::T_LEFT_BRACE, Token::T_LEFT_BRACKET ] as $delim ) {
			$this->matchers[$delim] = new BlockMatcher( $delim, $recurse );
		}
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		$origStart = $start;
		$lastMatch = $this->quantifier === '*' ? $this->makeMatch( $values, $start, $start ) : null;
		do {
			$newMatch = null;
			$cv = $values[$start] ?? null;
			if ( $cv instanceof Token ) {
				switch ( $cv->type() ) {
					case Token::T_BAD_STRING:
					case Token::T_BAD_URL:
					case Token::T_RIGHT_PAREN:
					case Token::T_RIGHT_BRACE:
					case Token::T_RIGHT_BRACKET:
					case Token::T_EOF:
						// Not allowed
						break;

					case Token::T_SEMICOLON:
						if ( !$this->toplevel ) {
							$newMatch = $this->makeMatch(
								$values, $origStart, $this->next( $values, $start, $options ), $lastMatch
							);
						}
						break;

					case Token::T_DELIM:
						if ( !$this->toplevel || $cv->value() !== '!' ) {
							$newMatch = $this->makeMatch(
								$values, $origStart, $this->next( $values, $start, $options ), $lastMatch
							);
						}
						break;

					case Token::T_WHITESPACE:
						// If we encounter whitespace, assume it's significant.
						$newMatch = $this->makeMatch(
							$values, $origStart, $this->next( $values, $start, $options ),
							new GrammarMatch( $values, $start, 1, 'significantWhitespace' ),
							[ [ $lastMatch ] ]
						);
						break;

					case Token::T_FUNCTION:
					case Token::T_LEFT_PAREN:
					case Token::T_LEFT_BRACE:
					case Token::T_LEFT_BRACKET:
						// Should never happen
						// @codeCoverageIgnoreStart
						throw new UnexpectedValueException( "How did a \"{$cv->type()}\" token get here?" );
						// @codeCoverageIgnoreEnd

					default:
						$newMatch = $this->makeMatch(
							$values, $origStart, $this->next( $values, $start, $options ), $lastMatch
						);
						break;
				}
			} elseif ( $cv instanceof CSSFunction || $cv instanceof SimpleBlock ) {
				$tok = $cv instanceof SimpleBlock ? $cv->getStartTokenType() : Token::T_FUNCTION;
				// We know there's only one way for the submatcher to match, so just grab the first one
				$match = $this->matchers[$tok]
					->generateMatches( new ComponentValueList( [ $cv ] ), 0, $options )
					->current();
				if ( $match ) {
					$newMatch = $this->makeMatch(
						$values, $origStart, $this->next( $values, $start, $options ), $match, [ [ $lastMatch ] ]
					);
				}
			}
			if ( $newMatch ) {
				$lastMatch = $newMatch;
				$start = $newMatch->getNext();
			}
		} while ( $this->quantifier !== '' && $newMatch );

		if ( $lastMatch ) {
			yield $lastMatch;
		}
	}
}

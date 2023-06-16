<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use InvalidArgumentException;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSFunction;
use Wikimedia\CSS\Objects\Token;

/**
 * Matcher that matches a CSSFunction for a URL or a T_URL token
 */
class UrlMatcher extends FunctionMatcher {
	/** @var callable|null */
	protected $urlCheck;

	/**
	 * @param callable|null $urlCheck Function to check that the URL is really valid.
	 *  Prototype is bool func( string $url, ComponentValue[] $modifiers )
	 * @param array $options Additional options:
	 *  - modifierMatcher: (Matcher) Matcher for URL modifiers. The default is
	 *    a NothingMatcher.
	 */
	public function __construct( callable $urlCheck = null, array $options = [] ) {
		if ( isset( $options['modifierMatcher'] ) ) {
			$modifierMatcher = $options['modifierMatcher'];
			if ( !$modifierMatcher instanceof Matcher ) {
				throw new InvalidArgumentException( 'modifierMatcher must be a Matcher' );
			}
		} else {
			$modifierMatcher = new NothingMatcher;
		}

		$funcContents = new Juxtaposition( [
			TokenMatcher::create( Token::T_STRING )->capture( 'url' ),
			Quantifier::star( $modifierMatcher->capture( 'modifier' ) ),
		] );

		$this->urlCheck = $urlCheck;
		parent::__construct( 'url', $funcContents );
	}

	/**
	 * Return a Matcher for any grammatically-correct modifier
	 * @return Matcher
	 */
	public static function anyModifierMatcher() {
		return Alternative::create( [
			new TokenMatcher( Token::T_IDENT ),
			new FunctionMatcher( null, new AnythingMatcher( [ 'quantifier' => '*' ] ) ),
		] );
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		// First, is it a URL token?
		$cv = $values[$start] ?? null;
		if ( $cv instanceof Token && $cv->type() === Token::T_URL ) {
			$url = $cv->value();
			if ( !$this->urlCheck || call_user_func( $this->urlCheck, $url, [] ) ) {
				$match = new GrammarMatch( $values, $start, 1, 'url' );
				yield $this->makeMatch( $values, $start, $this->next( $values, $start, $options ), $match );
			}
			return;
		}

		// Nope. Try it as a FunctionMatcher and extract the URL and modifiers
		// for each match.
		foreach ( parent::generateMatches( $values, $start, $options ) as $match ) {
			$url = null;
			$modifiers = [];
			foreach ( $match->getCapturedMatches() as $submatch ) {
				$cvs = $submatch->getValues();
				if ( $cvs[0] instanceof Token && $submatch->getName() === 'url' ) {
					$url = $cvs[0]->value();
				} elseif ( $submatch->getName() === 'modifier' ) {
					if ( $cvs[0] instanceof CSSFunction ) {
						$modifiers[] = $cvs[0];
					} elseif ( $cvs[0] instanceof Token && $cvs[0]->type() === Token::T_IDENT ) {
						$modifiers[] = $cvs[0];
					}
				}
			}
			if ( $url && ( !$this->urlCheck || call_user_func( $this->urlCheck, $url, $modifiers ) ) ) {
				yield $match;
			}
		}
	}
}

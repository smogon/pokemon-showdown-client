<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSFunction;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\SimpleBlock;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Parser\Parser;
use Wikimedia\CSS\Util;

/**
 * Base class for CSS rule sanitizers
 */
abstract class RuleSanitizer extends Sanitizer {

	/**
	 * Return an integer indicating ordering constraints. Lower numbers must
	 * come earlier in the document.
	 * @return int|int[] If two numbers are returned, these are the test and
	 *  the newly-set indexes, respectively.
	 */
	public function getIndex() {
		return 1000;
	}

	/**
	 * Sanitize a block's contents as a DeclarationList, in place
	 * @param SimpleBlock $block
	 * @param PropertySanitizer $sanitizer
	 */
	protected function sanitizeDeclarationBlock( SimpleBlock $block, PropertySanitizer $sanitizer ) {
		$blockContents = $block->getValue();
		$parser = Parser::newFromTokens( $blockContents->toTokenArray() );
		$declarations = $parser->parseDeclarationList();
		$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $parser->getParseErrors() );
		$declarations = $this->sanitizeList( $sanitizer, $declarations );
		$blockContents->clear();
		$blockContents->add( $declarations->toComponentValueArray() );
	}

	/**
	 * Sanitize a block's contents as a RuleList, in place
	 * @param SimpleBlock $block
	 * @param RuleSanitizer[] $sanitizers
	 */
	protected function sanitizeRuleBlock( SimpleBlock $block, array $sanitizers ) {
		$blockContents = $block->getValue();
		$parser = Parser::newFromTokens( $blockContents->toTokenArray() );
		$rules = $parser->parseRuleList();
		$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $parser->getParseErrors() );
		$rules = $this->sanitizeRules( $sanitizers, $rules );
		$blockContents->clear();
		$blockContents->add( $rules->toComponentValueArray() );
	}

	/**
	 * For the whitespace at the start of the prelude
	 *
	 * The matcher probably marked it insignificant, but it's actually
	 * significant if it's needed to separate the at-keyword and the first
	 * thing in the prelude. And if there isn't a whitespace there, add one if
	 * it would be significant.
	 *
	 * @param AtRule $rule
	 * @param bool $cloneIfNecessary
	 * @return AtRule
	 */
	protected function fixPreludeWhitespace( AtRule $rule, $cloneIfNecessary ) {
		$prelude = $rule->getPrelude();
		if ( !count( $prelude ) ) {
			return $rule;
		}

		$cv = Util::findFirstNonWhitespace( $rule->getPrelude() );
		if ( !$cv ) {
			foreach ( $prelude as $i => $v ) {
				if ( $v instanceof Token && $v->significant() ) {
					$prelude[$i] = $v->copyWithSignificance( false );
				}
			}
			return $rule;
		}

		$significant = $cv instanceof CSSFunction ||
			( $cv instanceof Token &&
				Token::separate( new Token( Token::T_AT_KEYWORD, $rule->getName() ), $cv )
			);

		// @phan-suppress-next-line PhanNonClassMethodCall False positive
		if ( $prelude[0] instanceof Token && $prelude[0]->type() === Token::T_WHITESPACE ) {
			// @phan-suppress-next-line PhanNonClassMethodCall False positive
			$prelude[0] = $prelude[0]->copyWithSignificance( $significant );
		} elseif ( $significant ) {
			if ( $cloneIfNecessary ) {
				$rule = clone $rule;
				$prelude = $rule->getPrelude();
			}
			$prelude->add( new Token( Token::T_WHITESPACE ), 0 );
		}

		return $rule;
	}

	/**
	 * Indicate whether this rule is handled by this sanitizer.
	 * @param Rule $rule
	 * @return bool
	 */
	abstract public function handlesRule( Rule $rule );
}

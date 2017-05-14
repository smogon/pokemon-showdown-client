<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\AnythingMatcher;
use Wikimedia\CSS\Grammar\BlockMatcher;
use Wikimedia\CSS\Grammar\CheckedMatcher;
use Wikimedia\CSS\Grammar\FunctionMatcher;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\KeywordMatcher;
use Wikimedia\CSS\Grammar\Match;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\NothingMatcher;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Parser\Parser;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@supports rule
 * @see https://www.w3.org/TR/2013/CR-css3-conditional-20130404/#at-supports
 */
class SupportsAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $conditionMatcher;

	/** @var RuleSanitizer[] */
	protected $ruleSanitizers = [];

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param array $options Additional options:
	 *  strict: (bool) Only accept defined syntax. Default true.
	 *  declarationSanitizer: (PropertySanitizer) Check declarations against this Sanitizer.
	 */
	public function __construct( MatcherFactory $matcherFactory, array $options = [] ) {
		$options += [
			'strict' => true,
		];
		$declarationSanitizer = null;
		if ( isset( $options['declarationSanitizer'] ) ) {
			$declarationSanitizer = $options['declarationSanitizer'];
			if ( !$declarationSanitizer instanceof PropertySanitizer ) {
				throw new \InvalidArgumentException(
					'declarationSanitizer must be an instance of ' . PropertySanitizer::class
				);
			}
		}

		$ws = $matcherFactory->significantWhitespace();
		$anythingPlus = new AnythingMatcher( [ 'quantifier' => '+' ] );

		if ( $options['strict'] ) {
			$generalEnclosed = new NothingMatcher();
		} else {
			$generalEnclosed = new Alternative( [
				new FunctionMatcher( null, $anythingPlus ),
				new BlockMatcher( Token::T_LEFT_PAREN, new Juxtaposition( [
					$matcherFactory->ident(), $anythingPlus
				] ) ),
			] );
		}

		$supportsConditionBlock = new NothingMatcher(); // temp
		$supportsConditionInParens = new Alternative( [
			&$supportsConditionBlock,
			new BlockMatcher( Token::T_LEFT_PAREN, new CheckedMatcher(
				$anythingPlus,
				function ( ComponentValueList $list, Match $match, array $options )
					use ( $declarationSanitizer )
				{
					$cvlist = new ComponentValueList( $match->getValues() );
					$parser = Parser::newFromTokens( $cvlist->toTokenArray() );
					$declaration = $parser->parseDeclaration();
					if ( $parser->getParseErrors() || !$declaration ) {
						return false;
					}
					if ( !$declarationSanitizer ) {
						return true;
					}
					$oldErrors = $declarationSanitizer->sanitizationErrors;
					$ret = $declarationSanitizer->doSanitize( $declaration );
					$errors = $declarationSanitizer->getSanitizationErrors();
					$declarationSanitizer->sanitizationErrors = $oldErrors;
					return $ret === $declaration && !$errors;
				}
			) ),
			$generalEnclosed,
		] );
		$supportsCondition = new Alternative( [
			new Juxtaposition( [ new KeywordMatcher( 'not' ), $ws, $supportsConditionInParens ] ),
			new Juxtaposition( [ $supportsConditionInParens, Quantifier::plus( new Juxtaposition( [
				$ws, new KeywordMatcher( 'and' ), $ws, $supportsConditionInParens
			] ) ) ] ),
			new Juxtaposition( [ $supportsConditionInParens, Quantifier::plus( new Juxtaposition( [
				$ws, new KeywordMatcher( 'or' ), $ws, $supportsConditionInParens
			] ) ) ] ),
			$supportsConditionInParens,
		] );
		$supportsConditionBlock = new BlockMatcher( Token::T_LEFT_PAREN, $supportsCondition );

		$this->conditionMatcher = $supportsCondition;
	}

	/**
	 * Access the list of rule sanitizers
	 * @return RuleSanitizer[]
	 */
	public function getRuleSanitizers() {
		return $this->ruleSanitizers;
	}

	/**
	 * Set the list of rule sanitizers
	 * @param RuleSanitizer[] $ruleSanitizers
	 */
	public function setRuleSanitizers( array $ruleSanitizers ) {
		Util::assertAllInstanceOf( $ruleSanitizers, RuleSanitizer::class, '$ruleSanitizers' );
		$this->ruleSanitizers = $ruleSanitizers;
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'supports' );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'supports' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'supports' ] );
			return null;
		}

		// Test the media query
		if ( !$this->conditionMatcher->match( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-supports-condition', $cv );
			} else {
				$this->sanitizationError( 'missing-supports-condition', $object );
			}
			return null;
		}

		$ret = clone( $object );
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeRuleBlock( $ret->getBlock(), $this->ruleSanitizers );

		return $ret;
	}
}

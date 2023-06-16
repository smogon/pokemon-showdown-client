<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\KeywordMatcher;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Grammar\TokenMatcher;
use Wikimedia\CSS\Grammar\UnorderedGroup;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Declaration;
use Wikimedia\CSS\Objects\DeclarationOrAtRuleList;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Parser\Parser;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@page rule
 * @see https://www.w3.org/TR/2018/WD-css-page-3-20181018/
 */
class PageAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $pageSelectorMatcher;

	/** @var PropertySanitizer */
	protected $propertySanitizer;

	/** @var MarginAtRuleSanitizer */
	protected $ruleSanitizer;

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param PropertySanitizer $propertySanitizer Sanitizer for declarations
	 */
	public function __construct(
		MatcherFactory $matcherFactory, PropertySanitizer $propertySanitizer
	) {
		$ows = $matcherFactory->optionalWhitespace();
		$pseudoPage = new Juxtaposition( [
			new TokenMatcher( Token::T_COLON ),
			new KeywordMatcher( [ 'left', 'right', 'first', 'blank' ] ),
		] );
		$this->pageSelectorMatcher = new Alternative( [
			Quantifier::hash( new Juxtaposition( [
				$ows,
				new Alternative( [
					Quantifier::plus( $pseudoPage ),
					new Juxtaposition( [ $matcherFactory->ident(), Quantifier::star( $pseudoPage ) ] ),
				] ),
				$ows,
			] ) ),
			$ows
		] );
		$this->pageSelectorMatcher->setDefaultOptions( [ 'skip-whitespace' => false ] );

		// Clone the $propertySanitizer and inject the special properties
		$this->propertySanitizer = clone $propertySanitizer;
		$this->propertySanitizer->addKnownProperties( [
			'size' => new Alternative( [
				Quantifier::count( $matcherFactory->length(), 1, 2 ),
				new KeywordMatcher( 'auto' ),
				UnorderedGroup::someOf( [
					new KeywordMatcher( [
						'A5', 'A4', 'A3', 'B5', 'B4', 'JIS-B5', 'JIS-B4', 'letter', 'legal', 'ledger',
					] ),
					new KeywordMatcher( [ 'portrait', 'landscape' ] ),
				] ),
			] ),
			'marks' => new Alternative( [
				new KeywordMatcher( 'none' ),
				UnorderedGroup::someOf( [
					new KeywordMatcher( 'crop' ),
					new KeywordMatcher( 'cross' ),
				] ),
			] ),
			'bleed' => new Alternative( [
				new KeywordMatcher( 'auto' ),
				$matcherFactory->length(),
			] ),
		] );

		$this->ruleSanitizer = new MarginAtRuleSanitizer( $propertySanitizer );
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'page' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'page' ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ 'page' ] );
			return null;
		}

		// Test the page selector
		$match = $this->pageSelectorMatcher->matchAgainst(
			$object->getPrelude(), [ 'mark-significance' => true ]
		);
		if ( !$match ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() ) ?: $object->getPrelude();
			$this->sanitizationError( 'invalid-page-selector', $cv );
			return null;
		}

		$ret = clone $object;
		$this->fixPreludeWhitespace( $ret, false );

		// Parse the block's contents into a list of declarations and at-rules,
		// sanitize it, and put it back into the block.
		$blockContents = $ret->getBlock()->getValue();
		$parser = Parser::newFromTokens( $blockContents->toTokenArray() );
		$oldList = $parser->parseDeclarationOrAtRuleList();
		$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $parser->getParseErrors() );
		$newList = new DeclarationOrAtRuleList();
		foreach ( $oldList as $thing ) {
			if ( $thing instanceof Declaration ) {
				$thing = $this->sanitizeObj( $this->propertySanitizer, $thing );
			} elseif ( $thing instanceof AtRule && $this->ruleSanitizer->handlesRule( $thing ) ) {
				$thing = $this->sanitizeObj( $this->ruleSanitizer, $thing );
			} else {
				$this->sanitizationError( 'invalid-page-rule-content', $thing );
				$thing = null;
			}
			if ( $thing ) {
				$newList->add( $thing );
			}
		}
		$blockContents->clear();
		$blockContents->add( $newList->toComponentValueArray() );

		return $ret;
	}
}

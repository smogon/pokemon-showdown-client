<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use InvalidArgumentException;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\QualifiedRule;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS style rule
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#style-rules
 */
class StyleRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $selectorMatcher;

	/** @var ComponentValue[] */
	protected $prependSelectors;

	/** @var Matcher|null */
	protected $hoistableMatcher;

	/** @var PropertySanitizer */
	protected $propertySanitizer;

	/**
	 * @param Matcher $selectorMatcher Matcher for valid selectors.
	 *  Probably from MatcherFactory::cssSelectorList().
	 * @param PropertySanitizer $propertySanitizer Sanitizer to test property declarations.
	 *  Probably an instance of StylePropertySanitizer.
	 * @param array $options Additional options
	 *  - prependSelectors: (ComponentValue[]) Prepend this (and a whitespace) to all selectors.
	 *    Note: $selectorMatcher must capture each selector with the name 'selector'.
	 *  - hoistableComponentMatcher: (Matcher) Component groups (simple selector sequences,
	 *    in CSS3 Selectors terminology) matched by this will be hoisted before the prepended
	 *    selector sequence. (To be more precise: the hoisted part is the longest prefix of
	 *    the selector that only contains matching simple selector sequences and descendant
	 *    combinators, and is not followed by a non-descendant combinator.)
	 *    This can be used to allow filtering by top-level conditional classes/IDs emitted by
	 *    some framework (e.g. html.no-js) while still jailing selectors into some subsection
	 *    of the content. For example, if prependSelectors is equivalent to '#content' and
	 *    hoistableComponentMatcher to [html|body]<simple selector>*  will turn
	 *    'html.no-js body.ltr div.list' into 'html.no-js body.ltr #content div.list'.
	 *    Note: $selectorMatcher must capture each simple selector group with the name 'simple'
	 *    and the combinators with 'combinator'.
	 */
	public function __construct(
		Matcher $selectorMatcher, PropertySanitizer $propertySanitizer, array $options = []
	) {
		$options += [
			'prependSelectors' => [],
			'hoistableComponentMatcher' => null,
		];
		Util::assertAllInstanceOf(
			$options['prependSelectors'], ComponentValue::class, 'prependSelectors'
		);
		if ( $options['hoistableComponentMatcher'] !== null &&
			 !$options['hoistableComponentMatcher'] instanceof Matcher
		) {
			throw new InvalidArgumentException( 'hoistableComponentMatcher must be a Matcher' );
		}

		$matcherFactory = MatcherFactory::singleton();

		// Add optional whitespace around the selector-matcher, because
		// selector-matchers don't usually have it.
		if ( !$selectorMatcher->getDefaultOptions()['skip-whitespace'] ) {
			$ows = $matcherFactory->optionalWhitespace();
			$this->selectorMatcher = new Juxtaposition( [
				$ows,
				$selectorMatcher,
				$ows->capture( 'trailingWS' ),
			] );
			$this->selectorMatcher->setDefaultOptions( $selectorMatcher->getDefaultOptions() );
		} else {
			$this->selectorMatcher = $selectorMatcher;
		}

		$this->propertySanitizer = $propertySanitizer;
		$this->prependSelectors = $options['prependSelectors'];
		if ( $options['hoistableComponentMatcher'] ) {
			$hoistablePrefixMatcher = new Juxtaposition( [
				$options['hoistableComponentMatcher'],
				Quantifier::star( new Juxtaposition( [
					$matcherFactory->significantWhitespace(),
					$options['hoistableComponentMatcher'],
				] ) )
			] );
			$this->hoistableMatcher = new Juxtaposition( [
				$hoistablePrefixMatcher->capture( 'prefix' ),
				$matcherFactory->significantWhitespace()->capture( 'ws' ),
				$matcherFactory->cssSelector()->capture( 'postfix' ),
			] );
			$this->hoistableMatcher->setDefaultOptions( [ 'skip-whitespace' => false ] );
		}
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof QualifiedRule;
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof QualifiedRule ) {
			$this->sanitizationError( 'expected-qualified-rule', $object );
			return null;
		}

		// Test that the prelude is a valid selector list
		$match = $this->selectorMatcher->matchAgainst( $object->getPrelude(), [ 'mark-significance' => true ] );
		if ( !$match ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-selector-list', $cv );
			} else {
				$this->sanitizationError( 'missing-selector-list', $object );
			}
			return null;
		}

		$ret = clone $object;

		if ( $this->prependSelectors ) {
			$prelude = $ret->getPrelude();
			$comma = [
				new Token( Token::T_COMMA ),
				new Token( Token::T_WHITESPACE, [ 'significant' => false ] )
			];
			$space = [
				new Token( Token::T_WHITESPACE, [ 'significant' => true ] )
			];
			$prelude->clear();
			foreach ( $match->getCapturedMatches() as $selectorOrWs ) {
				if ( $selectorOrWs->getName() === 'selector' ) {
					if ( $prelude->count() ) {
						$prelude->add( $comma );
					}

					$valueList = new ComponentValueList( $selectorOrWs->getValues() );
					$hoistMatch = $this->hoistableMatcher ? $this->hoistableMatcher->matchAgainst( $valueList ) : null;
					if ( $hoistMatch ) {
						[ $prefix, , $postfix ] = $hoistMatch->getCapturedMatches();
						$prelude->add( $prefix->getValues() );
						$prelude->add( $space );
						$prelude->add( $this->prependSelectors );
						$prelude->add( $space );
						$prelude->add( $postfix->getValues() );
					} else {
						$prelude->add( $this->prependSelectors );
						$prelude->add( $space );
						$prelude->add( $valueList );
					}
				} elseif ( $selectorOrWs->getName() === 'trailingWS' && $selectorOrWs->getLength() > 0 ) {
					$prelude->add( $selectorOrWs->getValues() );
				}
			}
		}

		$this->sanitizeDeclarationBlock( $ret->getBlock(), $this->propertySanitizer );

		return $ret;
	}

}

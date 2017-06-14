<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\QualifiedRule;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS style rule
 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#style-rules
 */
class StyleRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $selectorMatcher;

	/** @var ComponentValue[] */
	protected $prependSelectors;

	/** @var PropertySanitizer */
	protected $propertySanitizer;

	/**
	 * @param Matcher $selectorMatcher Matcher for valid selectors.
	 *  Probably from MatcherFactory::cssSelectorList().
	 * @param PropertySanitizer $propertySanitizer Sanitizer to test property declarations.
	 *  Probably an instance of StylePropertySanitizer.
	 * @param array $options Additional options
	 *  - prependSelectors: (ComponentValue[]) Prepend this to all selectors.
	 *    Include trailing whitespace if necessary. Note $selectorMatcher must
	 *    capture each selector with the name 'selector'.
	 */
	public function __construct(
		Matcher $selectorMatcher, PropertySanitizer $propertySanitizer, array $options = []
	) {
		$options += [
			'prependSelectors' => [],
		];

		// Add optional whitespace around the selector-matcher, because
		// selector-matchers don't usually have it.
		if ( !$selectorMatcher->getDefaultOptions()['skip-whitespace'] ) {
			$ows = MatcherFactory::singleton()->optionalWhitespace();
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
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof QualifiedRule;
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof QualifiedRule ) {
			$this->sanitizationError( 'expected-qualified-rule', $object );
			return null;
		}

		// Test that the prelude is a valid selector list
		$match = $this->selectorMatcher->match( $object->getPrelude(), [ 'mark-significance' => true ] );
		if ( !$match ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-selector-list', $cv );
			} else {
				$this->sanitizationError( 'missing-selector-list', $object );
			}
			return null;
		}

		$ret = clone( $object );

		// If necessary, munge the selector list
		if ( $this->prependSelectors ) {
			$prelude = $ret->getPrelude();
			$comma = [
				new Token( Token::T_COMMA ),
				new Token( Token::T_WHITESPACE, [ 'significant' => false ] )
			];
			$oldPrelude = $object->getPrelude();
			$prelude->clear();
			foreach ( $match->getCapturedMatches() as $m ) {
				if ( $m->getName() === 'selector' ) {
					if ( $prelude->count() ) {
						$prelude->add( $comma );
					}
					$prelude->add( $this->prependSelectors );
					$prelude->add( $m->getValues() );
				} elseif ( $m->getName() === 'trailingWS' && $m->getLength() > 0 ) {
					$prelude->add( $m->getValues() );
				}
			}
		}

		$this->sanitizeDeclarationBlock( $ret->getBlock(), $this->propertySanitizer );

		return $ret;
	}
}

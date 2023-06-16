<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\FunctionMatcher;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@import rule
 * @see https://www.w3.org/TR/2018/CR-css-cascade-4-20180828/#at-import
 */
class ImportAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $matcher;

	/**
	 * @param MatcherFactory $matcherFactory
	 * @param array $options Additional options:
	 *  - strict: (bool) Only accept defined syntax in supports(). Default true.
	 *  - declarationSanitizer: (PropertySanitizer) Check supports() declarations against this
	 *    Sanitizer.
	 */
	public function __construct( MatcherFactory $matcherFactory, array $options = [] ) {
		$declarationSanitizer = $options['declarationSanitizer'] ?? null;
		$strict = $options['strict'] ?? true;

		$this->matcher = new Juxtaposition( [
			new Alternative( [
				$matcherFactory->url( 'css' ),
				$matcherFactory->urlstring( 'css' ),
			] ),
			Quantifier::optional( new FunctionMatcher( 'supports', new Alternative( [
				$matcherFactory->cssSupportsCondition( $declarationSanitizer, $strict ),
				$matcherFactory->cssDeclaration( $declarationSanitizer ),
			] ) ) ),
			$matcherFactory->cssMediaQueryList(),
		] );
	}

	/** @inheritDoc */
	public function getIndex() {
		return -1000;
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'import' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'import' ] );
			return null;
		}

		if ( $object->getBlock() !== null ) {
			$this->sanitizationError( 'at-rule-block-not-allowed', $object->getBlock(), [ 'import' ] );
			return null;
		}
		if ( !$this->matcher->matchAgainst( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-import-value', $cv );
			} else {
				$this->sanitizationError( 'missing-import-source', $object );
			}
			return null;
		}
		return $this->fixPreludeWhitespace( $object, true );
	}
}

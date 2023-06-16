<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Alternative;
use Wikimedia\CSS\Grammar\Juxtaposition;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Grammar\Quantifier;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS \@namespace rule
 * @see https://www.w3.org/TR/2014/REC-css-namespaces-3-20140320/
 */
class NamespaceAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $matcher;

	/**
	 * @param MatcherFactory $matcherFactory
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		$this->matcher = new Juxtaposition( [
			Quantifier::optional( $matcherFactory->ident() ),
			new Alternative( [
				$matcherFactory->urlstring( 'namespace' ),
				$matcherFactory->url( 'namespace' ),
			] ),
		] );
	}

	/** @inheritDoc */
	public function getIndex() {
		return -900;
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'namespace' );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'namespace' ] );
			return null;
		}

		if ( $object->getBlock() !== null ) {
			$this->sanitizationError( 'at-rule-block-not-allowed', $object->getBlock(), [ 'namespace' ] );
			return null;
		}
		if ( !$this->matcher->matchAgainst( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-namespace-value', $cv );
			} else {
				$this->sanitizationError( 'missing-namespace-value', $object );
			}
			return null;
		}
		return $this->fixPreludeWhitespace( $object, true );
	}
}

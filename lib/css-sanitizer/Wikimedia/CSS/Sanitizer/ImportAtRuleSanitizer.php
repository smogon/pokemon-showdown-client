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
 * Sanitizes a CSS \@import rule
 * @see https://www.w3.org/TR/2016/CR-css-cascade-3-20160519/#at-import
 */
class ImportAtRuleSanitizer extends RuleSanitizer {

	/** @var Matcher */
	protected $matcher;

	/**
	 * @param MatcherFactory $matcherFactory
	 */
	public function __construct( MatcherFactory $matcherFactory ) {
		$this->matcher = new Juxtaposition( [
			new Alternative( [
				$matcherFactory->url( 'css' ),
				$matcherFactory->urlstring( 'css' ),
			] ),
			$matcherFactory->cssMediaQueryList(),
		] );
	}

	public function getIndex() {
		return -1000;
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), 'import' );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ 'import' ] );
			return null;
		}

		if ( $object->getBlock() !== null ) {
			$this->sanitizationError( 'at-rule-block-not-allowed', $object->getBlock(), [ 'import' ] );
			return null;
		}
		if ( !$this->matcher->match( $object->getPrelude(), [ 'mark-significance' => true ] ) ) {
			$cv = Util::findFirstNonWhitespace( $object->getPrelude() );
			if ( $cv ) {
				$this->sanitizationError( 'invalid-import-value', $cv );
			} else {
				$this->sanitizationError( 'missing-import-source', $object );
			}
			return null;
		}
		$object = $this->fixPreludeWhitespace( $object, true );

		return $object;
	}
}

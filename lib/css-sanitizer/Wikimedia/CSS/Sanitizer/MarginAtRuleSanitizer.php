<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Util;

/**
 * Sanitizes the margin at-rules inside a CSS \@page rule
 * @see https://www.w3.org/TR/2018/WD-css-page-3-20181018/
 */
class MarginAtRuleSanitizer extends RuleSanitizer {

	/** @var string[] */
	protected static $marginRuleNames = [
		'top-left-corner', 'top-left', 'top-center', 'top-right', 'top-right-corner',
		'bottom-left-corner', 'bottom-left', 'bottom-center', 'bottom-right', 'bottom-right-corner',
		'left-top', 'left-middle', 'left-bottom', 'right-top', 'right-middle', 'right-bottom',
	];

	/** @var PropertySanitizer */
	protected $propertySanitizer;

	/**
	 * @param PropertySanitizer $propertySanitizer Sanitizer for declarations
	 */
	public function __construct( PropertySanitizer $propertySanitizer ) {
		$this->propertySanitizer = $propertySanitizer;
	}

	/** @inheritDoc */
	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule &&
			in_array( strtolower( $rule->getName() ), self::$marginRuleNames, true );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof AtRule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-page-margin-at-rule', $object );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ $object->getName() ] );
			return null;
		}

		// No non-whitespace prelude allowed
		if ( Util::findFirstNonWhitespace( $object->getPrelude() ) ) {
			$this->sanitizationError( 'invalid-page-margin-at-rule', $object, [ $object->getName() ] );
			return null;
		}

		$ret = clone $object;
		$this->fixPreludeWhitespace( $ret, false );
		$this->sanitizeDeclarationBlock( $ret->getBlock(), $this->propertySanitizer );

		return $ret;
	}
}

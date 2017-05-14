<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\DeclarationList;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Parser\Parser;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a feature-value at-rule inside a CSS \@font-feature-values rule
 * @see https://www.w3.org/TR/2013/CR-css-fonts-3-20131003/#at-font-feature-values-rule
 */
class FontFeatureValueAtRuleSanitizer extends RuleSanitizer {

	/** @var string */
	protected $name;

	/** @var Matcher */
	protected $valueMatcher;

	/**
	 * @param string $name
	 * @param Matcher $valueMatcher
	 */
	public function __construct( $name, Matcher $valueMatcher ) {
		$this->name = $name;
		$this->valueMatcher = $valueMatcher;
	}

	public function handlesRule( Rule $rule ) {
		return $rule instanceof AtRule && !strcasecmp( $rule->getName(), $this->name );
	}

	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Rule || !$this->handlesRule( $object ) ) {
			$this->sanitizationError( 'expected-at-rule', $object, [ $this->name ] );
			return null;
		}

		if ( $object->getBlock() === null ) {
			$this->sanitizationError( 'at-rule-block-required', $object, [ $this->name ] );
			return null;
		}

		// No non-whitespace prelude allowed
		if ( Util::findFirstNonWhitespace( $object->getPrelude() ) ) {
			$this->sanitizationError( 'invalid-font-feature-value', $object, [ $this->name ] );
			return null;
		}

		$ret = clone( $object );
		$this->fixPreludeWhitespace( $ret, false );

		// Parse the block's contents into a list of declarations, sanitize it,
		// and put it back into the block.
		$blockContents = $ret->getBlock()->getValue();
		$parser = Parser::newFromTokens( $blockContents->toTokenArray() );
		$oldDeclarations = $parser->parseDeclarationList();
		$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $parser->getParseErrors() );
		$newDeclarations = new DeclarationList();
		foreach ( $oldDeclarations as $declaration ) {
			if ( $this->valueMatcher->match( $declaration->getValue(), [ 'mark-significance' => true ] ) ) {
				$newDeclarations->add( $declaration );
			} else {
				$this->sanitizationError( 'invalid-font-feature-value-declaration', $declaration,
					[ $this->name ] );
			}
		}
		$blockContents->clear();
		$blockContents->add( $newDeclarations->toComponentValueArray() );

		return $ret;
	}
}

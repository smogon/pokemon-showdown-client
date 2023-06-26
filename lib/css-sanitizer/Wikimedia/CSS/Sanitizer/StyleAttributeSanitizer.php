<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\DeclarationList;
use Wikimedia\CSS\Parser\Parser;

/**
 * Sanitizes a CSS style attribute (i.e. `<tag style="...">`)
 * @see https://www.w3.org/TR/2013/REC-css-style-attr-20131107/
 */
class StyleAttributeSanitizer extends Sanitizer {

	/** @var Sanitizer */
	protected $propertySanitizer;

	/**
	 * @param PropertySanitizer $propertySanitizer Sanitizer to test property declarations.
	 *  Probably an instance of StylePropertySanitizer.
	 */
	public function __construct( PropertySanitizer $propertySanitizer ) {
		$this->propertySanitizer = $propertySanitizer;
	}

	/**
	 * Create and return a default StyleAttributeSanitizer.
	 * @note This method exists more to be an example of how to put everything
	 *  together than to be used directly.
	 * @return StyleAttributeSanitizer
	 */
	public static function newDefault() {
		// First, we need a matcher factory for the stuff all the sanitizers
		// will need.
		$matcherFactory = MatcherFactory::singleton();

		// This is the sanitizer for a single "property: value"
		$propertySanitizer = new StylePropertySanitizer( $matcherFactory );

		// StyleAttributeSanitizer brings it all together
		return new StyleAttributeSanitizer( $propertySanitizer );
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof DeclarationList ) {
			$this->sanitizationError( 'expected-declaration-list', $object );
			return null;
		}
		return $this->sanitizeList( $this->propertySanitizer, $object );
	}

	/**
	 * Sanitize a string value.
	 * @param string $string
	 * @return DeclarationList
	 */
	public function sanitizeString( $string ) {
		$parser = Parser::newFromString( $string );
		$declarations = $parser->parseDeclarationList();
		$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $parser->getParseErrors() );
		// @phan-suppress-next-line PhanTypeMismatchReturnSuperType
		return $this->sanitizeList( $this->propertySanitizer, $declarations );
	}
}

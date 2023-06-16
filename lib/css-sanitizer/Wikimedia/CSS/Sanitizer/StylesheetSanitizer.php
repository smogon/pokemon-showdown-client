<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Grammar\MatcherFactory;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\RuleList;
use Wikimedia\CSS\Objects\Stylesheet;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a CSS stylesheet or rule list
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#css-stylesheets
 */
class StylesheetSanitizer extends Sanitizer {

	/** @var RuleSanitizer[] */
	protected $ruleSanitizers;

	/**
	 * @param RuleSanitizer[] $ruleSanitizers Sanitizers to test rules. For
	 *  each rule in the sheet, the first sanitizer that handles that rule gets
	 *  to sanitize it.
	 */
	public function __construct( array $ruleSanitizers = [] ) {
		$this->setRuleSanitizers( $ruleSanitizers );
	}

	/**
	 * Create and return a default StylesheetSanitizer.
	 * @note This method exists more to be an example of how to put everything
	 *  together than to be used directly.
	 * @return StylesheetSanitizer
	 */
	public static function newDefault() {
		// First, we need a matcher factory for the stuff all the sanitizers
		// will need.
		$matcherFactory = MatcherFactory::singleton();

		// This is the sanitizer for a single "property: value", that gets used by
		// StyleRuleSanitizer and various others.
		$propertySanitizer = new StylePropertySanitizer( $matcherFactory );

		// These are sanitizers for different types of rules that can appear in
		// stylesheets and can be nested inside @media and @supports blocks.
		// The keys in the array aren't used for anything by the library, but
		// may help humans reading it.
		$ruleSanitizers = [
			'style' => new StyleRuleSanitizer( $matcherFactory->cssSelectorList(), $propertySanitizer ),
			'@font-face' => new FontFaceAtRuleSanitizer( $matcherFactory ),
			'@keyframes' => new KeyframesAtRuleSanitizer( $matcherFactory, $propertySanitizer ),
			'@page' => new PageAtRuleSanitizer( $matcherFactory, $propertySanitizer ),
			'@media' => new MediaAtRuleSanitizer( $matcherFactory->cssMediaQueryList() ),
			'@supports' => new SupportsAtRuleSanitizer( $matcherFactory, [
				'declarationSanitizer' => $propertySanitizer,
			] ),
		];

		// Inject the above list into the @media and @supports sanitizers.
		$ruleSanitizers['@media']->setRuleSanitizers( $ruleSanitizers );
		$ruleSanitizers['@supports']->setRuleSanitizers( $ruleSanitizers );

		// Now we can put together the StylesheetSanitizer
		return new StylesheetSanitizer( $ruleSanitizers + [
			// Note there's intentionally no "@charset" sanitizer, as that at-rule
			// was removed in the Editor's Draft in favor of special handling
			// in the parser.
			'@import' => new ImportAtRuleSanitizer( $matcherFactory, [
				'declarationSanitizer' => $propertySanitizer,
			] ),
			'@namespace' => new NamespaceAtRuleSanitizer( $matcherFactory ),
		] );
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

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		$isSheet = $object instanceof Stylesheet;
		if ( $isSheet ) {
			'@phan-var Stylesheet $object';
			$object = $object->getRuleList();
		}
		if ( !$object instanceof RuleList ) {
			$this->sanitizationError( 'expected-stylesheet', $object );
			return null;
		}

		$ret = $this->sanitizeRules( $this->ruleSanitizers, $object );
		if ( $isSheet ) {
			$ret = new Stylesheet( $ret );
		}

		return $ret;
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use InvalidArgumentException;
use Wikimedia\CSS\Grammar\Matcher;
use Wikimedia\CSS\Grammar\NothingMatcher;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Declaration;
use Wikimedia\CSS\Util;

/**
 * Sanitizes a Declaration
 */
class PropertySanitizer extends Sanitizer {

	/** @var Matcher[] Array mapping declaration names (lowercase) to Matchers for the values */
	private $knownProperties = [];

	/** @var Matcher|null Matcher for CSS-wide keywords */
	private $cssWideKeywords = null;

	/**
	 * @param Matcher[] $properties Array mapping declaration names (lowercase)
	 *  to Matchers for the values
	 * @param Matcher|null $cssWideKeywordsMatcher Matcher for keywords that should
	 *  be recognized for all known properties.
	 */
	public function __construct( array $properties = [], Matcher $cssWideKeywordsMatcher = null ) {
		$this->setKnownProperties( $properties );
		$this->setCssWideKeywordsMatcher( $cssWideKeywordsMatcher ?: new NothingMatcher );
	}

	/**
	 * Access the list of known properties
	 * @return Matcher[]
	 */
	public function getKnownProperties() {
		return $this->knownProperties;
	}

	/**
	 * Set the list of known properties
	 * @param Matcher[] $properties Array mapping declaration names (lowercase)
	 *  to Matchers for the values
	 */
	public function setKnownProperties( array $properties ) {
		foreach ( $properties as $prop => $matcher ) {
			if ( strtolower( $prop ) !== $prop ) {
				throw new InvalidArgumentException( "Property name '$prop' must be lowercased" );
			}
			if ( !$matcher instanceof Matcher ) {
				throw new InvalidArgumentException( "Value for '$prop' is not a Matcher" );
			}
		}
		$this->knownProperties = $properties;
	}

	/**
	 * Merge a list of matchers into the list of known properties
	 * @param Matcher[] $props Array mapping declaration names (lowercase)
	 *  to Matchers for the values
	 * @throws InvalidArgumentException if some property is already defined
	 */
	public function addKnownProperties( $props ) {
		$dups = [];
		foreach ( $props as $k => $v ) {
			if ( isset( $this->knownProperties[$k] ) && $v !== $this->knownProperties[$k] ) {
				$dups[] = $k;
			}
		}
		if ( $dups ) {
			throw new InvalidArgumentException(
				'Duplicate definitions for properties: ' . implode( ' ', $dups )
			);
		}
		$this->setKnownProperties( $this->knownProperties + $props );
	}

	/**
	 * Fetch the matcher for keywords that should be recognized for all properties.
	 * @return Matcher
	 */
	public function getCssWideKeywordsMatcher() {
		return $this->cssWideKeywords;
	}

	/**
	 * Set the matcher for keywords that should be recognized for all properties.
	 * @param Matcher $matcher
	 */
	public function setCssWideKeywordsMatcher( Matcher $matcher ) {
		$this->cssWideKeywords = $matcher;
	}

	/** @inheritDoc */
	protected function doSanitize( CSSObject $object ) {
		if ( !$object instanceof Declaration ) {
			$this->sanitizationError( 'expected-declaration', $object );
			return null;
		}

		$knownProperties = $this->getKnownProperties();
		$name = strtolower( $object->getName() );
		if ( !isset( $knownProperties[$name] ) ) {
			$this->sanitizationError( 'unrecognized-property', $object );
			return null;
		}

		$list = $object->getValue();
		if ( !$knownProperties[$name]->matchAgainst( $list, [ 'mark-significance' => true ] ) &&
			!$this->getCssWideKeywordsMatcher()->matchAgainst( $list, [ 'mark-significance' => true ] )
		) {
			$cv = Util::findFirstNonWhitespace( $list );
			if ( $cv ) {
				$this->sanitizationError( 'bad-value-for-property', $cv, [ $name ] );
			} else {
				$this->sanitizationError( 'missing-value-for-property', $object, [ $name ] );
			}
			return null;
		}

		return $object;
	}
}

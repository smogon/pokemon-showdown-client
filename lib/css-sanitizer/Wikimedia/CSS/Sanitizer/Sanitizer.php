<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Sanitizer;

use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\CSSObjectList;
use Wikimedia\CSS\Objects\RuleList;
use Wikimedia\ScopedCallback;

/**
 * Base class for CSS sanitizers
 */
abstract class Sanitizer {

	/** @var array Sanitization errors. Each error is [ string $tag, int $line, int $pos ] */
	protected $sanitizationErrors = [];

	/**
	 * Return all sanitization errors seen so far
	 * @return array Array of [ string $tag, int $line, int $pos, ... ]
	 */
	public function getSanitizationErrors() {
		return $this->sanitizationErrors;
	}

	/**
	 * Temporarily clear sanitization errors
	 *
	 * Errors will be cleared, then restored when the returned ScopedCallback
	 * goes out of scope or is consumed.
	 *
	 * @return ScopedCallback
	 */
	public function stashSanitizationErrors() {
		$reset = new ScopedCallback( function ( $e ) {
			$this->sanitizationErrors = $e;
		}, [ $this->sanitizationErrors ] );
		$this->sanitizationErrors = [];
		return $reset;
	}

	/**
	 * Clear sanitization errors
	 */
	public function clearSanitizationErrors() {
		$this->sanitizationErrors = [];
	}

	/**
	 * Record a sanitization error
	 * @param string $tag Error tag
	 * @param CSSObject $object Report the error starting at this object
	 * @param array $data Extra data about the error.
	 */
	protected function sanitizationError( $tag, CSSObject $object, array $data = [] ) {
		[ $line, $pos ] = $object->getPosition();
		$this->sanitizationErrors[] = array_merge( [ $tag, $line, $pos ], $data );
	}

	/**
	 * Run another sanitizer over a CSSObject
	 * @param Sanitizer $sanitizer
	 * @param CSSObject $object
	 * @return CSSObject|null
	 */
	protected function sanitizeObj( Sanitizer $sanitizer, CSSObject $object ) {
		$newObj = $sanitizer->doSanitize( $object );
		$errors = $sanitizer->getSanitizationErrors();
		if ( $errors && $sanitizer !== $this ) {
			$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $errors );
			$sanitizer->clearSanitizationErrors();
		}
		return $newObj;
	}

	/**
	 * Run a sanitizer over all CSSObjects in a CSSObjectList
	 * @param Sanitizer $sanitizer
	 * @param CSSObjectList $list
	 * @return CSSObjectList
	 */
	protected function sanitizeList( Sanitizer $sanitizer, CSSObjectList $list ) {
		$class = get_class( $list );
		$ret = new $class;
		foreach ( $list as $obj ) {
			$newObj = $sanitizer->doSanitize( $obj );
			if ( $newObj ) {
				$ret->add( $newObj );
			}
		}

		$errors = $sanitizer->getSanitizationErrors();
		if ( $errors && $sanitizer !== $this ) {
			$this->sanitizationErrors = array_merge( $this->sanitizationErrors, $errors );
			$sanitizer->clearSanitizationErrors();
		}

		return $ret;
	}

	/**
	 * Run a set of RuleSanitizers over all rules in a RuleList
	 * @param RuleSanitizer[] $ruleSanitizers
	 * @param RuleList $list
	 * @return RuleList
	 */
	protected function sanitizeRules( array $ruleSanitizers, RuleList $list ) {
		$ret = new RuleList();
		$curIndex = -INF;
		foreach ( $list as $rule ) {
			foreach ( $ruleSanitizers as $sanitizer ) {
				if ( $sanitizer->handlesRule( $rule ) ) {
					$indexes = $sanitizer->getIndex();
					if ( is_array( $indexes ) ) {
						[ $testIndex, $setIndex ] = $indexes;
					} else {
						$testIndex = $setIndex = $indexes;
					}
					if ( $testIndex < $curIndex ) {
						$this->sanitizationError( 'misordered-rule', $rule );
					} else {
						$curIndex = $setIndex;
						$rule = $this->sanitizeObj( $sanitizer, $rule );
						if ( $rule ) {
							$ret->add( $rule );
						}
					}
					continue 2;
				}
			}
			$this->sanitizationError( 'unrecognized-rule', $rule );
		}
		return $ret;
	}

	/**
	 * Sanitize a CSS object
	 * @param CSSObject $object
	 * @return CSSObject|null Sanitized version of the object, or null if
	 *  sanitization failed
	 */
	abstract protected function doSanitize( CSSObject $object );

	/**
	 * Sanitize a CSS object
	 * @param CSSObject $object
	 * @return CSSObject|null Sanitized version of the object, or null if
	 *  sanitization failed
	 */
	public function sanitize( CSSObject $object ) {
		return $this->doSanitize( $object );
	}
}

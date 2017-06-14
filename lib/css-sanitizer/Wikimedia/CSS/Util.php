<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS;

use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\CSSObject;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Objects\TokenList;

/**
 * Static utility functions
 */
class Util {

	/**
	 * Check that all elements in an array implement a particular class
	 * @param array $array
	 * @param string $class
	 * @param string $what Describe the array being checked
	 * @throws \InvalidArgumentException
	 */
	public static function assertAllInstanceOf( array $array, $class, $what ) {
		foreach ( $array as $k => $v ) {
			if ( !$v instanceof $class ) {
				$vtype = is_object( $v ) ? get_class( $v ) : gettype( $v );
				throw new \InvalidArgumentException(
					"$what may only contain instances of $class" .
						" (found $vtype at index $k)"
				);
			}
		}
	}

	/**
	 * Check that a set of tokens are all of the same type
	 * @param Token[] $array
	 * @param string $type
	 * @param string $what Describe the array being checked
	 * @throws \InvalidArgumentException
	 */
	public static function assertAllTokensOfType( array $array, $type, $what ) {
		foreach ( $array as $k => $v ) {
			if ( !$v instanceof Token ) {
				$vtype = is_object( $v ) ? get_class( $v ) : gettype( $v );
				throw new \InvalidArgumentException(
					"$what may only contain instances of " . Token::class .
						" (found $vtype at index $k)"
				);
			}
			if ( $v->type() !== $type ) {
				throw new \InvalidArgumentException(
					"$what may only contain \"$type\" tokens" .
						" (found \"{$v->type()}\" at index $k)"
				);
			}
		}
	}

	/**
	 * Find the first non-whitespace ComponentValue in a list
	 * @param TokenList|ComponentValueList $list
	 * @return ComponentValue|null
	 */
	public static function findFirstNonWhitespace( $list ) {
		if ( !$list instanceof TokenList && !$list instanceof ComponentValueList ) {
			throw new \InvalidArgumentException( 'List must be TokenList or ComponentValueList' );
		}
		foreach ( $list as $v ) {
			if ( !$v instanceof Token || $v->type() !== Token::T_WHITESPACE ) {
				return $v;
			}
		}
		return null;
	}

	/**
	 * Turn a CSSObject into a string
	 * @param CSSObject $object
	 * @param array $options Serialziation options:
	 *  - minify: (bool) Skip comments and insignificant tokens
	 * @return string
	 */
	public static function stringify( CSSObject $object, $options = [] ) {
		$tokens = $object->toTokenArray();
		if ( !$tokens ) {
			return '';
		}

		if ( !empty( $options['minify'] ) ) {
			// Last second check for significant whitespace
			$e = count( $tokens ) - 1;
			for ( $i = 1; $i < $e; $i++ ) {
				$t = $tokens[$i];
				if ( $t->type() === Token::T_WHITESPACE && !$t->significant() &&
					Token::separate( $tokens[$i-1], $tokens[$i+1] )
				) {
					$tokens[$i] = $t->copyWithSignificance( true );
				}
			}

			// Filter!
			$tokens = array_filter( $tokens, function ( $t ) {
				return $t->significant();
			} );
		}

		$prev = reset( $tokens );
		$ret = (string)$prev;
		while ( ( $token = next( $tokens ) ) !== false ) {
			if ( Token::separate( $prev, $token ) ) {
				// Per https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#serialization
				$ret .= '/**/';
			}
			$ret .= (string)$token;
			$prev = $token;
		}
		return $ret;
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a list of CSS declarations
 */
class ComponentValueList extends CSSObjectList {
	protected static $objectType = ComponentValue::class;

	protected static function testObjects( array $objects ) {
		foreach ( $objects as $object ) {
			$type = $object instanceof Token ? $object->type() : 'n/a';
			switch ( $type ) {
				case Token::T_FUNCTION:
				case Token::T_LEFT_BRACKET:
				case Token::T_LEFT_PAREN:
				case Token::T_LEFT_BRACE:
					throw new \InvalidArgumentException(
						static::class . " may not contain tokens of type \"$type\"."
					);
			}
		}
	}

	// Much simpler
	public function toComponentValueArray() {
		return $this->objects;
	}
}

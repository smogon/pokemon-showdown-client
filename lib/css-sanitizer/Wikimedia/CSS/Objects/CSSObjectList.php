<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use ArrayAccess;
use Countable;
use InvalidArgumentException;
use OutOfBoundsException;
use SeekableIterator;
use Wikimedia\CSS\Util;

/**
 * Represent a list of CSS objects
 */
class CSSObjectList implements Countable, SeekableIterator, ArrayAccess, CSSObject {

	/** @var string The specific class of object contained */
	protected static $objectType;

	/** @var CSSObject[] The objects contained */
	protected $objects;

	/** @var int */
	protected $offset = 0;

	/**
	 * Additional validation for objects
	 * @param CSSObject[] $objects
	 */
	protected static function testObjects( array $objects ) {
	}

	/**
	 * @param CSSObject[] $objects
	 */
	public function __construct( array $objects = [] ) {
		Util::assertAllInstanceOf( $objects, static::$objectType, static::class );
		static::testObjects( $objects );
		$this->objects = array_values( $objects );
	}

	/**
	 * Insert one or more objects into the list
	 * @param CSSObject|CSSObject[]|CSSObjectList $objects An object to add, or an array of objects.
	 * @param int|null $index Insert the objects at this index. If omitted, the
	 *  objects are added at the end.
	 */
	public function add( $objects, $index = null ) {
		if ( $objects instanceof static ) {
			$objects = $objects->objects;
		} elseif ( is_array( $objects ) ) {
			Util::assertAllInstanceOf( $objects, static::$objectType, static::class );
			$objects = array_values( $objects );
			static::testObjects( $objects );
		} else {
			if ( !$objects instanceof static::$objectType ) {
				throw new InvalidArgumentException(
					static::class . ' may only contain instances of ' . static::$objectType . '.'
				);
			}
			$objects = [ $objects ];
			static::testObjects( $objects );
		}

		if ( $index === null ) {
			$index = count( $this->objects );
		} elseif ( $index < 0 || $index > count( $this->objects ) ) {
			throw new OutOfBoundsException( 'Index is out of range.' );
		}

		array_splice( $this->objects, $index, 0, $objects );
		if ( $this->offset > $index ) {
			$this->offset += count( $objects );
		}
	}

	/**
	 * Remove an object from the list
	 * @param int $index
	 * @return CSSObject The removed object
	 */
	public function remove( $index ) {
		if ( $index < 0 || $index >= count( $this->objects ) ) {
			throw new OutOfBoundsException( 'Index is out of range.' );
		}
		$ret = $this->objects[$index];
		array_splice( $this->objects, $index, 1 );

		// This works most sanely with foreach() and removing the current index
		if ( $this->offset >= $index ) {
			$this->offset--;
		}

		return $ret;
	}

	/**
	 * Extract a slice of the list
	 * @param int $offset
	 * @param int|null $length
	 * @return CSSObject[] The objects in the slice
	 */
	public function slice( $offset, $length = null ) {
		return array_slice( $this->objects, $offset, $length );
	}

	/**
	 * Clear the list
	 */
	public function clear() {
		$this->objects = [];
		$this->offset = 0;
	}

	// Countable interface

	/** @inheritDoc */
	public function count(): int {
		return count( $this->objects );
	}

	// SeekableIterator interface

	/** @inheritDoc */
	public function seek( int $offset ): void {
		if ( $offset < 0 || $offset >= count( $this->objects ) ) {
			throw new OutOfBoundsException( 'Offset is out of range.' );
		}
		$this->offset = $offset;
	}

	/** @inheritDoc */
	#[\ReturnTypeWillChange]
	public function current() {
		return $this->objects[$this->offset] ?? null;
	}

	/** @inheritDoc */
	public function key(): int {
		return $this->offset;
	}

	/** @inheritDoc */
	public function next(): void {
		$this->offset++;
	}

	/** @inheritDoc */
	public function rewind(): void {
		$this->offset = 0;
	}

	/** @inheritDoc */
	public function valid(): bool {
		return isset( $this->objects[$this->offset] );
	}

	// ArrayAccess interface

	/** @inheritDoc */
	public function offsetExists( $offset ): bool {
		return isset( $this->objects[$offset] );
	}

	/** @inheritDoc */
	public function offsetGet( $offset ): CSSObject {
		if ( !is_numeric( $offset ) || (float)(int)$offset !== (float)$offset ) {
			throw new InvalidArgumentException( 'Offset must be an integer.' );
		}
		if ( $offset < 0 || $offset > count( $this->objects ) ) {
			throw new OutOfBoundsException( 'Offset is out of range.' );
		}
		return $this->objects[$offset];
	}

	/** @inheritDoc */
	public function offsetSet( $offset, $value ): void {
		if ( !$value instanceof static::$objectType ) {
			throw new InvalidArgumentException(
				static::class . ' may only contain instances of ' . static::$objectType . '.'
			);
		}
		static::testObjects( [ $value ] );
		if ( !is_numeric( $offset ) || (float)(int)$offset !== (float)$offset ) {
			throw new InvalidArgumentException( 'Offset must be an integer.' );
		}
		if ( $offset < 0 || $offset > count( $this->objects ) ) {
			throw new OutOfBoundsException( 'Offset is out of range.' );
		}
		$this->objects[$offset] = $value;
	}

	/** @inheritDoc */
	public function offsetUnset( $offset ): void {
		if ( isset( $this->objects[$offset] ) && $offset !== count( $this->objects ) - 1 ) {
			throw new OutOfBoundsException( 'Cannot leave holes in the list.' );
		}
		unset( $this->objects[$offset] );
	}

	// CSSObject interface

	/** @inheritDoc */
	public function getPosition() {
		$ret = null;
		foreach ( $this->objects as $obj ) {
			$pos = $obj->getPosition();
			if ( $pos[0] >= 0 && (
				!$ret || $pos[0] < $ret[0] || ( $pos[0] === $ret[0] && $pos[1] < $ret[1] )
			) ) {
				$ret = $pos;
			}
		}
		return $ret ?: [ -1, -1 ];
	}

	/**
	 * Return the tokens to use to separate list items
	 * @param CSSObject $left
	 * @param CSSObject|null $right
	 * @return Token[]
	 */
	protected function getSeparator( CSSObject $left, CSSObject $right = null ) {
		return [];
	}

	/**
	 * @param string $function Function to call, toTokenArray() or toComponentValueArray()
	 * @return Token[]|ComponentValue[]
	 */
	private function toTokenOrCVArray( $function ) {
		$ret = [];
		$l = count( $this->objects );
		foreach ( $this->objects as $i => $iValue ) {
			// Manually looping and appending turns out to be noticeably faster than array_merge.
			foreach ( $iValue->$function() as $v ) {
				$ret[] = $v;
			}
			$sep = $this->getSeparator( $iValue, $i + 1 < $l ? $this->objects[$i + 1] : null );
			foreach ( $sep as $v ) {
				$ret[] = $v;
			}
		}

		return $ret;
	}

	/** @inheritDoc */
	public function toTokenArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	/** @inheritDoc */
	public function toComponentValueArray() {
		return $this->toTokenOrCVArray( __FUNCTION__ );
	}

	public function __toString() {
		return Util::stringify( $this );
	}
}

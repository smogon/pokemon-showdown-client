<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * A base interface for "CSS objects"
 *
 * Each object has a position and an ability to be turned into a sequence of
 * Tokens.
 */
interface CSSObject {
	/**
	 * Get the position of this object in the input stream
	 *
	 * Position is reported as one-based line and one-based codepoint within
	 * the line. If no position is available, returns -1 for both line and
	 * position.
	 *
	 * @return array [ $line, $pos ]
	 */
	public function getPosition();

	/**
	 * Return an array of Tokens that correspond to this object.
	 * @return Token[]
	 */
	public function toTokenArray();

	/**
	 * Return an array of ComponentValues that correspond to this object.
	 * @warning Do not return any Tokens that aren't valid in a ComponentValueList.
	 * @return ComponentValue[]
	 */
	public function toComponentValueArray();
}

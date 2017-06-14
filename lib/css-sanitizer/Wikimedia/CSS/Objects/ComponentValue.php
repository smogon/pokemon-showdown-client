<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a CSS component value
 */
abstract class ComponentValue implements CSSObject {

	/** @var int Line and position in the input where this component value starts */
	protected $line = -1, $pos = -1;

	/**
	 * Get the position of this ComponentValue in the input stream
	 * @return array [ $line, $pos ]
	 */
	public function getPosition() {
		return [ $this->line, $this->pos ];
	}

	public function toComponentValueArray() {
		return [ $this ];
	}
}

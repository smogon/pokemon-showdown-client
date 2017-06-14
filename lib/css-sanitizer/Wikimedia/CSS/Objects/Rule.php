<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use Wikimedia\CSS\Util;

/**
 * Represent an abstract CSS rule
 */
abstract class Rule implements CSSObject {

	/** @var int Line and position in the input where this rule starts */
	protected $line = -1, $pos = -1;

	/**
	 * @param Token $token Token starting the rule
	 */
	public function __construct( Token $token ) {
		list( $this->line, $this->pos ) = $token->getPosition();
	}

	/**
	 * Get the position of this Declaration in the input stream
	 * @return array [ $line, $pos ]
	 */
	public function getPosition() {
		return [ $this->line, $this->pos ];
	}
}

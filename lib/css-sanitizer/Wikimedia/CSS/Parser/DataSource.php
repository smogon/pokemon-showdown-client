<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

/**
 * Read data for the CSS parser
 */
interface DataSource {

	public const EOF = '';

	/**
	 * Read a character from the data source.
	 *
	 * @return string One UTF-8 character, or self::EOF
	 */
	public function readCharacter();

	/**
	 * Push a character back onto the stream.
	 *
	 * @param string $char One UTF-8 character
	 */
	public function putBackCharacter( $char );
}

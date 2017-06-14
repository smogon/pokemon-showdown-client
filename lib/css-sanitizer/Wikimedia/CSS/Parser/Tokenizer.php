<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use Wikimedia\CSS\Objects\Token;

/**
 * Tokenizer interface
 */
interface Tokenizer {

	/**
	 * Return all parse errors seen so far
	 * @return array Array of [ string $tag, int $line, int $pos, ... ]
	 */
	public function getParseErrors();

	/**
	 * Clear parse errors
	 */
	public function clearParseErrors();

	/**
	 * Read a token from the data source
	 * @return Token
	 */
	public function consumeToken();

}

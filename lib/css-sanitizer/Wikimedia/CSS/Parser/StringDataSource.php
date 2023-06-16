<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use InvalidArgumentException;
use UnexpectedValueException;

/**
 * Read data for the CSS parser
 */
class StringDataSource implements DataSource {

	/** @var string */
	protected $string;

	/** @var int */
	protected $len = 0;

	/** @var int */
	protected $pos = 0;

	/** @var string[] */
	protected $putBack = [];

	/**
	 * @param string $string Input string. Must be valid UTF-8 with no BOM.
	 */
	public function __construct( $string ) {
		$this->string = (string)$string;
		$this->len = strlen( $this->string );

		if ( !mb_check_encoding( $this->string, 'UTF-8' ) ) {
			throw new InvalidArgumentException( '$string is not valid UTF-8' );
		}
	}

	/** @inheritDoc */
	public function readCharacter() {
		if ( $this->putBack ) {
			return array_pop( $this->putBack );
		}

		if ( $this->pos >= $this->len ) {
			return self::EOF;
		}

		// We already checked that the string is valid UTF-8 in the
		// constructor, so we can do a quick binary "get next character" here.
		$p = $this->pos;
		$c = $this->string[$p];
		$cc = ord( $this->string[$p] );
		if ( $cc <= 0x7f ) {
			$this->pos++;
			return $c;
		} elseif ( ( $cc & 0xe0 ) === 0xc0 ) {
			$this->pos += 2;
			return substr( $this->string, $p, 2 );
		} elseif ( ( $cc & 0xf0 ) === 0xe0 ) {
			$this->pos += 3;
			return substr( $this->string, $p, 3 );
		} elseif ( ( $cc & 0xf8 ) === 0xf0 ) {
			$this->pos += 4;
			return substr( $this->string, $p, 4 );
		} else {
			// WTF? Should never get here because it should have failed
			// validation in the constructor.
			// @codeCoverageIgnoreStart
			throw new UnexpectedValueException(
				sprintf( 'Unexpected byte %02X in string at position %d.', $cc, $this->pos )
			);
			// @codeCoverageIgnoreEnd
		}
	}

	/** @inheritDoc */
	public function putBackCharacter( $char ) {
		if ( $char !== self::EOF ) {
			$this->putBack[] = $char;
		}
	}
}

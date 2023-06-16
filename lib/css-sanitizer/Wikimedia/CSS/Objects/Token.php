<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

use InvalidArgumentException;
use UnexpectedValueException;

/**
 * Represent a CSS token
 */
class Token extends ComponentValue {
	public const T_IDENT = "ident";
	public const T_FUNCTION = "function";
	public const T_AT_KEYWORD = "at-keyword";
	public const T_HASH = "hash";
	public const T_STRING = "string";
	public const T_BAD_STRING = "bad-string";
	public const T_URL = "url";
	public const T_BAD_URL = "bad-url";
	public const T_DELIM = "delim";
	public const T_NUMBER = "number";
	public const T_PERCENTAGE = "percentage";
	public const T_DIMENSION = "dimension";
	public const T_WHITESPACE = "whitespace";
	public const T_CDO = "CDO";
	public const T_CDC = "CDC";
	public const T_COLON = "colon";
	public const T_SEMICOLON = "semicolon";
	public const T_COMMA = "comma";
	public const T_LEFT_BRACKET = "[";
	public const T_RIGHT_BRACKET = "]";
	public const T_LEFT_PAREN = "(";
	public const T_RIGHT_PAREN = ")";
	public const T_LEFT_BRACE = "{";
	public const T_RIGHT_BRACE = "}";
	public const T_EOF = "EOF";

	/** @var string One of the T_* constants */
	protected $type;

	/** @var string|int|float Value for various token types */
	protected $value = '';

	/** @var string Type flag for various token types */
	protected $typeFlag = '';

	/** @var string|null Representation for numeric tokens */
	protected $representation = null;

	/** @var string Unit for dimension tokens */
	protected $unit = '';

	/** @var bool Whether this token is considered "significant" */
	protected $significant = true;

	/** @var int See ::urangeHack() */
	private $urangeHack = 0;

	/**
	 * @param string $type One of the T_* constants
	 * @param string|array $value Value of the token, or an array with the
	 *  following keys. Depending on the type, some keys may be required and
	 *  some may be ignored.
	 *  - value: (string|int|float) Value of the token
	 *  - position: (array) Token position in the input stream. Same format as
	 *    returned by self::getPosition().
	 *  - typeFlag: (string) Flag for various token types. For T_HASH, 'id' or
	 *    'unrestricted'. For T_NUMBER, T_PERCENTAGE, and T_DIMENSION, 'integer'
	 *    or 'number'.
	 *  - representation: (string) String representation of the value for
	 *    T_NUMBER, T_PERCENTAGE, and T_DIMENSION.
	 *  - unit: (string) Unit for T_DIMENSION.
	 *  - significant: (bool) Whether the token is considered "significant"
	 */
	public function __construct( $type, $value = [] ) {
		if ( !is_array( $value ) ) {
			$value = [ 'value' => $value ];
		}

		if ( isset( $value['position'] ) ) {
			if ( !is_array( $value['position'] ) || count( $value['position'] ) !== 2 ) {
				throw new InvalidArgumentException( 'Position must be an array of two integers' );
			}
			[ $this->line, $this->pos ] = $value['position'];
			if ( !is_int( $this->line ) || !is_int( $this->pos ) ) {
				throw new InvalidArgumentException( 'Position must be an array of two integers' );
			}
		}
		if ( isset( $value['significant'] ) ) {
			$this->significant = (bool)$value['significant'];
		}

		$this->type = $type;
		switch ( $type ) {
			case self::T_IDENT:
			case self::T_FUNCTION:
			case self::T_AT_KEYWORD:
			case self::T_STRING:
			case self::T_URL:
				if ( !isset( $value['value'] ) ) {
					throw new InvalidArgumentException( "Token type $this->type requires a value" );
				}
				$this->value = (string)$value['value'];
				break;

			case self::T_HASH:
				if ( !isset( $value['value'] ) ) {
					throw new InvalidArgumentException( "Token type $this->type requires a value" );
				}
				if ( !isset( $value['typeFlag'] ) ) {
					throw new InvalidArgumentException( "Token type $this->type requires a typeFlag" );
				}
				if ( !in_array( $value['typeFlag'], [ 'id', 'unrestricted' ], true ) ) {
					throw new InvalidArgumentException( "Invalid type flag for Token type $this->type" );
				}
				$this->value = (string)$value['value'];
				$this->typeFlag = $value['typeFlag'];
				break;

			case self::T_DELIM:
				if ( !isset( $value['value'] ) ) {
					throw new InvalidArgumentException( "Token type $this->type requires a value" );
				}
				$this->value = (string)$value['value'];
				if ( mb_strlen( $this->value, 'UTF-8' ) !== 1 ) {
					throw new InvalidArgumentException(
						"Value for Token type $this->type must be a single character"
					);
				}
				break;

			case self::T_NUMBER:
			case self::T_PERCENTAGE:
			case self::T_DIMENSION:
				if ( !isset( $value['value'] ) ||
					!is_numeric( $value['value'] ) || !is_finite( $value['value'] )
				) {
					throw new InvalidArgumentException( "Token type $this->type requires a numeric value" );
				}
				if ( !isset( $value['typeFlag'] ) ) {
					throw new InvalidArgumentException( "Token type $this->type requires a typeFlag" );
				}
				$this->typeFlag = $value['typeFlag'];
				if ( $this->typeFlag === 'integer' ) {
					$this->value = (int)$value['value'];
					if ( (float)$this->value !== (float)$value['value'] ) {
						throw new InvalidArgumentException(
							"typeFlag is 'integer', but value supplied is not an integer"
						);
					}
				} elseif ( $this->typeFlag === 'number' ) {
					$this->value = (float)$value['value'];
				} else {
					throw new InvalidArgumentException( "Invalid type flag for Token type $this->type" );
				}

				if ( isset( $value['representation'] ) ) {
					if ( !is_numeric( $value['representation'] ) ) {
						throw new InvalidArgumentException( 'Representation must be numeric' );
					}
					$this->representation = $value['representation'];
					if ( (float)$this->representation !== (float)$this->value ) {
						throw new InvalidArgumentException(
							"Representation \"$this->representation\" does not match value \"$this->value\""
						);
					}
				}

				if ( $type === self::T_DIMENSION ) {
					if ( !isset( $value['unit'] ) ) {
						throw new InvalidArgumentException( "Token type $this->type requires a unit" );
					}
					$this->unit = $value['unit'];
				}
				break;

			case self::T_BAD_STRING:
			case self::T_BAD_URL:
			case self::T_WHITESPACE:
			case self::T_CDO:
			case self::T_CDC:
			case self::T_COLON:
			case self::T_SEMICOLON:
			case self::T_COMMA:
			case self::T_LEFT_BRACKET:
			case self::T_RIGHT_BRACKET:
			case self::T_LEFT_PAREN:
			case self::T_RIGHT_PAREN:
			case self::T_LEFT_BRACE:
			case self::T_RIGHT_BRACE:
				break;

			case self::T_EOF:
				// Let EOF have a typeFlag of 'recursion-depth-exceeded', used
				// to avoid cascading errors when that occurs.
				if ( isset( $value['typeFlag'] ) && $value['typeFlag'] !== '' ) {
					$this->typeFlag = $value['typeFlag'];
					if ( $this->typeFlag !== 'recursion-depth-exceeded' ) {
						throw new InvalidArgumentException( "Invalid type flag for Token type $this->type" );
					}
				}
				break;

			default:
				throw new InvalidArgumentException( "Unknown token type \"$this->type\"." );
		}
	}

	/**
	 * Get the type of this token
	 * @return string One of the Token::T_* constants
	 */
	public function type() {
		return $this->type;
	}

	/**
	 * Get the value of this token
	 * @return string|int|float $value
	 */
	public function value() {
		return $this->value;
	}

	/**
	 * Get the type flag for this T_HASH or numeric token
	 * @return string
	 */
	public function typeFlag() {
		return $this->typeFlag;
	}

	/**
	 * Get the representation for this numeric token
	 * @return string|null
	 */
	public function representation() {
		return $this->representation;
	}

	/**
	 * Get the unit for this T_DIMENSION token
	 * @return string
	 */
	public function unit() {
		return $this->unit;
	}

	/**
	 * Whether this token is considered "significant"
	 *
	 * A token that isn't "significant" may be removed for minification of CSS.
	 * For example, most whitespace is entirely optional, as is the semicolon
	 * after the last declaration in a block.
	 *
	 * @return bool
	 */
	public function significant() {
		return $this->significant;
	}

	/**
	 * Make a copy of this token with altered "significant" flag
	 * @param bool $significant Whether the new token is considered "significant"
	 * @return Token May be the same as the current token
	 */
	public function copyWithSignificance( $significant ) {
		$significant = (bool)$significant;
		if ( $significant === $this->significant ) {
			return $this;
		}
		$ret = clone $this;
		$ret->significant = $significant;
		return $ret;
	}

	/** @inheritDoc */
	public function toTokenArray() {
		return [ $this ];
	}

	/** @inheritDoc */
	public function toComponentValueArray() {
		switch ( $this->type ) {
			case self::T_FUNCTION:
			case self::T_LEFT_BRACKET:
			case self::T_LEFT_PAREN:
			case self::T_LEFT_BRACE:
				throw new UnexpectedValueException(
					"Token type \"$this->type\" is not valid in a ComponentValueList."
				);

			default:
				return [ $this ];
		}
	}

	/**
	 * Escape an ident-like string
	 * @param string $s
	 * @return string
	 */
	private static function escapeIdent( $s ) {
		return preg_replace_callback(
			'/
				[^a-zA-Z0-9_\-\x{80}-\x{10ffff}]   # Characters that are never allowed
				| (?:^|(?<=^-))[0-9]               # Digits are not allowed at the start of an identifier
				| [\p{Z}\p{Cc}\p{Cf}\p{Co}\p{Cs}]  # To be safe, control characters and whitespace
			/ux',
			[ __CLASS__, 'escapePregCallback' ],
			$s
		);
	}

	/**
	 * Escape characters in a string
	 *
	 * - Double quote needs escaping as the string delimiter.
	 * - Backslash needs escaping since it's the escape character.
	 * - Newline (\n) isn't valid in a string, and so needs escaping.
	 * - Carriage return (\r), form feed (\f), and U+0000 would be changed by
	 *   CSS's input conversion rules, and so need escaping.
	 * - Other non-space whitespace and controls don't need escaping, but it's
	 *   safer to do so.
	 * - Angle brackets are escaped numerically to make it safer to embed in HTML.
	 *
	 * @param string $s
	 * @return string
	 */
	private static function escapeString( $s ) {
		return preg_replace_callback(
			'/[^ \P{Z}]|[\p{Cc}\p{Cf}\p{Co}\p{Cs}"\x5c<>]/u',
			[ __CLASS__, 'escapePregCallback' ],
			$s
		);
	}

	/**
	 * Callback for escaping functions
	 * @param array $m Matches
	 * @return string
	 */
	private static function escapePregCallback( $m ) {
		// Newlines, carriage returns, form feeds, and hex digits have to be
		// escaped numerically. Other non-space whitespace and controls don't
		// have to be, but it's saner to do so. Angle brackets are escaped
		// numerically too to make it safer to embed in HTML.
		if ( preg_match( '/[^ \P{Z}]|[\p{Cc}\p{Cf}\p{Co}\p{Cs}0-9a-fA-F<>]/u', $m[0] ) ) {
			return sprintf( '\\%x ', mb_ord( $m[0] ) );
		}
		return '\\' . $m[0];
	}

	public function __toString() {
		switch ( $this->type ) {
			case self::T_IDENT:
				return self::escapeIdent( $this->value );

			case self::T_FUNCTION:
				return self::escapeIdent( $this->value ) . '(';

			case self::T_AT_KEYWORD:
				return '@' . self::escapeIdent( $this->value );

			case self::T_HASH:
				if ( $this->typeFlag === 'id' ) {
					return '#' . self::escapeIdent( $this->value );
				}

				return '#' . preg_replace_callback(
					'/
						[^a-zA-Z0-9_\-\x{80}-\x{10ffff}]   # Characters that are never allowed
						| [\p{Z}\p{Cc}\p{Cf}\p{Co}\p{Cs}]  # To be safe, control characters and whitespace
					/ux',
					[ __CLASS__, 'escapePregCallback' ],
					$this->value
				);

			case self::T_STRING:
				// We could try to decide whether single or double quote is
				// better, but it doesn't seem worth the effort.
				return '"' . self::escapeString( $this->value ) . '"';

			case self::T_URL:
				// We could try to decide whether single or double quote is
				// better, but it doesn't seem worth the effort.
				return 'url("' . self::escapeString( $this->value ) . '")';

			case self::T_BAD_STRING:
				// It's supposed to round trip, so...
				// (this is really awful because we can't close it)
				return "'badstring\n";

			case self::T_BAD_URL:
				// It's supposed to round trip, so...
				return "url(badurl'')";

			case self::T_DELIM:
				if ( $this->value === '\\' ) {
					return "\\\n";
				}
				return $this->value;

			case self::T_NUMBER:
			case self::T_PERCENTAGE:
			case self::T_DIMENSION:
				if ( $this->representation !== null && (float)$this->representation === (float)$this->value ) {
					$number = $this->representation;
				} elseif ( $this->typeFlag === 'integer' ) {
					$number = sprintf( '%d', $this->value );
				} else {
					$number = sprintf( '%.15g', $this->value );
				}

				if ( $this->type === self::T_PERCENTAGE ) {
					$unit = '%';
				} elseif ( $this->type === self::T_DIMENSION ) {
					$unit = self::escapeIdent( $this->unit );
					if ( strpos( $number, 'e' ) === false && strpos( $number, 'E' ) === false &&
						preg_match( '/^[eE][+-]?\d/', $unit )
					) {
						// Unit would look like exponential notation, so escape the leading "e"
						$unit = sprintf( '\\%x ', ord( $unit[0] ) ) . substr( $unit, 1 );
					}
				} else {
					$unit = '';
				}

				return $number . $unit;

			case self::T_WHITESPACE:
				return ' ';

			case self::T_CDO:
				return '<!--';

			case self::T_CDC:
				return '-->';

			case self::T_COLON:
				return ':';

			case self::T_SEMICOLON:
				return ';';

			case self::T_COMMA:
				return ',';

			case self::T_LEFT_BRACKET:
			case self::T_RIGHT_BRACKET:
			case self::T_LEFT_PAREN:
			case self::T_RIGHT_PAREN:
			case self::T_LEFT_BRACE:
			case self::T_RIGHT_BRACE:
				return $this->type;

			case self::T_EOF:
				return '';

			default:
				throw new UnexpectedValueException( "Unknown token type \"$this->type\"." );
		}
	}

	/**
	 * Indicate whether the two tokens need to be separated
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#serialization
	 * @param Token $firstToken
	 * @param Token $secondToken
	 * @return bool
	 */
	public static function separate( Token $firstToken, Token $secondToken ) {
		// Keys are the row headings, values are the columns that have an ✗
		static $sepTable = [
			self::T_IDENT => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_CDC, self::T_LEFT_PAREN,
				// Internet Explorer is buggy in some contexts (T191134)
				self::T_HASH,
			],
			self::T_AT_KEYWORD => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_CDC,
			],
			self::T_HASH => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_CDC,
				// Internet Explorer is buggy in some contexts (T191134)
				self::T_HASH,
			],
			self::T_DIMENSION => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_CDC,
				// Internet Explorer is buggy in some contexts (T191134)
				self::T_HASH,
			],
			'#' => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION,
			],
			'-' => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION,
			],
			self::T_NUMBER => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, '%',
				// Internet Explorer is buggy in some contexts
				self::T_HASH,
			],
			'@' => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-',
			],
			'.' => [ self::T_NUMBER, self::T_PERCENTAGE, self::T_DIMENSION ],
			'+' => [ self::T_NUMBER, self::T_PERCENTAGE, self::T_DIMENSION ],
			'/' => [ '*' ],
		];

		$t1 = $firstToken->type === self::T_DELIM ? $firstToken->value : $firstToken->type;
		$t2 = $secondToken->type === self::T_DELIM ? $secondToken->value : $secondToken->type;

		return isset( $sepTable[$t1] ) && in_array( $t2, $sepTable[$t1], true );
	}

	/**
	 * Allow for marking the 'U' T_IDENT beginning a <urange>, to later avoid
	 * serializing it with extraneous comments.
	 * @internal
	 * @see \Wikimedia\CSS\Util::stringify()
	 * @see \Wikimedia\CSS\Grammar\UrangeMatcher
	 * @param int|null $hack Set the hack value
	 * @return int Current/old hack value
	 */
	public function urangeHack( $hack = null ) {
		$ret = $this->urangeHack;
		if ( $hack !== null ) {
			$this->urangeHack = max( (int)$this->urangeHack, $hack );
		}
		return $ret;
	}

}

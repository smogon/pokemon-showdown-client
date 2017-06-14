<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Objects;

/**
 * Represent a CSS token
 */
class Token extends ComponentValue {
	const T_IDENT = "ident";
	const T_FUNCTION = "function";
	const T_AT_KEYWORD = "at-keyword";
	const T_HASH = "hash";
	const T_STRING = "string";
	const T_BAD_STRING = "bad-string";
	const T_URL = "url";
	const T_BAD_URL = "bad-url";
	const T_DELIM = "delim";
	const T_NUMBER = "number";
	const T_PERCENTAGE = "percentage";
	const T_DIMENSION = "dimension";
	const T_UNICODE_RANGE = "unicode-range";
	const T_INCLUDE_MATCH = "include-match";
	const T_DASH_MATCH = "dash-match";
	const T_PREFIX_MATCH = "prefix-match";
	const T_SUFFIX_MATCH = "suffix-match";
	const T_SUBSTRING_MATCH = "substring-match";
	const T_COLUMN = "column";
	const T_WHITESPACE = "whitespace";
	const T_CDO = "CDO";
	const T_CDC = "CDC";
	const T_COLON = "colon";
	const T_SEMICOLON = "semicolon";
	const T_COMMA = "comma";
	const T_LEFT_BRACKET = "[";
	const T_RIGHT_BRACKET = "]";
	const T_LEFT_PAREN = "(";
	const T_RIGHT_PAREN = ")";
	const T_LEFT_BRACE = "{";
	const T_RIGHT_BRACE = "}";
	const T_EOF = "EOF";

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

	/** @var int Start and end for unicode-range tokens */
	protected $start = 0, $end = 0;

	/** @var bool Whether this token is considered "significant" */
	protected $significant = true;

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
	 *  - start: (int) Start code point for T_UNICODE_RANGE.
	 *  - end: (int) End code point for T_UNICODE_RANGE.
	 *  - significant: (bool) Whether the token is considered "significant"
	 */
	public function __construct( $type, $value = [] ) {
		if ( !is_array( $value ) ) {
			$value = [ 'value' => $value ];
		}

		if ( isset( $value['position'] ) ) {
			if ( !is_array( $value['position'] ) || count( $value['position'] ) !== 2 ) {
				throw new \InvalidArgumentException( 'Position must be an array of two integers' );
			}
			list( $this->line, $this->pos ) = $value['position'];
			if ( !is_int( $this->line ) || !is_int( $this->pos ) ) {
				throw new \InvalidArgumentException( 'Position must be an array of two integers' );
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
					throw new \InvalidArgumentException( "Token type $this->type requires a value" );
				}
				$this->value = (string)$value['value'];
				break;

			case self::T_HASH:
				if ( !isset( $value['value'] ) ) {
					throw new \InvalidArgumentException( "Token type $this->type requires a value" );
				}
				if ( !isset( $value['typeFlag'] ) ) {
					throw new \InvalidArgumentException( "Token type $this->type requires a typeFlag" );
				}
				if ( !in_array( $value['typeFlag'], [ 'id', 'unrestricted' ], true ) ) {
					throw new \InvalidArgumentException( "Invalid type flag for Token type $this->type" );
				}
				$this->value = (string)$value['value'];
				$this->typeFlag = $value['typeFlag'];
				break;

			case self::T_DELIM:
				if ( !isset( $value['value'] ) ) {
					throw new \InvalidArgumentException( "Token type $this->type requires a value" );
				}
				$this->value = (string)$value['value'];
				if ( mb_strlen( $this->value, 'UTF-8' ) !== 1 ) {
					throw new \InvalidArgumentException(
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
					throw new \InvalidArgumentException( "Token type $this->type requires a numeric value" );
				}
				if ( !isset( $value['typeFlag'] ) ) {
					throw new \InvalidArgumentException( "Token type $this->type requires a typeFlag" );
				}
				$this->typeFlag = $value['typeFlag'];
				if ( $this->typeFlag === 'integer' ) {
					$this->value = (int)$value['value'];
					if ( (float)$this->value !== (float)$value['value'] ) {
						throw new \InvalidArgumentException(
							"typeFlag is 'integer', but value supplied is not an integer"
						);
					}
				} elseif ( $this->typeFlag === 'number' ) {
					$this->value = (float)$value['value'];
				} else {
					throw new \InvalidArgumentException( "Invalid type flag for Token type $this->type" );
				}

				if ( isset( $value['representation'] ) ) {
					if ( !is_numeric( $value['representation'] ) ) {
						throw new \InvalidArgumentException( 'Representation must be numeric' );
					}
					$this->representation = $value['representation'];
					if ( (float)$this->representation !== (float)$this->value ) {
						throw new \InvalidArgumentException(
							"Representation \"$this->representation\" does not match value \"$this->value\""
						);
					}
				}

				if ( $type === self::T_DIMENSION ) {
					if ( !isset( $value['unit'] ) ) {
						throw new \InvalidArgumentException( "Token type $this->type requires a unit" );
					}
					$this->unit = $value['unit'];
				}
				break;

			case self::T_UNICODE_RANGE:
				if ( !isset( $value['start'] ) || !is_int( $value['start'] ) ) {
					throw new \InvalidArgumentException(
						"Token type $this->type requires a starting code point as an integer"
					);
				}
				$this->start = $value['start'];
				if ( !isset( $value['end'] ) ) {
					$this->end = $this->start;
				} elseif ( !is_int( $value['end'] ) ) {
					throw new \InvalidArgumentException( 'Ending code point must be an integer' );
				} else {
					$this->end = $value['end'];
				}
				break;

			case self::T_BAD_STRING:
			case self::T_BAD_URL:
			case self::T_INCLUDE_MATCH:
			case self::T_DASH_MATCH:
			case self::T_PREFIX_MATCH:
			case self::T_SUFFIX_MATCH:
			case self::T_SUBSTRING_MATCH:
			case self::T_COLUMN:
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
						throw new \InvalidArgumentException( "Invalid type flag for Token type $this->type" );
					}
				}
				break;

			default:
				throw new \InvalidArgumentException( "Unknown token type \"$this->type\"." );
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
	 * Get the unicode range for this T_UNICODE_RANGE token
	 * @return array [ int $start, int $end ]
	 */
	public function range() {
		return [ $this->start, $this->end ];
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
		$ret = clone( $this );
		$ret->significant = $significant;
		return $ret;
	}

	public function toTokenArray() {
		return [ $this ];
	}

	public function toComponentValueArray() {
		switch ( $this->type ) {
			case self::T_FUNCTION:
			case self::T_LEFT_BRACKET:
			case self::T_LEFT_PAREN:
			case self::T_LEFT_BRACE:
				throw new \UnexpectedValueException(
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
				[^a-zA-Z0-9_\-\x{80}-\x{10ffff}] # Characters that are never allowed
				| (?:^|(?<=^-))[0-9]             # Digits are not allowed at the start of an identifier
				| (?<=^-)-                       # Two dashes are not allowed at the start of an identifier
			/ux',
			function ( $m ) {
				if ( $m[0] === "\n" || ctype_xdigit( $m[0] ) ) {
					return sprintf( '\\%x ', ord( $m[0] ) );
				}
				return '\\' . $m[0];
			},
			$s
		);
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
				} else {
					return '#' . preg_replace_callback( '/[^a-zA-Z0-9_\-\x{80}-\x{10ffff}]/u', function ( $m ) {
						return $m[0] === "\n" ? '\\a ' : '\\' . $m[0];
					}, $this->value );
				}

			case self::T_STRING:
				// We could try to decide whether single or double quote is
				// better, but it doesn't seem worth the effort.
				return '"' . strtr( $this->value, [
					'"' => '\\"',
					'\\' => '\\\\',
					"\n" => '\\a ',
				] ) . '"';

			case self::T_URL:
				// We could try to decide whether single or double quote is
				// better, but it doesn't seem worth the effort.
				return 'url("' . strtr( $this->value, [
					'"' => '\\"',
					'\\' => '\\\\',
					"\n" => '\\a ',
				] ) . '")';

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

			case self::T_UNICODE_RANGE:
				if ( $this->start === 0 && $this->end === 0xffffff ) {
					return 'U+??????';
				}
				$fmt = 'U+%x';
				for ( $b = 0; $b < 24; $b += 4, $fmt .= '?' ) {
					$mask = ( 1 << $b ) - 1;
					if (
						( $this->start & $mask ) === 0 &&
						( $this->end & $mask ) === $mask &&
						( $this->start & ~$mask ) === ( $this->end & ~$mask )
					) {
						return sprintf( $fmt, $this->start >> $b );
					}
				}
				return sprintf( 'U+%x-%x', $this->start, $this->end );

			case self::T_INCLUDE_MATCH:
				return '~=';

			case self::T_DASH_MATCH:
				return '|=';

			case self::T_PREFIX_MATCH:
				return '^=';

			case self::T_SUFFIX_MATCH:
				return '$=';

			case self::T_SUBSTRING_MATCH:
				return '*=';

			case self::T_COLUMN:
				return '||';

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
				throw new \UnexpectedValueException( "Unknown token type \"$this->type\"." );
		}
	}

	/**
	 * Indicate whether the two tokens need to be separated
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#serialization
	 * @param Token $firstToken
	 * @param Token $secondToken
	 * @return bool
	 */
	public static function separate( Token $firstToken, Token $secondToken ) {
		// Keys are the row headings, values are the columns that have an ✗
		static $sepTable = [
			self::T_IDENT => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE, self::T_CDC, self::T_LEFT_PAREN
			],
			self::T_AT_KEYWORD => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE, self::T_CDC
			],
			self::T_HASH => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE, self::T_CDC
			],
			self::T_DIMENSION => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE, self::T_CDC
			],
			'#' => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE
			],
			'-' => [
				// Add '-' here from Editor's Draft, to go with the draft's
				// adding of tokens beginning with "--" that we also picked up.
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE
			],
			self::T_NUMBER => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, self::T_NUMBER,
				self::T_PERCENTAGE, self::T_DIMENSION, self::T_UNICODE_RANGE
			],
			'@' => [
				self::T_IDENT, self::T_FUNCTION, self::T_URL, self::T_BAD_URL, '-', self::T_UNICODE_RANGE
			],
			self::T_UNICODE_RANGE => [
				self::T_IDENT, self::T_FUNCTION, self::T_NUMBER, self::T_PERCENTAGE, self::T_DIMENSION, '?'
			],
			'.' => [ self::T_NUMBER, self::T_PERCENTAGE, self::T_DIMENSION ],
			'+' => [ self::T_NUMBER, self::T_PERCENTAGE, self::T_DIMENSION ],
			'$' => [ '=' ],
			'*' => [ '=' ],
			'^' => [ '=' ],
			'~' => [ '=' ],
			'|' => [ '=', '|' ],
			'/' => [ '*' ],
		];

		$t1 = $firstToken->type === Token::T_DELIM ? $firstToken->value : $firstToken->type;
		$t2 = $secondToken->type === Token::T_DELIM ? $secondToken->value : $secondToken->type;

		return isset( $sepTable[$t1] ) && in_array( $t2, $sepTable[$t1], true );
	}
}

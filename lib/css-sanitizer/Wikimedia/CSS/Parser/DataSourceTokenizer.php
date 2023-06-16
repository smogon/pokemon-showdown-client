<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use InvalidArgumentException;
use UnexpectedValueException;
use UtfNormal\Constants;
use UtfNormal\Utils;
use Wikimedia\CSS\Objects\Token;

/**
 * Parse CSS into tokens
 *
 * This implements the tokenizer from the CSS Syntax Module Level 3 candidate recommendation.
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/
 */
class DataSourceTokenizer implements Tokenizer {

	/** @var DataSource */
	protected $source;

	/** @var int line in the input */
	protected $line = 1;

	/** @var int position in the line in the input */
	protected $pos = 0;

	/** @var string|null|object The most recently consumed character */
	protected $currentCharacter = null;

	/** @var string|null The next character to be consumed */
	protected $nextCharacter = null;

	/** @var array Parse errors. Each error is [ string $tag, int $line, int $pos ] */
	protected $parseErrors = [];

	/**
	 * @param DataSource $source
	 * @param array $options Configuration options.
	 *  (none currently defined)
	 */
	public function __construct( DataSource $source, array $options = [] ) {
		$this->source = $source;
	}

	/**
	 * Read a character from the data source
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#input-preprocessing
	 * @return string One UTF-8 character, or empty string on EOF
	 */
	protected function nextChar() {
		$char = $this->source->readCharacter();

		// Perform transformations per the spec

		// Any U+0000 or surrogate code point becomes U+FFFD
		if ( $char === "\0" || ( $char >= "\u{D800}" && $char <= "\u{DFFF}" ) ) {
			return Constants::UTF8_REPLACEMENT;
		}

		// Any U+000D, U+000C, or pair of U+000D + U+000A becomes U+000A
		if ( $char === "\f" ) {
			// U+000C
			return "\n";
		}

		if ( $char === "\r" ) {
			// Either U+000D + U+000A or a lone U+000D
			$char2 = $this->source->readCharacter();
			if ( $char2 !== "\n" ) {
				$this->source->putBackCharacter( $char2 );
			}
			return "\n";
		}

		return $char;
	}

	/**
	 * Update the current and next character fields
	 */
	protected function consumeCharacter() {
		if ( $this->currentCharacter === "\n" ) {
			$this->line++;
			$this->pos = 1;
		} elseif ( $this->currentCharacter !== DataSource::EOF ) {
			$this->pos++;
		}

		$this->currentCharacter = $this->nextChar();
		$this->nextCharacter = $this->nextChar();
		$this->source->putBackCharacter( $this->nextCharacter );
	}

	/**
	 * Reconsume the next character
	 *
	 * In more normal terms, this pushes a character back onto the data source,
	 * so it will be read again for the next call to self::consumeCharacter().
	 */
	protected function reconsumeCharacter() {
		// @codeCoverageIgnoreStart
		if ( !is_string( $this->currentCharacter ) ) {
			throw new UnexpectedValueException( "[$this->line:$this->pos] Can't reconsume" );
		}
		// @codeCoverageIgnoreEnd

		if ( $this->currentCharacter === DataSource::EOF ) {
			// Huh?
			return;
		}

		$this->source->putBackCharacter( $this->currentCharacter );
		$this->nextCharacter = $this->currentCharacter;
		$this->currentCharacter = (object)[];
		$this->pos--;
	}

	/**
	 * Look ahead at the next three characters
	 * @return string[] Three characters
	 */
	protected function lookAhead() {
		$ret = [
			$this->nextChar(),
			$this->nextChar(),
			$this->nextChar(),
		];
		$this->source->putBackCharacter( $ret[2] );
		$this->source->putBackCharacter( $ret[1] );
		$this->source->putBackCharacter( $ret[0] );

		return $ret;
	}

	/** @inheritDoc */
	public function getParseErrors() {
		return $this->parseErrors;
	}

	/** @inheritDoc */
	public function clearParseErrors() {
		$this->parseErrors = [];
	}

	/**
	 * Record a parse error
	 * @param string $tag Error tag
	 * @param array|null $position Report the error as starting at this
	 *  position instead of at the current position.
	 * @param array $data Extra data about the error.
	 */
	protected function parseError( $tag, array $position = null, array $data = [] ) {
		if ( $position ) {
			if ( isset( $position['position'] ) ) {
				$position = $position['position'];
			}
			if ( count( $position ) !== 2 || !is_int( $position[0] ) || !is_int( $position[1] ) ) {
				// @codeCoverageIgnoreStart
				throw new InvalidArgumentException( 'Invalid position' );
				// @codeCoverageIgnoreEnd
			}
			$err = [ $tag, $position[0], $position[1] ];
		} else {
			$err = [ $tag, $this->line, $this->pos ];
		}
		$this->parseErrors[] = array_merge( $err, $data );
	}

	/**
	 * Read a token from the data source
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-token
	 * @return Token
	 * @suppress PhanPluginDuplicateAdjacentStatement,PhanPluginDuplicateSwitchCaseLooseEquality
	 */
	public function consumeToken() {
		// We "consume comments" inline below, see `case '/'`.

		$this->consumeCharacter();
		$pos = [ 'position' => [ $this->line, $this->pos ] ];

		switch ( (string)$this->currentCharacter ) {
			case "\n":
			case "\t":
			case ' ':
				// Whitespace token
				while ( self::isWhitespace( $this->nextCharacter ) ) {
					$this->consumeCharacter();
				}
				return new Token( Token::T_WHITESPACE, $pos );

			case '"':
			case '\'':
				// String token
				return $this->consumeStringToken( $this->currentCharacter, $pos );

			case '#':
				[ $next, $next2, $next3 ] = $this->lookAhead();
				if ( self::isNameCharacter( $this->nextCharacter ) ||
					self::isValidEscape( $next, $next2 )
				) {
					return new Token( Token::T_HASH, $pos + [
						'typeFlag' => self::wouldStartIdentifier( $next, $next2, $next3 ) ? 'id' : 'unrestricted',
						'value' => $this->consumeName(),
					] );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case '(':
				return new Token( Token::T_LEFT_PAREN, $pos );

			case ')':
				return new Token( Token::T_RIGHT_PAREN, $pos );

			case '+':
			case '.':
				[ $next, $next2, ] = $this->lookAhead();
				if ( self::wouldStartNumber( $this->currentCharacter, $next, $next2 ) ) {
					$this->reconsumeCharacter();
					return $this->consumeNumericToken( $pos );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case ',':
				return new Token( Token::T_COMMA, $pos );

			case '-':
				[ $next, $next2, ] = $this->lookAhead();
				if ( self::wouldStartNumber( $this->currentCharacter, $next, $next2 ) ) {
					$this->reconsumeCharacter();
					return $this->consumeNumericToken( $pos );
				}

				if ( $next === '-' && $next2 === '>' ) {
					$this->consumeCharacter();
					$this->consumeCharacter();
					return new Token( Token::T_CDC, $pos );
				}

				if ( self::wouldStartIdentifier( $this->currentCharacter, $next, $next2 ) ) {
					$this->reconsumeCharacter();
					return $this->consumeIdentLikeToken( $pos );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case '/':
				if ( $this->nextCharacter === '*' ) {
					$this->consumeCharacter();
					$this->consumeCharacter();
					while ( $this->currentCharacter !== DataSource::EOF &&
						// @phan-suppress-next-line PhanSuspiciousValueComparisonInLoop
						!( $this->currentCharacter === '*' && $this->nextCharacter === '/' )
					) {
						$this->consumeCharacter();
					}
					if ( $this->currentCharacter === DataSource::EOF ) {
						$this->parseError( 'unclosed-comment', $pos );
					}
					$this->consumeCharacter();
					// @phan-suppress-next-line PhanPossiblyInfiniteRecursionSameParams
					return $this->consumeToken();
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case ':':
				return new Token( Token::T_COLON, $pos );

			case ';':
				return new Token( Token::T_SEMICOLON, $pos );

			case '<':
				[ $next, $next2, $next3 ] = $this->lookAhead();
				if ( $next === '!' && $next2 === '-' && $next3 === '-' ) {
					$this->consumeCharacter();
					$this->consumeCharacter();
					$this->consumeCharacter();
					return new Token( Token::T_CDO, $pos );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case '@':
				[ $next, $next2, $next3 ] = $this->lookAhead();
				if ( self::wouldStartIdentifier( $next, $next2, $next3 ) ) {
					return new Token( Token::T_AT_KEYWORD, $pos + [ 'value' => $this->consumeName() ] );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case '[':
				return new Token( Token::T_LEFT_BRACKET, $pos );

			case '\\':
				if ( self::isValidEscape( $this->currentCharacter, $this->nextCharacter ) ) {
					$this->reconsumeCharacter();
					return $this->consumeIdentLikeToken( $pos );
				}

				$this->parseError( 'bad-escape' );
				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );

			case ']':
				return new Token( Token::T_RIGHT_BRACKET, $pos );

			case '{':
				return new Token( Token::T_LEFT_BRACE, $pos );

			case '}':
				return new Token( Token::T_RIGHT_BRACE, $pos );

			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				$this->reconsumeCharacter();
				return $this->consumeNumericToken( $pos );

			case DataSource::EOF:
				return new Token( Token::T_EOF, $pos );

			default:
				if ( self::isNameStartCharacter( $this->currentCharacter ) ) {
					$this->reconsumeCharacter();
					return $this->consumeIdentLikeToken( $pos );
				}

				return new Token( Token::T_DELIM, $pos + [ 'value' => $this->currentCharacter ] );
		}
	}

	/**
	 * Consume a numeric token
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-numeric-token
	 * @param array $data Data for the new token (typically contains just 'position')
	 * @return Token
	 */
	protected function consumeNumericToken( array $data ) {
		[ $data['representation'], $data['value'], $data['typeFlag'] ] = $this->consumeNumber();

		[ $next, $next2, $next3 ] = $this->lookAhead();
		if ( self::wouldStartIdentifier( $next, $next2, $next3 ) ) {
			return new Token( Token::T_DIMENSION, $data + [ 'unit' => $this->consumeName() ] );
		} elseif ( $this->nextCharacter === '%' ) {
			$this->consumeCharacter();
			return new Token( Token::T_PERCENTAGE, $data );
		} else {
			return new Token( Token::T_NUMBER, $data );
		}
	}

	/**
	 * Consume an ident-like token
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-ident-like-token
	 * @param array $data Data for the new token (typically contains just 'position')
	 * @return Token
	 */
	protected function consumeIdentLikeToken( array $data ) {
		$name = $this->consumeName();

		if ( $this->nextCharacter === '(' ) {
			$this->consumeCharacter();

			if ( !strcasecmp( $name, 'url' ) ) {
				while ( true ) {
					[ $next, $next2 ] = $this->lookAhead();
					if ( !self::isWhitespace( $next ) || !self::isWhitespace( $next2 ) ) {
						break;
					}
					$this->consumeCharacter();
				}
				if ( $next !== '"' && $next !== '\'' &&
					!( self::isWhitespace( $next ) && ( $next2 === '"' || $next2 === '\'' ) )
				) {
					return $this->consumeUrlToken( $data );
				}
			}

			return new Token( Token::T_FUNCTION, $data + [ 'value' => $name ] );
		}

		return new Token( Token::T_IDENT, $data + [ 'value' => $name ] );
	}

	/**
	 * Consume a string token
	 *
	 * This assumes the leading quote or apostrophe has already been consumed.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-string-token
	 * @param string $endChar Ending character of the string
	 * @param array $data Data for the new token (typically contains just 'position')
	 * @return Token
	 */
	protected function consumeStringToken( $endChar, array $data ) {
		$data['value'] = '';

		while ( true ) {
			$this->consumeCharacter();
			switch ( $this->currentCharacter ) {
				case DataSource::EOF:
					$this->parseError( 'unclosed-string', $data );
					break 2;

				case $endChar:
					break 2;

				case "\n":
					$this->parseError( 'newline-in-string' );
					$this->reconsumeCharacter();
					return new Token( Token::T_BAD_STRING, [ 'value' => '' ] + $data );

				case '\\':
					if ( $this->nextCharacter === DataSource::EOF ) {
						// Do nothing
					} elseif ( $this->nextCharacter === "\n" ) {
						// Consume it
						$this->consumeCharacter();
					} elseif ( self::isValidEscape( $this->currentCharacter, $this->nextCharacter ) ) {
						$data['value'] .= $this->consumeEscape();
					} else {
						// @codeCoverageIgnoreStart
						throw new UnexpectedValueException( "[$this->line:$this->pos] Unexpected state" );
						// @codeCoverageIgnoreEnd
					}
					break;

				default:
					$data['value'] .= $this->currentCharacter;
					break;
			}
		}

		// @phan-suppress-next-line PhanPluginUnreachableCode Reached by break 2
		return new Token( Token::T_STRING, $data );
	}

	/**
	 * Consume a URL token
	 *
	 * This assumes the leading "url(" has already been consumed.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-url-token
	 * @param array $data Data for the new token (typically contains just 'position')
	 * @return Token
	 */
	protected function consumeUrlToken( array $data ) {
		// 1.
		$data['value'] = '';

		// 2.
		while ( self::isWhitespace( $this->nextCharacter ) ) {
			$this->consumeCharacter();
		}

		// 3.
		while ( true ) {
			$this->consumeCharacter();
			switch ( $this->currentCharacter ) {
				case DataSource::EOF:
					$this->parseError( 'unclosed-url', $data );
					break 2;

				// @codeCoverageIgnoreStart
				case ')':
				// @codeCoverageIgnoreEnd
					break 2;

				// @codeCoverageIgnoreStart
				case "\n":
				case "\t":
				case ' ':
				// @codeCoverageIgnoreEnd
					while ( self::isWhitespace( $this->nextCharacter ) ) {
						$this->consumeCharacter();
					}
					if ( $this->nextCharacter === ')' ) {
						$this->consumeCharacter();
						break 2;
					} elseif ( $this->nextCharacter === DataSource::EOF ) {
						$this->consumeCharacter();
						$this->parseError( 'unclosed-url', $data );
						break 2;
					} else {
						$this->consumeBadUrlRemnants();
						return new Token( Token::T_BAD_URL, [ 'value' => '' ] + $data );
					}

				// @codeCoverageIgnoreStart
				case '"':
				case '\'':
				case '(':
				// @codeCoverageIgnoreEnd
					$this->parseError( 'bad-character-in-url' );
					$this->consumeBadUrlRemnants();
					return new Token( Token::T_BAD_URL, [ 'value' => '' ] + $data );

				// @codeCoverageIgnoreStart
				case '\\':
				// @codeCoverageIgnoreEnd
					if ( self::isValidEscape( $this->currentCharacter, $this->nextCharacter ) ) {
						$data['value'] .= $this->consumeEscape();
					} else {
						$this->parseError( 'bad-escape' );
						$this->consumeBadUrlRemnants();
						return new Token( Token::T_BAD_URL, [ 'value' => '' ] + $data );
					}
					break;

				default:
					if ( self::isNonPrintable( $this->currentCharacter ) ) {
						$this->parseError( 'bad-character-in-url' );
						$this->consumeBadUrlRemnants();
						return new Token( Token::T_BAD_URL, [ 'value' => '' ] + $data );
					}

					$data['value'] .= $this->currentCharacter;
					break;
			}
		}

		// @phan-suppress-next-line PhanPluginUnreachableCode Reached by break 2
		return new Token( Token::T_URL, $data );
	}

	/**
	 * Clean up after finding an error in a URL
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-remnants-of-bad-url
	 */
	protected function consumeBadUrlRemnants() {
		while ( true ) {
			$this->consumeCharacter();
			if ( $this->currentCharacter === ')' || $this->currentCharacter === DataSource::EOF ) {
				break;
			}
			if ( self::isValidEscape( $this->currentCharacter, $this->nextCharacter ) ) {
				$this->consumeEscape();
			}
		}
	}

	/**
	 * Indicate if a character is whitespace
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#whitespace
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isWhitespace( $char ) {
		return $char === "\n" || $char === "\t" || $char === " ";
	}

	/**
	 * Indicate if a character is a name-start code point
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#name-start-code-point
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isNameStartCharacter( $char ) {
		// Every non-ASCII character is a name start character, so we can just
		// check the first byte.
		$char = ord( $char );
		return ( $char >= 0x41 && $char <= 0x5a ) ||
			( $char >= 0x61 && $char <= 0x7a ) ||
			$char >= 0x80 || $char === 0x5f;
	}

	/**
	 * Indicate if a character is a name code point
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#name-code-point
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isNameCharacter( $char ) {
		// Every non-ASCII character is a name character, so we can just check
		// the first byte.
		$char = ord( $char );
		return ( $char >= 0x41 && $char <= 0x5a ) ||
			( $char >= 0x61 && $char <= 0x7a ) ||
			( $char >= 0x30 && $char <= 0x39 ) ||
			$char >= 0x80 || $char === 0x5f || $char === 0x2d;
	}

	/**
	 * Indicate if a character is non-printable
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#non-printable-code-point
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isNonPrintable( $char ) {
		// No non-ASCII character is non-printable, so we can just check the
		// first byte.
		$char = ord( $char );
		return ( $char >= 0x00 && $char <= 0x08 ) ||
			$char === 0x0b ||
			( $char >= 0x0e && $char <= 0x1f ) ||
			$char === 0x7f;
	}

	/**
	 * Indicate if a character is a digit
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#digit
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isDigit( $char ) {
		// No non-ASCII character is a digit, so we can just check the first
		// byte.
		$char = ord( $char );
		return $char >= 0x30 && $char <= 0x39;
	}

	/**
	 * Indicate if a character is a hex digit
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#hex-digit
	 * @param string $char A single UTF-8 character
	 * @return bool
	 */
	protected static function isHexDigit( $char ) {
		// No non-ASCII character is a hex digit, so we can just check the
		// first byte.
		$char = ord( $char );
		return ( $char >= 0x30 && $char <= 0x39 ) ||
			( $char >= 0x41 && $char <= 0x46 ) ||
			( $char >= 0x61 && $char <= 0x66 );
	}

	/**
	 * Determine if two characters constitute a valid escape
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#starts-with-a-valid-escape
	 * @param string $char1
	 * @param string $char2
	 * @return bool
	 */
	protected static function isValidEscape( $char1, $char2 ) {
		return $char1 === '\\' && $char2 !== "\n";
	}

	/**
	 * Determine if three characters would start an identifier
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#would-start-an-identifier
	 * @param string $char1
	 * @param string $char2
	 * @param string $char3
	 * @return bool
	 */
	protected static function wouldStartIdentifier( $char1, $char2, $char3 ) {
		if ( $char1 === '-' ) {
			return self::isNameStartCharacter( $char2 ) || $char2 === '-' ||
				self::isValidEscape( $char2, $char3 );
		} elseif ( self::isNameStartCharacter( $char1 ) ) {
			return true;
		} elseif ( $char1 === '\\' ) {
			return self::isValidEscape( $char1, $char2 );
		} else {
			return false;
		}
	}

	/**
	 * Determine if three characters would start a number
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#starts-with-a-number
	 * @param string $char1
	 * @param string $char2
	 * @param string $char3
	 * @return bool
	 */
	protected static function wouldStartNumber( $char1, $char2, $char3 ) {
		if ( $char1 === '+' || $char1 === '-' ) {
			return self::isDigit( $char2 ) ||
				( $char2 === '.' && self::isDigit( $char3 ) );
		} elseif ( $char1 === '.' ) {
			return self::isDigit( $char2 );
		// @codeCoverageIgnoreStart
		// Nothing reaches this code
		} else {
			return self::isDigit( $char1 );
		}
		// @codeCoverageIgnoreEnd
	}

	/**
	 * Consume a valid escape
	 *
	 * This assumes the leading backslash is consumed.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-escaped-code-point
	 * @return string Escaped character
	 */
	protected function consumeEscape() {
		$position = [ 'position' => [ $this->line, $this->pos ] ];

		$this->consumeCharacter();

		// 1-6 hexits, plus one optional whitespace character
		if ( self::isHexDigit( $this->currentCharacter ) ) {
			$num = $this->currentCharacter;
			while ( strlen( $num ) < 6 && self::isHexDigit( $this->nextCharacter ) ) {
				$this->consumeCharacter();
				$num .= $this->currentCharacter;
			}
			if ( self::isWhitespace( $this->nextCharacter ) ) {
				$this->consumeCharacter();
			}

			$num = intval( $num, 16 );
			if ( $num === 0 || ( $num >= 0xd800 && $num <= 0xdfff ) || $num > 0x10ffff ) {
				return Constants::UTF8_REPLACEMENT;
			}
			return Utils::codepointToUtf8( $num );
		}

		if ( $this->currentCharacter === DataSource::EOF ) {
			$this->parseError( 'bad-escape', $position );
			return Constants::UTF8_REPLACEMENT;
		}

		return $this->currentCharacter;
	}

	/**
	 * Consume a name
	 *
	 * Note this does not do validation on the input stream. Call
	 * self::wouldStartIdentifier() or the like before calling the method if
	 * necessary.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-name
	 * @return string Name
	 */
	protected function consumeName() {
		$name = '';

		while ( true ) {
			$this->consumeCharacter();

			if ( self::isNameCharacter( $this->currentCharacter ) ) {
				$name .= $this->currentCharacter;
			} elseif ( self::isValidEscape( $this->currentCharacter, $this->nextCharacter ) ) {
				$name .= $this->consumeEscape();
			} else {
				$this->reconsumeCharacter();
				break;
			}
		}

		return $name;
	}

	/**
	 * Consume a number
	 *
	 * Note this does not do validation on the input stream. Call
	 * self::wouldStartNumber() before calling the method if necessary.
	 *
	 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#consume-number
	 * @return array [ string $value, int|float $number, string $type ('integer' or 'number') ]
	 * @suppress PhanPluginDuplicateAdjacentStatement
	 */
	protected function consumeNumber() {
		// 1.
		$repr = '';
		$type = 'integer';

		// 2.
		if ( $this->nextCharacter === '+' || $this->nextCharacter === '-' ) {
			$this->consumeCharacter();
			$repr .= $this->currentCharacter;
		}

		// 3.
		while ( self::isDigit( $this->nextCharacter ) ) {
			$this->consumeCharacter();
			$repr .= $this->currentCharacter;
		}

		// 4.
		if ( $this->nextCharacter === '.' ) {
			[ $next, $next2, ] = $this->lookAhead();
			if ( self::isDigit( $next2 ) ) {
				// 4.1.
				$this->consumeCharacter();
				$this->consumeCharacter();
				// 4.2.
				$repr .= $next . $next2;
				// 4.3.
				$type = 'number';
				// 4.4.
				while ( self::isDigit( $this->nextCharacter ) ) {
					$this->consumeCharacter();
					$repr .= $this->currentCharacter;
				}
			}
		}

		// 5.
		if ( $this->nextCharacter === 'e' || $this->nextCharacter === 'E' ) {
			[ $next, $next2, $next3 ] = $this->lookAhead();
			$ok = false;
			if ( ( $next2 === '+' || $next2 === '-' ) && self::isDigit( $next3 ) ) {
				$ok = true;
				// 5.1.
				$this->consumeCharacter();
				$this->consumeCharacter();
				$this->consumeCharacter();
				// 5.2.
				$repr .= $next . $next2 . $next3;
			} elseif ( self::isDigit( $next2 ) ) {
				$ok = true;
				// 5.1.
				$this->consumeCharacter();
				$this->consumeCharacter();
				// 5.2.
				$repr .= $next . $next2;
			}
			if ( $ok ) {
				// 5.3.
				$type = 'number';
				// 5.4.
				while ( self::isDigit( $this->nextCharacter ) ) {
					$this->consumeCharacter();
					$repr .= $this->currentCharacter;
				}
			}
		}

		// 6. We assume PHP's casting follows the same rules as
		// https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#convert-string-to-number
		$value = $type === 'integer' ? (int)$repr : (float)$repr;

		// 7.
		return [ $repr, $value, $type ];
	}
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use Wikimedia\CSS\Objects\AtRule;
use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\ComponentValue;
use Wikimedia\CSS\Objects\CSSFunction;
use Wikimedia\CSS\Objects\DeclarationList;
use Wikimedia\CSS\Objects\DeclarationOrAtRuleList;
use Wikimedia\CSS\Objects\Declaration;
use Wikimedia\CSS\Objects\QualifiedRule;
use Wikimedia\CSS\Objects\Rule;
use Wikimedia\CSS\Objects\RuleList;
use Wikimedia\CSS\Objects\SimpleBlock;
use Wikimedia\CSS\Objects\Stylesheet;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Sanitizer\Sanitizer;

// Note: While reading the code below, you might find that my calls to
// consumeToken() don't match what the spec says and I don't ever "reconsume" a
// token. It turns out that the spec is overcomplicated and confused with
// respect to the "current input token" and the "next input token". It turns
// out things are pretty simple: every "consume an X" is called with the
// current input token being the first token of X, and returns with the current
// input token being the last token of X (or EOF if X ends at EOF).

// Also of note is that, since our Tokenizer can only return a stream of tokens
// rather than a stream of component values, the consume functions here only
// consider tokens. ComponentValueList::toTokenArray() may be used to convert a
// list of component values to a list of tokens if necessary.

/**
 * Parse CSS into a structure for further processing.
 *
 * This implements the CSS Syntax Module Level 3 candidate recommendation.
 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/
 *
 * The usual entry points are:
 *  - Parser::parseStylesheet() to parse a stylesheet or the contents of a <style> tag.
 *  - Parser::parseDeclarationList() to parse an inline style attribute
 */
class Parser {
	/** Maximum depth of nested ComponentValues */
	const CV_DEPTH_LIMIT = 100; // Arbitrary number that seems like it should be enough

	/** @var Tokenizer */
	protected $tokenizer;

	/** @var Token|null The most recently consumed token */
	protected $currentToken = null;

	/** @var array Parse errors. Each error is [ string $tag, int $line, int $pos ] */
	protected $parseErrors = [];

	/** @var int Recursion depth, incremented in self::consumeComponentValue() */
	protected $cvDepth = 0;

	/**
	 * @param Tokenizer $tokenizer CSS Tokenizer
	 */
	public function __construct( Tokenizer $tokenizer ) {
		$this->tokenizer = $tokenizer;
	}

	/**
	 * Create a Parser for a CSS string
	 * @param string $source CSS to parse.
	 * @param array $options Configuration options, see DataSourceTokenizer::__construct(). Also,
	 *  - convert: (array) If specified, detect the encoding as defined in the
	 *    CSS spec. The value is passed as the $encodings argument to
	 *    Encoder::convert().
	 * @return static
	 */
	public static function newFromString( $source, array $options = [] ) {
		if ( isset( $options['convert'] ) ) {
			$source = Encoder::convert( $source, $options['convert'] );
		}
		return static::newFromDataSource( new StringDataSource( $source ), $options );
	}

	/**
	 * Create a Parser for a CSS DataSource
	 * @param DataSource $source CSS to parse.
	 * @param array $options Configuration options, see DataSourceTokenizer::__construct().
	 * @return static
	 */
	public static function newFromDataSource( DataSource $source, array $options = [] ) {
		$tokenizer = new DataSourceTokenizer( $source, $options );
		return new static( $tokenizer );
	}

	/**
	 * Create a Parser for a list of Tokens
	 * @param Token[] $tokens Token-stream to parse
	 * @param Token|null $eof EOF-token
	 * @return static
	 */
	public static function newFromTokens( array $tokens, Token $eof = null ) {
		$tokenizer = new TokenListTokenizer( $tokens, $eof );
		return new static( $tokenizer );
	}

	/**
	 * Consume a token
	 */
	protected function consumeToken() {
		if ( !$this->currentToken || $this->currentToken->type() !== Token::T_EOF ) {
			$this->currentToken = $this->tokenizer->consumeToken();

			// Copy any parse errors encountered
			foreach ( $this->tokenizer->getParseErrors() as $error ) {
				$this->parseErrors[] = $error;
			}
			$this->tokenizer->clearParseErrors();
		}
	}

	/**
	 * Consume a token, also consuming any following whitespace (and comments)
	 */
	protected function consumeTokenAndWhitespace() {
		do {
			$this->consumeToken();
		} while ( $this->currentToken->type() === Token::T_WHITESPACE );
	}

	/**
	 * Return all parse errors seen so far
	 * @return array Array of [ string $tag, int $line, int $pos, ... ]
	 */
	public function getParseErrors() {
		return $this->parseErrors;
	}

	/**
	 * Clear parse errors
	 */
	public function clearParseErrors() {
		$this->parseErrors = [];
	}

	/**
	 * Record a parse error
	 * @param string $tag Error tag
	 * @param Token $token Report the error as starting at this token.
	 * @param array $data Extra data about the error.
	 */
	protected function parseError( $tag, Token $token, array $data = [] ) {
		list( $line, $pos ) = $token->getPosition();
		$this->parseErrors[] = array_merge( [ $tag, $line, $pos ], $data );
	}

	/**
	 * Parse a stylesheet
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-stylesheet
	 * @note Per the Editor's Draft, if the first rule is an at-rule named
	 *  "charset" it will be silently dropped. If you're not using the provided
	 *  Sanitizer classes to further sanitize the CSS, you'll want to manually
	 *  filter out any other such rules before stringifying the stylesheet
	 *  and/or prepend `@charset "utf-8";` after stringifying it.
	 * @return Stylesheet
	 */
	public function parseStylesheet() {
		$this->consumeToken(); // Move to the first token
		$list = $this->consumeRuleList( true );

		// Drop @charset per the Editor's Draft
		if ( isset( $list[0] ) && $list[0] instanceof AtRule &&
			!strcasecmp( $list[0]->getName(), 'charset' )
		) {
			$list->remove( 0 );
			$list->rewind();
		}

		return new Stylesheet( $list );
	}

	/**
	 * Parse a list of rules
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-list-of-rules
	 * @return RuleList
	 */
	public function parseRuleList() {
		$this->consumeToken(); // Move to the first token
		return $this->consumeRuleList( false );
	}

	/**
	 * Parse a rule
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-rule
	 * @return Rule|null
	 */
	public function parseRule() {
		// 1. and 2.
		$this->consumeTokenAndWhitespace();

		// 3.
		if ( $this->currentToken->type() === Token::T_EOF ) {
			$this->parseError( 'unexpected-eof', $this->currentToken ); // "return a syntax error"?
			return null;
		}

		if ( $this->currentToken->type() === Token::T_AT_KEYWORD ) {
			$rule = $this->consumeAtRule();
		} else {
			$rule = $this->consumeQualifiedRule();
			if ( !$rule ) {
				return null;
			}
		}

		// 4.
		$this->consumeTokenAndWhitespace();

		// 5.
		if ( $this->currentToken->type() === Token::T_EOF ) {
			return $rule;
		} else {
			$this->parseError( 'expected-eof', $this->currentToken ); // "return a syntax error"?
			return null;
		}
	}

	/**
	 * Parse a declaration
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-declaration
	 * @return Declaration|null
	 */
	public function parseDeclaration() {
		// 1. and 2.
		$this->consumeTokenAndWhitespace();

		// 3.
		if ( $this->currentToken->type() !== Token::T_IDENT ) {
			$this->parseError( 'expected-ident', $this->currentToken ); // "return a syntax error"?
			return null;
		}

		// 4.
		$declaration = $this->consumeDeclaration();

		// Declarations always run to EOF, no need to check.

		return $declaration;
	}

	/**
	 * Parse a list of declarations
	 * @note This is not the entry point the standard calls "parse a list of declarations",
	 *  see self::parseDeclarationOrAtRuleList()
	 * @return DeclarationList
	 */
	public function parseDeclarationList() {
		$this->consumeToken(); // Move to the first token
		return $this->consumeDeclarationOrAtRuleList( false );
	}

	/**
	 * Parse a list of declarations and at-rules
	 * @note This is the entry point the standard calls "parse a list of declarations"
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-list-of-declarations
	 * @return DeclarationOrAtRuleList
	 */
	public function parseDeclarationOrAtRuleList() {
		$this->consumeToken(); // Move to the first token
		return $this->consumeDeclarationOrAtRuleList();
	}

	/**
	 * Parse a (non-whitespace) component value
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-component-value
	 * @return ComponentValue|null
	 */
	public function parseComponentValue() {
		// 1. and 2.
		$this->consumeTokenAndWhitespace();

		// 3.
		if ( $this->currentToken->type() === Token::T_EOF ) {
			$this->parseError( 'unexpected-eof', $this->currentToken ); // "return a syntax error"?
			return null;
		}

		// 4.
		$value = $this->consumeComponentValue();
		// The spec says to return a syntax error if nothing is returned, but
		// that can never happen and the Editor's Draft removed that language.

		// 5.
		$this->consumeTokenAndWhitespace();

		// 6.
		if ( $this->currentToken->type() === Token::T_EOF ) {
			return $value;
		} else {
			$this->parseError( 'expected-eof', $this->currentToken ); // "return a syntax error"?
			return null;
		}

	}

	/**
	 * Parse a list of component values
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#parse-a-list-of-component-values
	 * @return ComponentValueList
	 */
	public function parseComponentValueList() {
		$list = new ComponentValueList();
		while ( true ) {
			$this->consumeToken(); // Move to the first/next token
			$value = $this->consumeComponentValue();
			if ( $value instanceof Token && $value->type() === Token::T_EOF ) {
				break;
			}
			$list->add( $value );
		}

		return $list;
	}

	/**
	 * Consume a list of rules
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-list-of-rules
	 * @param boolean $topLevel Determines the behavior when CDO and CDC tokens are encountered
	 * @return RuleList
	 */
	protected function consumeRuleList( $topLevel ) {
		$list = new RuleList();
		while ( true ) {
			$rule = false;
			switch ( $this->currentToken->type() ) {
				case Token::T_WHITESPACE:
					break;

				case Token::T_EOF:
					break 2;

				case Token::T_CDO:
				case Token::T_CDC:
					if ( $topLevel ) {
						// Do nothing
					} else {
						$rule = $this->consumeQualifiedRule();
					}
					break;

				case Token::T_AT_KEYWORD:
					$rule = $this->consumeAtRule();
					break;

				default:
					$rule = $this->consumeQualifiedRule();
					break;
			}

			if ( $rule ) {
				$list->add( $rule );
			}
			$this->consumeToken();
		}

		return $list;
	}

	/**
	 * Consume a list of declarations and at-rules
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-list-of-declarations
	 * @param bool $allowAtRules Whether to allow at-rules. This flag is not in
	 *  the spec, and is used to implement the non-spec self::parseDeclarationList().
	 * @return DeclarationOrAtRuleList|DeclarationList
	 */
	protected function consumeDeclarationOrAtRuleList( $allowAtRules = true ) {
		$list = $allowAtRules ? new DeclarationOrAtRuleList() : new DeclarationList();
		while ( true ) {
			$declaration = false;
			switch ( $this->currentToken->type() ) {
				case Token::T_WHITESPACE:
					break;

				case Token::T_SEMICOLON:
					$declaration = null;
					break;

				case Token::T_EOF:
					break 2;

				case Token::T_AT_KEYWORD:
					if ( $allowAtRules ) {
						$declaration = $this->consumeAtRule();
					} else {
						$this->parseError( 'unexpected-token-in-declaration-list', $this->currentToken );
						$this->consumeAtRule();
						$declaration = null;
					}
					break;

				case Token::T_IDENT:
					// The draft changes this to ComponentValue instead of Token, which makes more sense.
					$cvs = [];
					do {
						$cvs[] = $this->consumeComponentValue();
						$this->consumeToken();
					} while (
						$this->currentToken->type() !== Token::T_SEMICOLON &&
						$this->currentToken->type() !== Token::T_EOF
					);
					$tokens = ( new ComponentValueList( $cvs ) )->toTokenArray();
					$parser = static::newFromTokens( $tokens, $this->currentToken );
					$parser->consumeToken(); // Load that first token
					$declaration = $parser->consumeDeclaration();
					// Propagate any errors
					$this->parseErrors = array_merge( $this->parseErrors, $parser->parseErrors );
					break;

				default:
					$this->parseError( 'unexpected-token-in-declaration-list', $this->currentToken );
					do {
						$this->consumeComponentValue();
						$this->consumeToken();
					} while (
						$this->currentToken->type() !== Token::T_SEMICOLON &&
						$this->currentToken->type() !== Token::T_EOF
					);
					$declaration = null;
					break;
			}

			if ( $declaration ) {
				$list->add( $declaration );
			}
			$this->consumeToken();
		}

		return $list;
	}

	/**
	 * Consume a declaration
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-declaration
	 * @return Declaration|null
	 */
	protected function consumeDeclaration() {
		$declaration = new Declaration( $this->currentToken );

		// 2.
		$this->consumeTokenAndWhitespace();

		// 3.
		if ( $this->currentToken->type() !== Token::T_COLON ) {
			$this->parseError( 'expected-colon', $this->currentToken );
			return null;
		}
		$this->consumeToken();

		// 4.
		$value = $declaration->getValue();
		$l1 = $l2 = -1;
		while ( $this->currentToken->type() !== Token::T_EOF ) {
			// The draft changes this to ComponentValue instead of Token, which makes more sense.
			$value->add( $this->consumeComponentValue() );
			if ( $this->currentToken->type() !== Token::T_WHITESPACE ) {
				$l1 = $l2;
				$l2 = $value->count() - 1;
			}
			$this->consumeToken();
		}

		// 5.
		$v1 = $l1 >= 0 ? $value[$l1] : null;
		$v2 = $l2 >= 0 ? $value[$l2] : null;
		if ( $v1 instanceof Token && $v1->type() === Token::T_DELIM && $v1->value() === '!' &&
			$v2 instanceof Token && $v2->type() === Token::T_IDENT &&
			!strcasecmp( $v2->value(), 'important' )
		) {
			// Technically it doesn't say to remove any whitespace within/after
			// the "!important" too, but it makes sense to do so.
			while ( isset( $value[$l1] ) ) {
				$value->remove( $l1 );
			}
			$declaration->setImportant( true );
		}

		// 6.
		return $declaration;
	}

	/**
	 * Consume an at-rule
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-an-at-rule
	 * @return AtRule
	 */
	protected function consumeAtRule() {
		$rule = new AtRule( $this->currentToken );
		$this->consumeToken();
		while ( true ) {
			switch ( $this->currentToken->type() ) {
				case Token::T_SEMICOLON:
					return $rule;

				case Token::T_EOF:
					// Parse error from the editor's draft as of 2017-01-11
					if ( $this->currentToken->typeFlag() !== 'recursion-depth-exceeded' ) {
						$this->parseError( 'unexpected-eof-in-rule', $this->currentToken );
					}
					return $rule;

				case Token::T_LEFT_BRACE:
					$rule->setBlock( $this->consumeSimpleBlock( true ) );
					return $rule;

				default:
					$rule->getPrelude()->add( $this->consumeComponentValue() );
					break;
			}
			$this->consumeToken();
		}
		// @codeCoverageIgnoreStart
	}
	// @codeCoverageIgnoreEnd

	/**
	 * Consume a qualified rule
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-qualified-rule
	 * @return QualifiedRule|null
	 */
	protected function consumeQualifiedRule() {
		$rule = new QualifiedRule( $this->currentToken );
		while ( true ) {
			switch ( $this->currentToken->type() ) {
				case Token::T_EOF:
					if ( $this->currentToken->typeFlag() !== 'recursion-depth-exceeded' ) {
						$this->parseError( 'unexpected-eof-in-rule', $this->currentToken );
					}
					return null;

				case Token::T_LEFT_BRACE:
					$rule->setBlock( $this->consumeSimpleBlock( true ) );
					return $rule;

				default:
					$rule->getPrelude()->add( $this->consumeComponentValue() );
					break;
			}
			$this->consumeToken();
		}
		// @codeCoverageIgnoreStart
	}
	// @codeCoverageIgnoreEnd

	/**
	 * Consume a component value
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-component-value
	 * @return ComponentValue
	 */
	protected function consumeComponentValue() {
		if ( ++$this->cvDepth > static::CV_DEPTH_LIMIT ) {
			$this->parseError( 'recursion-depth-exceeded', $this->currentToken );
			// There's no way to safely recover from this without more recursion.
			// So just eat the rest of the input, then return a
			// specially-flagged EOF so we can avoid 100 "unexpected EOF"
			// errors.
			$position = $this->currentToken->getPosition();
			while ( $this->currentToken->type() !== Token::T_EOF ) {
				$this->consumeToken();
			}
			$this->currentToken = new Token( Token::T_EOF, [
				'position' => $position,
				'typeFlag' => 'recursion-depth-exceeded'
			] );
		}

		switch ( $this->currentToken->type() ) {
			case Token::T_LEFT_BRACE:
			case Token::T_LEFT_BRACKET:
			case Token::T_LEFT_PAREN:
				$ret = $this->consumeSimpleBlock();
				break;

			case Token::T_FUNCTION:
				$ret = $this->consumeFunction();
				break;

			default:
				$ret = $this->currentToken;
				break;
		}

		$this->cvDepth--;
		return $ret;
	}

	/**
	 * Consume a simple block
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-simple-block
	 * @return SimpleBlock
	 */
	protected function consumeSimpleBlock() {
		$block = new SimpleBlock( $this->currentToken );
		$endTokenType = $block->getEndTokenType();
		$this->consumeToken();
		while ( true ) {
			switch ( $this->currentToken->type() ) {
				case Token::T_EOF:
					// Parse error from the editor's draft as of 2017-01-12
					if ( $this->currentToken->typeFlag() !== 'recursion-depth-exceeded' ) {
						$this->parseError( 'unexpected-eof-in-block', $this->currentToken );
					}
					return $block;

				case $endTokenType:
					return $block;

				default:
					$block->getValue()->add( $this->consumeComponentValue() );
					break;
			}
			$this->consumeToken();
		}
		// @codeCoverageIgnoreStart
	}
	// @codeCoverageIgnoreEnd

	/**
	 * Consume a function
	 * @see https://www.w3.org/TR/2014/CR-css-syntax-3-20140220/#consume-a-function
	 * @return CSSFunction
	 */
	protected function consumeFunction() {
		$function = new CSSFunction( $this->currentToken );
		$this->consumeToken();

		while ( true ) {
			switch ( $this->currentToken->type() ) {
				case Token::T_EOF:
					// Parse error from the editor's draft as of 2017-01-12
					if ( $this->currentToken->typeFlag() !== 'recursion-depth-exceeded' ) {
						$this->parseError( 'unexpected-eof-in-function', $this->currentToken );
					}
					return $function;

				case Token::T_RIGHT_PAREN:
					return $function;

				default:
					$function->getValue()->add( $this->consumeComponentValue() );
					break;
			}
			$this->consumeToken();
		}
		// @codeCoverageIgnoreStart
	}
	// @codeCoverageIgnoreEnd
}

<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use InvalidArgumentException;
use Wikimedia\CSS\Objects\Token;
use Wikimedia\CSS\Objects\TokenList;
use Wikimedia\CSS\Util;

/**
 * Tokenizer that just returns a predefined list of tokens
 */
class TokenListTokenizer implements Tokenizer {

	/** @var Token[] */
	protected $tokens;

	/** @var Token */
	protected $eof;

	/**
	 * @param Token[]|TokenList $tokens Tokens to return
	 * @param Token|null $eof Token to copy as EOF
	 */
	public function __construct( $tokens, Token $eof = null ) {
		if ( $tokens instanceof TokenList ) {
			$this->tokens = $tokens->toTokenArray();
		} elseif ( is_array( $tokens ) ) {
			Util::assertAllInstanceOf( $tokens, Token::class, '$tokens' );
			$this->tokens = $tokens;
		} else {
			throw new InvalidArgumentException( '$tokens must be a TokenList or an array of tokens' );
		}

		if ( $eof && $eof->type() === Token::T_EOF ) {
			$this->eof = $eof;
		} else {
			$data = [];
			if ( $eof ) {
				$data['position'] = $eof->getPosition();
			}
			$this->eof = new Token( Token::T_EOF, $data );
		}
	}

	/** @inheritDoc */
	public function getParseErrors() {
		return [];
	}

	/** @inheritDoc */
	public function clearParseErrors() {
	}

	/** @inheritDoc */
	public function consumeToken() {
		return array_shift( $this->tokens ) ?: $this->eof;
	}

}

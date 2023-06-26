<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Grammar;

use Wikimedia\CSS\Objects\ComponentValueList;
use Wikimedia\CSS\Objects\Token;

/**
 * Match the special "<urange>" notation
 *
 * If this matcher is marked for capturing, its matches will have submatches
 * "start" and "end" holding T_NUMBER tokens representing the starting and
 * ending codepoints in the range.
 *
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#urange
 */
class UrangeMatcher extends Matcher {
	/** @var Matcher Syntax matcher */
	private $matcher;

	public function __construct() {
		$u = new KeywordMatcher( [ 'u' ] );
		$plus = new DelimMatcher( [ '+' ] );
		$ident = new TokenMatcher( Token::T_IDENT );
		$number = new TokenMatcher( Token::T_NUMBER );
		$dimension = new TokenMatcher( Token::T_DIMENSION );
		$q = new DelimMatcher( [ '?' ] );
		$qs = Quantifier::count( $q, 0, 6 );

		// This matches a lot of things; we post-process in generateMatches() to limit it to
		// only what's actually supposed to be accepted.
		$this->matcher = new Alternative( [
			new Juxtaposition( [ $u, $plus, $ident, $qs ] ),
			new Juxtaposition( [ $u, $number, $dimension ] ),
			new Juxtaposition( [ $u, $number, $number ] ),
			new Juxtaposition( [ $u, $dimension, $qs ] ),
			new Juxtaposition( [ $u, $number, $qs ] ),
			new Juxtaposition( [ $u, $plus, Quantifier::count( $q, 1, 6 ) ] ),
		] );
	}

	/** @inheritDoc */
	protected function generateMatches( ComponentValueList $values, $start, array $options ) {
		foreach ( $this->matcher->generateMatches( $values, $start, $options ) as $match ) {
			// <urange> is basically defined as a series of tokens that happens to have a certain string
			// representation. So stringify and regex it to see if it actually matches.
			$v = trim( $match->__toString(), "\n\t " );
			// Strip interpolated comments
			$v = strtr( $v, [ '/**/' => '' ] );
			$l = strlen( $v );
			if ( preg_match( '/^u\+([0-9a-f]{1,6})-([0-9a-f]{1,6})$/iD', $v, $m ) ) {
				$ustart = intval( $m[1], 16 );
				$uend = intval( $m[2], 16 );
			} elseif ( $l > 2 && $l <= 8 && preg_match( '/^u\+([0-9a-f]*\?*)$/iD', $v, $m ) ) {
				$ustart = intval( strtr( $m[1], [ '?' => '0' ] ), 16 );
				$uend = intval( strtr( $m[1], [ '?' => 'f' ] ), 16 );
			} else {
				continue;
			}
			if ( $ustart >= 0 && $ustart <= $uend && $uend <= 0x10ffff ) {
				$len = $match->getNext() - $start;
				$matches = [];
				if ( $this->captureName !== null ) {
					$tstart = new Token( Token::T_NUMBER, [ 'value' => $ustart, 'typeFlag' => 'integer' ] );
					$tend = new Token( Token::T_NUMBER, [ 'value' => $uend, 'typeFlag' => 'integer' ] );
					$matches = [
						new GrammarMatch(
							new ComponentValueList( $tstart->toComponentValueArray() ),
							0,
							1,
							'start',
							[]
						),
						new GrammarMatch(
							new ComponentValueList( $tend->toComponentValueArray() ),
							0,
							1,
							'end',
							[]
						),
					];
				}

				// Mark the 'U' T_IDENT beginning a <urange>, to later avoid
				// serializing it with extraneous comments.
				// @see Wikimedia\CSS\Util::stringify()
				// @phan-suppress-next-line PhanNonClassMethodCall False positive
				$values[$start]->urangeHack( $len );

				yield new GrammarMatch( $values, $start, $len, $this->captureName, $matches );
			}
		}
	}
}

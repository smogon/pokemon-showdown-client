<?php
/**
 * @file
 * @license https://opensource.org/licenses/Apache-2.0 Apache-2.0
 */

namespace Wikimedia\CSS\Parser;

use RuntimeException;
use UtfNormal\Constants;
use UtfNormal\Utils;
use Wikimedia\AtEase\AtEase;

/**
 * Character set conversion for CSS
 *
 * @see https://www.w3.org/TR/2019/CR-css-syntax-3-20190716/#input-byte-stream
 */
class Encoder {

	/**
	 * @var array Mapping from CSS encoding tags to mbstring/iconv encodings
	 * @see https://encoding.spec.whatwg.org/#concept-encoding-get
	 */
	protected static $encodings = [
		'unicode-1-1-utf-8'     => 'UTF-8',
		'utf-8'                 => 'UTF-8',
		'utf8'                  => 'UTF-8',
		'866'                   => 'CP866',
		'cp866'                 => 'CP866',
		'csibm866'              => 'CP866',
		'ibm866'                => 'CP866',
		'csisolatin2'           => 'ISO-8859-2',
		'iso-8859-2'            => 'ISO-8859-2',
		'iso-ir-101'            => 'ISO-8859-2',
		'iso8859-2'             => 'ISO-8859-2',
		'iso88592'              => 'ISO-8859-2',
		'iso_8859-2'            => 'ISO-8859-2',
		'iso_8859-2:1987'       => 'ISO-8859-2',
		'l2'                    => 'ISO-8859-2',
		'latin2'                => 'ISO-8859-2',
		'csisolatin3'           => 'ISO-8859-3',
		'iso-8859-3'            => 'ISO-8859-3',
		'iso-ir-109'            => 'ISO-8859-3',
		'iso8859-3'             => 'ISO-8859-3',
		'iso88593'              => 'ISO-8859-3',
		'iso_8859-3'            => 'ISO-8859-3',
		'iso_8859-3:1988'       => 'ISO-8859-3',
		'l3'                    => 'ISO-8859-3',
		'latin3'                => 'ISO-8859-3',
		'csisolatin4'           => 'ISO-8859-4',
		'iso-8859-4'            => 'ISO-8859-4',
		'iso-ir-110'            => 'ISO-8859-4',
		'iso8859-4'             => 'ISO-8859-4',
		'iso88594'              => 'ISO-8859-4',
		'iso_8859-4'            => 'ISO-8859-4',
		'iso_8859-4:1988'       => 'ISO-8859-4',
		'l4'                    => 'ISO-8859-4',
		'latin4'                => 'ISO-8859-4',
		'csisolatincyrillic'    => 'ISO-8859-5',
		'cyrillic'              => 'ISO-8859-5',
		'iso-8859-5'            => 'ISO-8859-5',
		'iso-ir-144'            => 'ISO-8859-5',
		'iso8859-5'             => 'ISO-8859-5',
		'iso88595'              => 'ISO-8859-5',
		'iso_8859-5'            => 'ISO-8859-5',
		'iso_8859-5:1988'       => 'ISO-8859-5',
		'arabic'                => 'ISO-8859-6',
		'asmo-708'              => 'ISO-8859-6',
		'csiso88596e'           => 'ISO-8859-6',
		'csiso88596i'           => 'ISO-8859-6',
		'csisolatinarabic'      => 'ISO-8859-6',
		'ecma-114'              => 'ISO-8859-6',
		'iso-8859-6'            => 'ISO-8859-6',
		'iso-8859-6-e'          => 'ISO-8859-6',
		'iso-8859-6-i'          => 'ISO-8859-6',
		'iso-ir-127'            => 'ISO-8859-6',
		'iso8859-6'             => 'ISO-8859-6',
		'iso88596'              => 'ISO-8859-6',
		'iso_8859-6'            => 'ISO-8859-6',
		'iso_8859-6:1987'       => 'ISO-8859-6',
		'csisolatingreek'       => 'ISO-8859-7',
		'ecma-118'              => 'ISO-8859-7',
		'elot_928'              => 'ISO-8859-7',
		'greek'                 => 'ISO-8859-7',
		'greek8'                => 'ISO-8859-7',
		'iso-8859-7'            => 'ISO-8859-7',
		'iso-ir-126'            => 'ISO-8859-7',
		'iso8859-7'             => 'ISO-8859-7',
		'iso88597'              => 'ISO-8859-7',
		'iso_8859-7'            => 'ISO-8859-7',
		'iso_8859-7:1987'       => 'ISO-8859-7',
		'sun_eu_greek'          => 'ISO-8859-7',
		'csiso88598e'           => 'ISO-8859-8',
		'csisolatinhebrew'      => 'ISO-8859-8',
		'hebrew'                => 'ISO-8859-8',
		'iso-8859-8'            => 'ISO-8859-8',
		'iso-8859-8-e'          => 'ISO-8859-8',
		'iso-ir-138'            => 'ISO-8859-8',
		'iso8859-8'             => 'ISO-8859-8',
		'iso88598'              => 'ISO-8859-8',
		'iso_8859-8'            => 'ISO-8859-8',
		'iso_8859-8:1988'       => 'ISO-8859-8',
		'visual'                => 'ISO-8859-8',
		// ISO-8859-8-I?
		'csiso88598i'           => 'ISO-8859-8',
		// ISO-8859-8-I?
		'iso-8859-8-i'          => 'ISO-8859-8',
		// ISO-8859-8-I?
		'logical'               => 'ISO-8859-8',
		'csisolatin6'           => 'ISO-8859-10',
		'iso-8859-10'           => 'ISO-8859-10',
		'iso-ir-157'            => 'ISO-8859-10',
		'iso8859-10'            => 'ISO-8859-10',
		'iso885910'             => 'ISO-8859-10',
		'l6'                    => 'ISO-8859-10',
		'latin6'                => 'ISO-8859-10',
		'iso-8859-13'           => 'ISO-8859-13',
		'iso8859-13'            => 'ISO-8859-13',
		'iso885913'             => 'ISO-8859-13',
		'iso-8859-14'           => 'ISO-8859-14',
		'iso8859-14'            => 'ISO-8859-14',
		'iso885914'             => 'ISO-8859-14',
		'csisolatin9'           => 'ISO-8859-15',
		'iso-8859-15'           => 'ISO-8859-15',
		'iso8859-15'            => 'ISO-8859-15',
		'iso885915'             => 'ISO-8859-15',
		'iso_8859-15'           => 'ISO-8859-15',
		'l9'                    => 'ISO-8859-15',
		'iso-8859-16'           => 'ISO-8859-16',
		'cskoi8r'               => 'KOI8-R',
		'koi'                   => 'KOI8-R',
		'koi8'                  => 'KOI8-R',
		'koi8-r'                => 'KOI8-R',
		'koi8_r'                => 'KOI8-R',
		'koi8-ru'               => 'KOI8-U',
		'koi8-u'                => 'KOI8-U',
		'csmacintosh'           => 'macintosh',
		'mac'                   => 'macintosh',
		'macintosh'             => 'macintosh',
		'x-mac-roman'           => 'macintosh',
		'dos-874'               => 'Windows-874',
		'iso-8859-11'           => 'Windows-874',
		'iso8859-11'            => 'Windows-874',
		'iso885911'             => 'Windows-874',
		'tis-620'               => 'Windows-874',
		'windows-874'           => 'Windows-874',
		'cp1250'                => 'Windows-1250',
		'windows-1250'          => 'Windows-1250',
		'x-cp1250'              => 'Windows-1250',
		'cp1251'                => 'Windows-1251',
		'windows-1251'          => 'Windows-1251',
		'x-cp1251'              => 'Windows-1251',
		'ansi_x3.4-1968'        => 'Windows-1252',
		'ascii'                 => 'Windows-1252',
		'cp1252'                => 'Windows-1252',
		'cp819'                 => 'Windows-1252',
		'csisolatin1'           => 'Windows-1252',
		'ibm819'                => 'Windows-1252',
		'iso-8859-1'            => 'Windows-1252',
		'iso-ir-100'            => 'Windows-1252',
		'iso8859-1'             => 'Windows-1252',
		'iso88591'              => 'Windows-1252',
		'iso_8859-1'            => 'Windows-1252',
		'iso_8859-1:1987'       => 'Windows-1252',
		'l1'                    => 'Windows-1252',
		'latin1'                => 'Windows-1252',
		'us-ascii'              => 'Windows-1252',
		'windows-1252'          => 'Windows-1252',
		'x-cp1252'              => 'Windows-1252',
		'cp1253'                => 'Windows-1253',
		'windows-1253'          => 'Windows-1253',
		'x-cp1253'              => 'Windows-1253',
		'cp1254'                => 'Windows-1254',
		'csisolatin5'           => 'Windows-1254',
		'iso-8859-9'            => 'Windows-1254',
		'iso-ir-148'            => 'Windows-1254',
		'iso8859-9'             => 'Windows-1254',
		'iso88599'              => 'Windows-1254',
		'iso_8859-9'            => 'Windows-1254',
		'iso_8859-9:1989'       => 'Windows-1254',
		'l5'                    => 'Windows-1254',
		'latin5'                => 'Windows-1254',
		'windows-1254'          => 'Windows-1254',
		'x-cp1254'              => 'Windows-1254',
		'cp1255'                => 'Windows-1255',
		'windows-1255'          => 'Windows-1255',
		'x-cp1255'              => 'Windows-1255',
		'cp1256'                => 'Windows-1256',
		'windows-1256'          => 'Windows-1256',
		'x-cp1256'              => 'Windows-1256',
		'cp1257'                => 'Windows-1257',
		'windows-1257'          => 'Windows-1257',
		'x-cp1257'              => 'Windows-1257',
		'cp1258'                => 'Windows-1258',
		'windows-1258'          => 'Windows-1258',
		'x-cp1258'              => 'Windows-1258',
		'x-mac-cyrillic'        => 'mac-cyrillic',
		'x-mac-ukrainian'       => 'mac-cyrillic',
		// GBK
		'chinese'               => 'GB18030',
		// GBK
		'csgb2312'              => 'GB18030',
		// GBK
		'csiso58gb231280'       => 'GB18030',
		// GBK
		'gb2312'                => 'GB18030',
		// GBK
		'gb_2312'               => 'GB18030',
		// GBK
		'gb_2312-80'            => 'GB18030',
		// GBK
		'gbk'                   => 'GB18030',
		// GBK
		'iso-ir-58'             => 'GB18030',
		// GBK
		'x-gbk'                 => 'GB18030',
		'gb18030'               => 'GB18030',
		'big5'                  => 'BIG-5',
		'big5-hkscs'            => 'BIG-5',
		'cn-big5'               => 'BIG-5',
		'csbig5'                => 'BIG-5',
		'x-x-big5'              => 'BIG-5',
		'cseucpkdfmtjapanese'   => 'EUC-JP',
		'euc-jp'                => 'EUC-JP',
		'x-euc-jp'              => 'EUC-JP',
		'csiso2022jp'           => 'ISO-2022-JP',
		'iso-2022-jp'           => 'ISO-2022-JP',
		'csshiftjis'            => 'SJIS',
		'ms932'                 => 'SJIS',
		'ms_kanji'              => 'SJIS',
		'shift-jis'             => 'SJIS',
		'shift_jis'             => 'SJIS',
		'sjis'                  => 'SJIS',
		'windows-31j'           => 'SJIS',
		'x-sjis'                => 'SJIS',
		'cseuckr'               => 'EUC-KR',
		'csksc56011987'         => 'EUC-KR',
		'euc-kr'                => 'EUC-KR',
		'iso-ir-149'            => 'EUC-KR',
		'korean'                => 'EUC-KR',
		'ks_c_5601-1987'        => 'EUC-KR',
		'ks_c_5601-1989'        => 'EUC-KR',
		'ksc5601'               => 'EUC-KR',
		'ksc_5601'              => 'EUC-KR',
		'windows-949'           => 'EUC-KR',
		'csiso2022kr'           => 'replacement',
		'hz-gb-2312'            => 'replacement',
		'iso-2022-cn'           => 'replacement',
		'iso-2022-cn-ext'       => 'replacement',
		'iso-2022-kr'           => 'replacement',
		'replacement'           => 'replacement',
		'utf-16be'              => 'UTF-16BE',
		'utf-16'                => 'UTF-16LE',
		'utf-16le'              => 'UTF-16LE',
		'x-user-defined'        => 'x-user-defined',
	];

	/**
	 * Convert CSS text to UTF-8
	 * @param string $text Text being detected
	 * @param string[] $encodings Encodings to use at various points in the algorithm:
	 *  - transport: Encoding from HTTP or the like
	 *  - environment: Encoding from HTML `<link>` or the like
	 * @return string
	 */
	public static function convert( $text, $encodings = [] ) {
		// First, check for a BOM and honor that if it's present.
		if ( strpos( $text, "\xef\xbb\xbf" ) === 0 ) {
			// UTF-8 with BOM (convert it anyway in case the BOM is a lie)
			return self::doConvert( 'UTF-8', substr( $text, 3 ) );
		}
		$start = substr( $text, 0, 2 );
		if ( $start === "\xfe\xff" ) {
			return self::doConvert( 'UTF-16BE', substr( $text, 2 ) );
		}
		if ( $start === "\xff\xfe" ) {
			return self::doConvert( 'UTF-16LE', substr( $text, 2 ) );
		}

		// 1. Transport encoding
		$encoding = isset( $encodings['transport'] )
			? trim( strtolower( $encodings['transport'] ), "\t\n\f\r " )
			: null;
		if ( $encoding !== null && isset( self::$encodings[$encoding] ) ) {
			return self::doConvert( self::$encodings[$encoding], $text );
		}

		// 2. @charset rule
		if ( preg_match( '/^@charset "([\x00-\x21\x23-\x7f]{0,1012})";/', $text, $m ) ) {
			$encoding = trim( strtolower( $m[1] ), "\t\n\f\r " );
			if ( $encoding === 'utf-16be' || $encoding === 'utf-16le' ) {
				// It's obviously lying.
				$encoding = 'utf-8';
			}
			if ( isset( self::$encodings[$encoding] ) ) {
				return self::doConvert( self::$encodings[$encoding], $text );
			}
		}

		// 3. Environment encoding
		$encoding = isset( $encodings['environment'] )
			? trim( strtolower( $encodings['environment'] ), "\t\n\f\r " )
			: null;
		if ( $encoding !== null && isset( self::$encodings[$encoding] ) ) {
			return self::doConvert( self::$encodings[$encoding], $text );
		}

		// 4. Just use UTF-8
		return self::doConvert( 'UTF-8', $text );
	}

	/**
	 * Actually perform the conversion
	 * @param string $encoding
	 * @param string $text
	 * @return string
	 */
	protected static function doConvert( $encoding, $text ) {
		// Pseudo-encoding that just outputs one replacement character
		if ( $encoding === 'replacement' ) {
			return Constants::UTF8_REPLACEMENT;
		}

		// Pseudo-encoding that shifts non-ASCII bytes to the BMP private use area
		if ( $encoding === 'x-user-defined' ) {
			return preg_replace_callback( '/[\x80-\xff]/', static function ( $m ) {
				return Utils::codepointToUtf8( 0xf700 + ord( $m[0] ) );
			}, $text );
		}

		// We prefer mbstring because it has sane handling of invalid input,
		// where iconv just chokes and returns false. But we need iconv for
		// some encodings mbstring doesn't support.
		if ( in_array( $encoding, mb_list_encodings(), true ) ) {
			$old = mb_substitute_character();
			mb_substitute_character( Constants::UNICODE_REPLACEMENT );
			$text = mb_convert_encoding( $text, 'UTF-8', $encoding );
			mb_substitute_character( $old );
			return $text;
		}

		$ret = AtEase::quietCall( 'iconv', $encoding, 'UTF-8', $text );
		if ( $ret === false ) {
			throw new RuntimeException( "Cannot convert '$text' from $encoding" );
		}
		return $ret;
	}
}

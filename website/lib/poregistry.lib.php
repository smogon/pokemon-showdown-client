<?php
/**
 * poregistry.lib.php
 *
 * This is a PHP client for the Pokemon Online server registry.
 * Call PORegistry::getServerList() to retrieve the list as an array.
 *
 * This file is released into the public domain.
 *
 * @author  Cathy J. Fitzpatrick <cathy@cathyjf.com>
 */

class POBuffer {
	private $buffer;
	private $pointer = 0;

	public function __construct($buffer) {
		$this->buffer = $buffer;
	}

	private function read($bytes) {
		$d = substr($this->buffer, $this->pointer, $bytes);
		$this->pointer += $bytes;
		return $d;
	}

	private function unpack($bytes, $pattern) {
		$d = $this->read($bytes);
		$arr = unpack($pattern . 'x', $d);
		return $arr['x'];
	}

	public function readquint8() {
		return $this->unpack(1, 'C');
	}

	public function readquint16() {
		return $this->unpack(2, 'n');
	}

	public function readquint32() {
		return $this->unpack(4, 'N');
	}

	public function readQString() {
		$length = $this->readquint32();
		$data = $this->read($length);
		return utf8_decode($data);
	}
}

class POClient {
	private $socket;

	public function __construct($host, $port) {
		$this->socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		if (!$this->socket) throw new Exception('Could not create socket');

		$ip = gethostbyname($host);
		if (!$ip) throw new Exception('Could not resolve hostname');

		$res = socket_connect($this->socket, $ip, $port);
		if (!$res) throw new Exception('Could not establish connection');
	}

	public function recvfully($bytes) {
		$received = 0;
		$ret = '';
		while ($received < $bytes) {
			$buf = '';
			$b = socket_recv($this->socket, $buf, $bytes - $received, MSG_WAITALL);
			if ($b === FALSE) return FALSE;
			$received += $b;
			$ret .= $buf;
		}
		return new POBuffer($ret);
	}

	public function recvmessage() {
		$header = $this->recvfully(4);
		if ($header === FALSE) return FALSE;
		$length = $header->readquint32();
		return $this->recvfully($length);
	}

	public function disconnect() {
		socket_close($this->socket);
	}
}

class PORegistry {

	public static function getServerList() {
		$client = new POClient('registry.pokemon-online.eu', 5090);
		$active = true;
		$servers = array();
		while ($active && ($msg = $client->recvmessage())) {
			// message type constants are defined in `src/Shared/networkcommands.h`
			$type = $msg->readquint8();
			switch ($type) {
				case 38:	// Announcement
					// ignore this
					break;

				case 5:		// PlayersList (server entry)
					// these array index names are copied from the PO source code
					$entry = array();
					$entry['name'] = $msg->readQString();
					$entry['desc'] = $msg->readQString();
					$entry['numplayers'] = $msg->readquint16();
					$entry['ip'] = $msg->readQString();
					$entry['max'] = $msg->readquint16();
					$entry['port'] = $msg->readquint16();
					$entry['passwordProtected'] = !!$msg->readquint8();
					$servers[] = $entry;
					break;

				case 57:	// ServerListEnd
					$active = false;
					break;
			}
		}
		$client->disconnect();

		usort($servers, function(&$a, &$b) {
			return $b['numplayers'] - $a['numplayers'];
		});
		return $servers;
	}

	public static function updateUserStats() {
		global $psdb;

		$servers = array();
		try {
			$servers = PORegistry::getServerList();
		} catch (Exception $e) {}
		if (count($servers) === 0) return;

		$maxusers = $servers[0]['numplayers'];
		$time = time() * 1000;

		$psdb->query("INSERT INTO `ntbb_userstatshistory` (`date`, `usercount`, `programid`) VALUES ('" . $psdb->escape($time) . "', '" . $psdb->escape($maxusers) . "', 'po')");
	}

}

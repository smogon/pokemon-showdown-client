// Borrowed from chaos, all credit to him

import * as tc from 'testcontainers';
import * as path from 'path';
import { Config } from '../config-loader';

/* HACK
Similar hack to postgresql.
 */
class MySQLReadyHack extends RegExp {
	seenInit: boolean;

	constructor() {
		super("");
		this.seenInit = false;
	}

	test(line: string) {
		if (line.includes("MySQL init process done. Ready for start up.")) {
			this.seenInit = true;
			return false;
		} else if (this.seenInit && line.includes("mysqld: ready for connections.")) {
			return true;
		} else {
			return false;
		}
	}
}

export class StartedMysqlContainer {
	private container: tc.StartedTestContainer;
	connectionInfo: {
		address: {
			host: string,
			port: number,
		},
		user: string,
		database: string,
	};
	constructor(
		container: tc.StartedTestContainer,
		connectionInfo?: StartedMysqlContainer['connectionInfo']
	) {
		this.container = container;
		this.connectionInfo = connectionInfo ?? {
			address: {
				host: container.getHost(),
				port: container.getMappedPort(3306),
			},
			user: 'test',
			database: 'test',
		};
		(Config.mysql as any) = this.connectionInfo;
	}

	stop() {
		return this.container.stop();
	}
}

export type StartupFile = { src: string, dst: string } | string;

export interface StartOptions {
	version?: number;
	startupFiles?: StartupFile[];
}

function toTcCopyFile(file: StartupFile) {
	let src, dst;
	if (typeof file === 'string') {
		src = file;
		dst = path.basename(file);
	} else {
		src = file.src;
		dst = file.dst;
	}
	return {
		source: src,
		target: path.join('/docker-entrypoint-initdb.d/', dst),
	};
}

export async function start(options: StartOptions = {}) {
	const version = options.version ?? "5.7";
	const startupFiles = options.startupFiles ?? [];
	const container = await new tc.GenericContainer(`mysql:${version}`)
		.withExposedPorts(3306)
		.withEnvironment({ MYSQL_ALLOW_EMPTY_PASSWORD: "yes", MYSQL_DATABASE: "xenforo" })
		.withWaitStrategy(tc.Wait.forLogMessage(new MySQLReadyHack))
		.withCopyFilesToContainer(startupFiles.map(toTcCopyFile))
		.start();
	return new StartedMysqlContainer(container);
}

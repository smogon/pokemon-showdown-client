import * as child_process from 'child_process';
import * as crypto from 'crypto';

export function toID(text: any): string {
	if (text?.id) {
		text = text.id;
	} else if (text?.userid) {
		text = text.userid;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function time() {
	// php has this with unix seconds. so we have to as well.
	// for legacy reasons. Yes, I hate it too.
	return Math.floor(Date.now() / 1000);
}

export function bash(command: string, cwd?: string): Promise<[number, string, string]> {
	return new Promise(resolve => {
		child_process.exec(command, {
			cwd: cwd || `${__dirname}/../..`,
		}, (error, stdout, stderr) => {
			resolve([error?.code || 0, stdout, stderr]);
		});
	});
}

export async function updateserver() {
	let [code, stdout, stderr] = await bash(`git fetch`);
	if (code) throw new Error(`updateserver: Crash while fetching - make sure this is a Git repository`);
	if (!stdout && !stderr) {
		return true; // no changes. we're fine.
	}

	[code, stdout, stderr] = await bash(`git rev-parse HEAD`);
	if (code || stderr) throw new Error(`updateserver: Crash while grabbing hash`);
	const oldHash = String(stdout).trim();

	[code, stdout, stderr] = await bash(`git stash save "PS /updateserver autostash"`);
	let stashedChanges = true;
	if (code) throw new Error(`updateserver: Crash while stashing`);
	if ((stdout + stderr).includes("No local changes")) {
		stashedChanges = false;
	} else if (stderr) {
		throw new Error(`updateserver: Crash while stashing`);
	}

	// errors can occur while rebasing or popping the stash; make sure to recover
	try {
		[code] = await bash(`git rebase --no-autostash FETCH_HEAD`);
		if (code) {
			// conflict while rebasing
			await bash(`git rebase --abort`);
			throw new Error(`restore`);
		}

		if (stashedChanges) {
			[code] = await bash(`git stash pop`);
			if (code) {
				// conflict while popping stash
				await bash(`git reset HEAD .`);
				await bash(`git checkout .`);
				throw new Error(`restore`);
			}
		}

		return true;
	} catch {
		// failed while rebasing or popping the stash
		await bash(`git reset --hard ${oldHash}`);
		if (stashedChanges) await bash(`git stash pop`);
		return false;
	}
}

export function stripNonAscii(str: string) {
	return str.replace(/[^(\x20-\x7F)]+/g, '');
}

export function md5(str: string) {
	return crypto.createHash('md5').update(str).digest('hex');
}

export function encode(text: string) {
	return Uint8Array.from(Buffer.from(text));
}

export function signAsync(algo: string, data: string, key: string) {
	return new Promise<string>((resolve, reject) => {
		crypto.sign(algo, encode(data), key, (err, out) => {
			if (err) return reject(err);
			return resolve(out.toString('hex'));
		});
	});
}

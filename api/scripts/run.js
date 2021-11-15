try {
	require('child_process').execSync('npx tsc');
} catch (e) { // @ts-expect-error
	console.error(e.message + e.stderr + e.stdout);
	process.exit(1);
}

// @ts-ignore
require('../.dist/src');

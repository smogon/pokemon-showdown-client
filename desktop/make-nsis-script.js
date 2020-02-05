/** key order matters for buckets */
function putInBuckets(files) {
	let buckets = new Map();
	buckets.set('', []);

	for (let file of files) {
		file = file.trim().replace(/\//g, `\\`);
		if (!file) continue;
		let splitFiles = file.split(`\\`);
		for (let i = 1; i < splitFiles.length; i++) {
			let parent = splitFiles.slice(0, i).join(`\\`);
			if (buckets.has(parent)) continue;
			buckets.set(parent, []);
		}
		let parent = splitFiles.slice(0, -1).join(`\\`);
		if (!splitFiles[splitFiles.length - 1]) continue;
		buckets.get(parent).push(file);
	}

	return buckets;
}

function createInstallScript(buckets) {
	let out = ``;
	for (const [parent, files] of buckets) {
		if (parent) out += `CreateDirectory "$INSTDIR\\${parent}"\n`;
		if (files.length) {
			if (parent) out += `setOutPath "$INSTDIR\\${parent}"\n`;
			for (const file of files) {
				out += `file "${file}"\n`;
			}
		}
	}
	return out;
}

function createUninstallScript(buckets) {
	let out = ``;
	let reverseEntries = [...buckets.entries()].reverse();
	for (const [parent, files] of reverseEntries) {
		for (const file of files) {
			out += `delete "$INSTDIR\\${file}"\n`;
		}
		if (parent) out += `rmDir "$INSTDIR\\${parent}"\n`;
	}
	return out;
}

/*********************************************************************************/

const files = [
	'credits.html',
	'd3dcompiler_47.dll',
	'ffmpeg.dll',
	'icons',
	'icons/icon_32x32.png',
	'icons/installerbg.bmp',
	'icons/pokemonshowdown.ico',
	'icudtl.dat',
	'index.html',
	'libEGL.dll',
	'libGLESv2.dll',
	'locales',
	'locales/am.pak',
	'locales/am.pak.info',
	'locales/ar.pak',
	'locales/ar.pak.info',
	'locales/bg.pak',
	'locales/bg.pak.info',
	'locales/bn.pak',
	'locales/bn.pak.info',
	'locales/ca.pak',
	'locales/ca.pak.info',
	'locales/cs.pak',
	'locales/cs.pak.info',
	'locales/da.pak',
	'locales/da.pak.info',
	'locales/de.pak',
	'locales/de.pak.info',
	'locales/el.pak',
	'locales/el.pak.info',
	'locales/en-GB.pak',
	'locales/en-GB.pak.info',
	'locales/en-US.pak',
	'locales/en-US.pak.info',
	'locales/es-419.pak',
	'locales/es-419.pak.info',
	'locales/es.pak',
	'locales/es.pak.info',
	'locales/et.pak',
	'locales/et.pak.info',
	'locales/fa.pak',
	'locales/fa.pak.info',
	'locales/fi.pak',
	'locales/fi.pak.info',
	'locales/fil.pak',
	'locales/fil.pak.info',
	'locales/fr.pak',
	'locales/fr.pak.info',
	'locales/gu.pak',
	'locales/gu.pak.info',
	'locales/he.pak',
	'locales/he.pak.info',
	'locales/hi.pak',
	'locales/hi.pak.info',
	'locales/hr.pak',
	'locales/hr.pak.info',
	'locales/hu.pak',
	'locales/hu.pak.info',
	'locales/id.pak',
	'locales/id.pak.info',
	'locales/it.pak',
	'locales/it.pak.info',
	'locales/ja.pak',
	'locales/ja.pak.info',
	'locales/kn.pak',
	'locales/kn.pak.info',
	'locales/ko.pak',
	'locales/ko.pak.info',
	'locales/lt.pak',
	'locales/lt.pak.info',
	'locales/lv.pak',
	'locales/lv.pak.info',
	'locales/ml.pak',
	'locales/ml.pak.info',
	'locales/mr.pak',
	'locales/mr.pak.info',
	'locales/ms.pak',
	'locales/ms.pak.info',
	'locales/nb.pak',
	'locales/nb.pak.info',
	'locales/nl.pak',
	'locales/nl.pak.info',
	'locales/pl.pak',
	'locales/pl.pak.info',
	'locales/pt-BR.pak',
	'locales/pt-BR.pak.info',
	'locales/pt-PT.pak',
	'locales/pt-PT.pak.info',
	'locales/ro.pak',
	'locales/ro.pak.info',
	'locales/ru.pak',
	'locales/ru.pak.info',
	'locales/sk.pak',
	'locales/sk.pak.info',
	'locales/sl.pak',
	'locales/sl.pak.info',
	'locales/sr.pak',
	'locales/sr.pak.info',
	'locales/sv.pak',
	'locales/sv.pak.info',
	'locales/sw.pak',
	'locales/sw.pak.info',
	'locales/ta.pak',
	'locales/ta.pak.info',
	'locales/te.pak',
	'locales/te.pak.info',
	'locales/th.pak',
	'locales/th.pak.info',
	'locales/tr.pak',
	'locales/tr.pak.info',
	'locales/uk.pak',
	'locales/uk.pak.info',
	'locales/vi.pak',
	'locales/vi.pak.info',
	'locales/zh-CN.pak',
	'locales/zh-CN.pak.info',
	'locales/zh-TW.pak',
	'locales/zh-TW.pak.info',
	'natives_blob.bin',
	'node.dll',
	'notification_helper.exe',
	'nw.dll',
	'nw.exe',
	'nw_100_percent.pak',
	'nw_200_percent.pak',
	'nw_elf.dll',
	'package.json',
	'resources.pak',
	'swiftshader',
	'swiftshader/libEGL.dll',
	'swiftshader/libGLESv2.dll',
	'v8_context_snapshot.bin',
];

/*********************************************************************************/

const buckets = putInBuckets(files);

console.log(createInstallScript(buckets));

console.log('');

console.log(createUninstallScript(buckets));


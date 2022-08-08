// Electron Forge configuration
const {execSync} = require('child_process');
module.exports = {
    packagerConfig: {
        appCopyright: 'Copyright (c) 2011-2022 Guangcong Luo and other contributors',
        icon: 'icons/pokemonshowdown',
        ignore: ['sign-mac-app', 'package_lock.json', 'DESKTOP.md', 'forge-config.js'],
        junk: true,
        buildVersion: execSync('git rev-parse --short HEAD').toString().trim(),
        overwrite: true,
        version: '1.0',
    },
    makers: [
        {name: '@electron-forge/maker-zip'},
        {name: '@electron-forge/maker-dmg'},
        {name: '@electron-forge/maker-deb'},
        {name: '@electron-forge/maker-rpm'},
        {name: '@electron-forge/maker-squirrel'},
    ],
};
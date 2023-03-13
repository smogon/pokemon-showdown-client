Desktop apps
============

Pokémon Showdown for desktop is made with [Electron][1].

  [1]: https://www.electronjs.org/

There's an `.ico` icon (for Windows) and an `.icns` icon (for Mac) in the `desktop/icons` directory of this repository. We use these pretty much whenever we need icons.

We used to use [NW.js](https://nwjs.io/) to make the desktop client; the client still includes code to handle users of the older NW.js clients.

Packaging
---------

Packaging is relatively simple; the Electron app simply connects to the web client at https://play.pokemonshowdown.com/, so very little code is bundled.

You'll need to install the dependencies for the desktop client:
```
cd desktop
npm install
```

Then, you can run the desktop client locally for testing purposes with `npx electron-forge start`, or package the client for distribution with `npx electron-forge make`. The latter command will default to building all distribution formats for the platform you're running on; you can use the `--platform` option to build for other platforms (like `linux`, `win32`, and `darwin`). You can also use `--targets` to build only certain distribution formats (for example, `--targets @electron-forge/maker-zip` to build only the `.zip` file). More documentation is available at [the Electron Forge website](https://www.electronforge.io/).

If you're just interested in using the desktop client, you can download a stable version from https://pokemonshowdown.com/, or a version automatically built from the latest source code by [GitHub Actions](https://github.com/smogon/pokemon-showdown-client/actions/workflows/build-desktop.yml) (you'll need to click the latest run and scroll down to the artifacts).

macOS code signing
------------------

By default, Mac apps will refuse to run, displaying a Gatekeeper warning. Removing the Gatekeeper warning requires an Apple Developer account (costs $99/year) and an annoying notarization process, described below:

1. Grab a developer ID certificate (this requires an Apple Developer account costing $99)

  - https://developer.apple.com/account/mac/certificate/certificateList.action
  - type should be "Developer ID Application"

2. Install the cert in Keychain and remember its "identity" (the part in parentheses)

  - just drag and drop the cert file into Keychain Access

3. Sign the app, set up entitlements, and set it to use Hardened Runtime

  - Edit `sign-mac-app`, setting `APP` to the location of your app (which will probably be in `desktop/out/Pokémon Showdown-darwin-x64` or `-arm64` for M1 Macs), and `IDENTITY` to the identity from step 9
  - Run `sign-mac-app`

4. Verify the signature

  - `codesign --verify -vvvv "Pokemon Showdown.app"`

12. Zip up the app into `Pokemon Showdown.zip`

  - right-click, Compress, rename to remove the `.app` part

13. Notarize the app, noting the `RequestUUID`

  - `[USERNAME]` is your Apple Developer account username (should be an email address)
  - `[PASSWORD]` is an app-specific password for your Apple Developer account
  - get an app-specific password here: https://support.apple.com/en-us/HT204397
  - `xcrun altool --notarize-app --primary-bundle-id "com.pokemonshowdown.pokemonshowdown" --username "[USERNAME]" --password "[PASSWORD]" --file "Pokemon Showdown.zip"`
  - this will show a `RequestUUID`, which you'll need

14. Wait for the app to notarize (this takes around 10 minutes in my experience)

15. Check the notarization

  - `[RequestUUID]` is the UUID from above
  - `xcrun altool --notarization-info [RequestUUID] -u "[USERNAME]"`
    - it will ask for a password; use the same password as in step 12
  - the Status line will say either `in progress`, `Package Approved`, or `Package Invalid`
    - `in progress` - try again in ten minutes
    - `Package Invalid` - error messages will be in the `LogFileURL` link
    - `Package Approved` - this is what we're hoping for

16. Staple the notarization

  - `xcrun stapler staple "Pokemon Showdown.app"`

17. Validate the notarization

  - `spctl -a -vvvv "Pokemon Showdown.app"`

18. Delete the un-stapled zip, and create a new zip

Apple's own documentation on the command-line notarization process might be useful:

https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow

But it doesn't cover how to set up an existing app for Hardened Runtime (I only figured it out from a random GitHub issue after an hour of Googling).

It also appears to be possible to tell Electron Forge to codesign the client as part of its build process, as documented on [its webpage](https://www.electronjs.org/docs/latest/tutorial/code-signing).

Desktop apps
============

Pokémon Showdown for desktop is made with [NW.js][1].

  [1]: https://nwjs.io/

There's an `.ico` icon (for Windows) and an `.icns` icon (for Mac) in the `graphics-src` directory of this repository. We use these pretty much whenever we need icons.

Note that NW.js doesn't support normal window icons in Windows, so we have to use a PNG icon to get scaling not to look horribly ugly.

Packaging
---------

NW.js's docs contains [packaging instructions][2], but they're strewn across their wiki and don't really go into best practices, so I have better packaging instructions here.

  [2]: http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/

For performance, we don't zip up the package on either platform. In Windows, the `index.html` and `package.json` files are dropped directly into the install directory, and in OS X the files are dropped into `Resources/app.nw`.

Packaging for Windows
---------------------

1. Put a copy of node-webkit (build or extract the prebuilt binary) into this folder.

2. Rename `nw.exe` to `pokemonshowdown.exe`

3. Edit `pokemonshowdown.exe` with [Resource Hacker][3], and replace the node-webkit icon with`icons/pokemonshowdown.ico`

4. You may need to update `pokemonshowdown.nsi` if the file layout has changed; refer to `make-nsis-script.js`

5. Using [NSIS][4], build `pokemonshowdown.nsi`

  [3]: http://www.angusj.com/resourcehacker/
  [4]: http://nsis.sourceforge.net/

Packaging for OS X
------------------

NOTE: By default, Mac apps will refuse to run, displaying a Gatekeeper warning. Removing the Gatekeeper warning requires an Apple Developer account (costs $99/year) and an annoying notarization process (step 8 to 18).

1. Get a copy of node-webkit (build or extract the prebuilt binary)

2. Rename it to `Pokemon Showdown.app`

3. Update `Pokemon Showdown.app/Contents/Info.plist`, changing:

   - `CFBundleIdentifier` to `com.pokemonshowdown.pokemonshowdown`
   - `CFBundleName` to `Pokemon Showdown`
   - `CFBundleDisplayName` to `Pokemon Showdown`
   - `CFBundleShortVersionString` to the current version, e.g. `0.11`
   - `CFBundleVersion` to the some sort of version code, I just used the git commit hash
   - empty the arrays of `CFBundleDocumentTypes`, `CFBundleURLTypes`, `NSUserActivityTypes`, and `UTExportedTypeDeclarations` so they look like `<array></array>`
     - (these register the app as able to open these files/URLs, which we _definitely_ do not want to do)

4. Update `Pokemon Showdown.app/Contents/Resources/en.lproj/InfoPlist.strings`,
   changing:

   - `CFBundleName` to `"Pokemon Showdown"`
   - `CFBundleDisplayName` to `"Pokemon Showdown"`
   - `CFBundleGetInfoString` to something like `"Pokemon Showdown 0.11, Copyright 2011-2020 Guangcong Luo and contributors."`
   - `NSHumanReadableCopyright` to something like `"Copyright 2011-2020 Guangcong Luo and contributors."`

5. Delete all the other `*.lproj` folders (other than `en.lproj`) in `Pokemon Showdown.app/Contents/Resources`

   - (our app is named "Pokemon Showdown" in all languages, we definitely don't want it to be called "nwjs" in other languages)

6. Replace `Pokemon Showdown.app/Contents/Resources/app.icns` and `Pokemon Showdown.app/Contents/Resources/document.icns` with the icns file in `graphics-src`.

7. Create a folder `Pokemon Showdown.app/Contents/Resources/app.nw` and put `index.html` and `package.json` in it.

8. Grab a developer ID certificate (this requires an Apple Developer account costing $99)

  - https://developer.apple.com/account/mac/certificate/certificateList.action
  - type should be "Developer ID Application"

9. Install the cert in Keychain and remember its "identity" (the part in parentheses)

  - just drag and drop the cert file into Keychain Access

10. Sign the app, set up entitlements, and set it to use Hardened Runtime

  - Edit `sign-mac-app`, setting `APP` to the location of your app, and `IDENTITY` to the identity from step 9
  - Run `sign-mac-app`

11. Verify the signature

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

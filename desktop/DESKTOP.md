Desktop apps
============

Pokémon Showdown for desktop is made with [node-webkit][1].

  [1]: https://github.com/rogerwang/node-webkit

There's an `.ico` icon (for Windows) and an `.icns` icon (for Mac) in the
`graphics-src` directory of this repository. We use these pretty much
whenever we need icons.

Note that node-webkit doesn't support normal window icons in Windows,
so we have to use a PNG icon to get scaling not to look horribly ugly.

Packaging
---------

node-webkit's wiki contains packaging instructions, but they're strewn
across their wiki and don't really go into best practices, so I have
better packaging instructions here.

For performance, we don't zip up the package on either platform. In Windows,
the `index.html` and `package.json` files are dropped directly into the
node-webkit directory, and in OS X the files are dropped into
`Resources/app.nw`.

Packaging for Windows
---------------------

1. Put a copy of node-webkit (build or extract the prebuilt binary) into this
   folder.

2. Rename `nw.exe` to `pokemonshowdown.exe`

3. Edit `pokemonshowdown.exe` with [Resource Hacker][2], and replace the
   node-webkit icon with`icons/pokemonshowdown.ico`

4. Using [NSIS][2], build `pokemonshowdown.nsi`

  [2]: http://www.angusj.com/resourcehacker/
  [3]: http://nsis.sourceforge.net/

Packaging for OS X
------------------

1. Get a copy of node-webkit (build or extract the prebuilt binary)

2. Rename it to `Pokemon Showdown.app`

3. Replace `Pokemon Showdown.app/Contents/Info.plist` with the `Info.plist`
   in this directory

4. Replace `Pokemon Showdown.app/Contents/Resources/nw.icns` with the
   icns file in `graphics-src`.

5. Create a folder `Pokemon Showdown.app/Contents/Resources/app.nw` and put
   `index.html` and `package.json` in it.

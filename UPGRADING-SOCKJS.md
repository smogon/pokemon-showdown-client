Upgrading SockJS
=======================================================================

When SockJS needs to be upgraded, you will also need to patch it to work
properly with nw.js. In the minified script, replace all instances of this:

```javascript
.call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})
```

With this:

```javascript
.call(this,window)
```

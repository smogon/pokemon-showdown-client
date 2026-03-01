<?php

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('X-Content-Type-Options: nosniff');

?>
<!DOCTYPE html>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />

<style>
  html, body {
    margin: 0;
    padding: 0;
  }
  html, body, button {
    font-family: Verdana,Helvetica,sans-serif;
    font-size: 12pt;
  }

  html {
    background: #f0f0f0;
    color: #333333;
  }
  body {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }
  strong {
    color: red;
  }
  textarea {
    min-height: 100px;
    field-sizing: content;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  @media (prefers-color-scheme: dark) {
    html {
      background: #000;
      color: #ddd;
      color-scheme: dark;
    }
    a {
      color:rgb(99, 174, 209);
    }
    a:visited {
      color:rgb(177, 123, 195);
    }
  }
</style>

<p>IF SOMEONE ASKS FOR THIS KEY, THEY ARE TRYING TO <strong>STEAL YOUR ACCOUNT</strong>. THEY ARE <strong>PHISHING</strong>.</p>
<p>Admins do not need this key to update your account. Do not give it to anyone who asks. You should ONLY use this to set up the testclient.</p>

<hr />

<button id="showbutton" onclick="showCookie()">I swear I'm ONLY using this to set up the testclient</button>

<!-- probably this is excessive -->
<!-- Run this in the dev console: <code>showCookie()</code> -->

<script>
  function getSid() {
    if (self !== top) {
      throw new Error("no way");
    }
    const entry = document.cookie.split('; ').map(part => part.split('=')).find(([k]) => k === 'sid');
    if (!entry) {
      throw new Error("No cookie found. Please log in to PS and try again.");
    }
    return decodeURIComponent(entry[1]);
  }
  function showCookie() {
    try {
      const cookie = getSid();
      document.getElementById('instructions').style.display='block';
      document.getElementById('showbutton').style.display='none';
      document.querySelector('textarea').textContent = `const POKEMON_SHOWDOWN_TESTCLIENT_KEY = '${cookie}';`;
      return "Okay, look back at the page"
    } catch (err) {
      alert(err.message);
      return;
    }
  }
</script>

<div id="instructions" style="display:none">
  <p>Place this in <code>config/testclient-key.js</code>:</p>
  <textarea readonly></textarea>
</div>

<!--

So yeah, there's an interesting question of whether I should provide this
convenience feature at all. There's a reason browsers have made it harder and
harder to access your cookies, after all. But browsers do still make it
possible, and this page has some big red warnings, so I think this is good
enough.

-->

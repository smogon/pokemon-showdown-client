**OAuth2**
========================================================================
The main Pokemon Showdown loginserver is fully equipped to serve as an OAuth2 provider. To make use of this functionality, you only need a `client_id` and a server able to handle the redirect.

Getting a client ID is as simple as filling out [this form](https://forms.gle/VAoSjqHn4zwem7tp9). We will try to get back to you as quickly as possible.

**Functionality documentation**
------------------------------------------------------------------------

The root URL for these APIs is `https://play.pokemonshowdown.com/api`.

`/oauth/authorize` - Serves the front-end page for users to authorize an application to use their account. You must provide `client_id`, `redirect_uri`, and `challenge` in the querystrying. Once the user clicks the button to authorize the use, it will redirect them to the `redirect_uri` with an `assertion` and `token` in the new querystring. The assertion can be used for an immediate login, and you can store the token in a user's browser to get assertions without opening the page on future logins.

`/oauth/api/getassertion` - Requires `challenge`, `client_id`, and `token` parameters. This endpoint allows you to get a new assertion for a user without opening the `authorize` page. The `challenge` parameter is the `challstr` [provided by the Pokemon Showdown server on login](https://github.com/smogon/pokemon-showdown/blob/master/PROTOCOL.md#global-messages), and the `token` can be acquired from `/oauth/authorize`.

`/oauth/api/refreshtoken` - Requires `client_id` and `token` parameters. This endpoint allows you to refresh an expiring token (which happens after two weeks) without having to make the end user open `/oauth/authorize` again. You provide the old token, the server verifies it, invalidates the old one, and provides a new one for another two weeks of use. 

**Examples**
------------------------------------------------------------------------
Here's a simple functionality example for getting a token for a user. 

```ts
const url = `https://play.pokemonshowdown.com/api/oauth/authorize?redirect_uri=https://mysite.com/oauth-demo&client_id=${clientId}`;
const nWindow = window.n = open(url, null, 'popup=1');
const checkIfUpdated = () => {
    if (nWindow.location.host === 'mysite.com') {
        const url = new URL(nWindow.location.href);
        runLoginWithAssertion(url.searchParams.get('assertion'));
        localStorage.setItem('ps-token', url.searchParams.get('token'));
        nWindow.close();
    } else {
        setTimeout(checkIfUpdated(1000));
    }
};
setTimeout(checkIfUpdated, 1500);
```

This opens the OAuth authorization page in a new window, waits for the user to click the button in the new window, then once the window's URL has changed, extracts the assertion and token from the new querystring, caches the token, and uses the assertion to log in.

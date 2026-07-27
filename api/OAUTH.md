Pokémon Showdown OAuth
========================================================================
The main Pokémon Showdown loginserver is an OAuth2-like provider to log a user in to a Pokémon Showdown loginserver. This is a little different from the OAuth 2.0 standard.

To use it, you just need a public `client_id` and a server able to handle the redirect.

Getting a client ID just means filling out this form:

> https://forms.gle/VAoSjqHn4zwem7tp9

We will try to get back to you as quickly as possible.

The loginserver registers one origin for each client. A callback may use any path or query parameters on that origin, but its scheme, hostname, and port must match the registered URL exactly.

Functionality documentation
------------------------------------------------------------------------

The root URL for these APIs is `https://play.pokemonshowdown.com/`.

`/api/oauth/authorize` - Serves the page for a logged-in user to authorize your application. You must provide `client_id`, `redirect_uri`, and `challenge` in the query string. After authorization, the page redirects to `redirect_uri` with `assertion`, `token`, and `user` in the query string. Existing query parameters on `redirect_uri` are preserved.

The assertion can be used for immediate login. The token is like a session cookie: stored so only the application on the user's device can access it. It remains usable for `/getassertion` for 14 days.

`/api/oauth/api/getassertion` - Requires `challenge`, `client_id`, and `token`. This endpoint returns a new assertion without showing the authorization page again. The `challenge` is the `challstr` [provided by the Pokémon Showdown server on login](https://github.com/smogon/pokemon-showdown/blob/master/PROTOCOL.md#global-messages). Browser requests are accepted only from the client's registered origin.

`/api/oauth/api/refreshtoken` - Requires `client_id` and `token`. This endpoint replaces the supplied token with a new token that is usable for another 14 days, without needing to `/authorize` again. The response will contain `success` (the new token, falsy on failure) and `expires` (the expiration time of the new token in milliseconds).

Example
------------------------------------------------------------------------
Here's a simple example for getting a token for a user:

```ts
const redirectUri = 'https://mysite.com/oauth-demo';
const authorizeUrl = new URL('https://play.pokemonshowdown.com/api/oauth/authorize');
authorizeUrl.searchParams.append('redirect_uri', redirectUri);
authorizeUrl.searchParams.append('client_id', clientId);
authorizeUrl.searchParams.append('challenge', challenge);

const popup = window.open(authorizeUrl, undefined, 'popup=1');
const checkIfUpdated = () => {
   try {
      if (popup?.location?.href?.startsWith(redirectUri)) {
         const url = new URL(popup.location.href);
         const assertion = url.searchParams.get('assertion');
         if (!assertion) {
            console.error('Received no assertion');
            return;
         }

         runLoginWithAssertion(url.searchParams.get('assertion'));

         const token = url.searchParams.get('token');
         if (!token) {
            console.error('Received no token');
            return;
         }

         localStorage.setItem('ps-token', token);
         popup.close();
      } else {
         setTimeout(checkIfUpdated, 500);
      }
   } catch (DOMException) {
      setTimeout(checkIfUpdated, 500);
   }
};

checkIfUpdated();
```

This opens the OAuth authorization page in a new window, waits for the user to click the button in the new window, then once the window's URL has changed, extracts the assertion and token from the new querystring, caches the token, and uses the assertion to log in.

Once you have a token, to get more assertions:

```
GET https://play.pokemonshowdown.com/api/oauth/api/getassertion
    ?client_id=CLIENT_ID
    &token=STORED_TOKEN
    &challenge=CURRENT_CHALLSTR
```

To rotate a token (do this every week), request:

```
GET https://play.pokemonshowdown.com/api/oauth/api/refreshtoken
    ?client_id=CLIENT_ID
    &token=STORED_TOKEN
```

Replace the stored token only when the refresh response contains a truthy `success` value.

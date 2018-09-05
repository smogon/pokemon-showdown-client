#!/usr/bin/env node

const gal = require('google-auth-library');

const CLIENT_ID = '912270888098-jjnre816lsuhc5clj3vbcn4o2q7p4qvk.apps.googleusercontent.com';

const token = process.argv[2];

var client = new gal.OAuth2Client(CLIENT_ID, '', '');
client.verifyIdToken({
  idToken: token,
  audience: CLIENT_ID
},
  // Or, if multiple clients access the backend:
  //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
  function(e, login) {
    if (e) return console.log(e);
    var payload = login.getPayload();
    // var userid = payload['sub'];
    console.log(JSON.stringify(payload));
    // If request specified a G Suite domain:
    //var domain = payload['hd'];
});

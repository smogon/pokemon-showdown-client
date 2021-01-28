const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const proxyLists = require('proxy-lists');

const { defaultserver, ssl } = require('./config/config');

const app = express()
const privateKey  = fs.readFileSync(ssl.privateKeyPath, 'utf8');
const certificate = fs.readFileSync(ssl.certificatePath, 'utf8');

let proxyList = [];

const proxyEvents = proxyLists.getProxies({
  countries: ['us', 'ca'],
  anonymityLevels: ['elite'],
  protocols: ['https'],
});

proxyLists.on('data', (proxies) => {
  proxyList.push(...proxies);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.post(`/~~${defaultserver.id}/action.php`, (request, response) => {
  let headers = {};
  const cookieHeader = request.headers['Cookie'] || request.headers['cookie'];
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];

  axios({
    method: 'POST',
    url: 'https://play.pokemonshowdown.com/action.php',
    data: request.body,
    headers,
    proxy: {
      host: proxy.ipAddress,
      port: proxy.port,
    },
  }).then((res) => {
    const setCookieHeader = res.headers['Set-Cookie'] || res.headers['set-cookie'];
    if (setCookieHeader) {
      if (Array.isArray(setCookieHeader)) {
        setCookieHeader.forEach((header) => {
          response.setHeader('set-cookie', header.replace('pokemonshowdown.com', 'clover.weedl.es'));
        });
      } else {
        response.setHeader('set-cookie', setCookieHeader.replace('pokemonshowdown.com', 'clover.weedl.es'));
      }
    };
    response.send(res.data)
  });
});
app.use('*.php', (request, response) => response.sendStatus(404));
app.use(express.static('./public', { index: 'index.html', fallthrough: true }));
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, './public/index.html'));
});

const httpApp = express();
httpApp.use('*', (request, response) => {
  response.redirect("https://" + request.headers.host + request.url);
});

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app);

proxyEvents.on('end', () => {
  console.log(`Loaded ${proxyList.length} proxies`);
  httpServer.listen(80, () => console.log('Http redirect listening on 80'));
  httpsServer.listen(443, () => console.log('Listening on 443'));
});

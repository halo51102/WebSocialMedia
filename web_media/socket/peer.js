const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = app.listen(3030, () => {
  console.log('PeerJS Server listening on port 3030');
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

app.use('/', peerServer);
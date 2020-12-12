const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const port = process.env.PORT || 6969;
server.listen(port);

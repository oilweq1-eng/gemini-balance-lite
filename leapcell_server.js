// leapcell_server.js

import http from 'http';
import { handleRequest } from './src/handle_request.js';

// Leapcell provides the port via the PORT environment variable. Default to 3000 if not set.
const port = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    // Construct a URL object to pass to the handleRequest function.
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Convert the Node.js IncomingMessage into a standard Request object
    // that the existing handleRequest function expects.
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
      duplex: 'half'
    });

    // Call the original request handler from the project.
    const webResponse = await handleRequest(webRequest);

    // Set the status code and headers on the Node.js ServerResponse.
    res.statusCode = webResponse.status;
    for (const [key, value] of webResponse.headers.entries()) {
      res.setHeader(key, value);
    }

    // Stream the body from the webResponse to the Node.js response.
    if (webResponse.body) {
      for await (const chunk of webResponse.body) {
        res.write(chunk);
      }
    }

    res.end();
  } catch (error) {
    console.error('Server Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});

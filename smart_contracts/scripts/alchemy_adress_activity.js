const http = require("http");

// create a new http server
const server = http.createServer((req, res) => {
  // check if the request method and url match the route we want
  if (req.method === "POST" && req.url === "/address_activity") {
    // log the request
    console.log("POST request received for /address_activity");

    // read the request body
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      // log the request body
      console.log(`Request body: ${body}`);

      // send a simple response
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World\n");
    });
  }
});

// start the server on port 8081
server.listen(8081, () => {
  console.log("server listening on http://localhost:8081");
});

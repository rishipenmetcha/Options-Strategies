var http = require('http');
var fs = require('fs');
var querystring = require("querystring");
var prices = require('./prices.js');

const sendFile = (res, status, type, filePath) => {
  res.writeHead(status, { "Content-type": type });
  fs.createReadStream(filePath).pipe(res);
};

var tick;



http.createServer((req, res) => {

  if (req.method === "POST") {
    let input = "";
    req.on("data", data => {
      input += data;
      if (input.length > 1e6) {
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        request.connection.destroy();
      }
    });
    req.on("end", () => {
      const { ticker } = querystring.decode(input);
      tick = ticker;
      console.log(`Ticker is ${ticker}`);
    });
  }

  switch (req.url) {
    case "/index":
      return sendFile(res, 200, "text/html", "./index.html");
    default:
      return sendFile(res, 200, "text/html", "./index.html");
  }

}).listen(3000);

console.log("In server " + tick);
// console.log(prices.getPrice());















// function onRequest(request, response) {
//   response.writeHead(200, { 'Content-Type': 'text/html' });
//   fs.readFile('./index.html', null, function (error, data) {
//     response.write(data);
//     response.end();
//   });
// }

// http.createServer(onRequest).listen(8000);
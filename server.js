var http = require('http');
var fs = require('fs');
var querystring = require("querystring");
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// Class variables
var response;

// Server
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
      response = JSON.parse(input);

      switch (req.url) {
        case "/getstrikeprices":
          return processRequest(req, res, 200, "application/json", "getstrikeprices");
        case "/getdates":
          return processRequest(req, res, 200, "application/json", "getdates");
        case "/processrequest":
          return processRequest(req, res, 200, "application/json", "getoptionprice");
        case "/":
          return sendFile(req, res, 200, "text/html", "./index.html");
        case "/client.js":
          return sendFile(req, res, 200, "text/javascript", "./client.js");
        default:
          return sendFile(req, res, 200, "text/html", "./index.html");
      }
    });
  } else {
    switch (req.url) {
      case "/":
        return sendFile(req, res, 200, "text/html", "./index.html");
      case "/client.js":
        return sendFile(req, res, 200, "text/javascript", "./client.js");
      case "/graph.js":
        return sendFile(req, res, 200, "text/javascript", "./graph.js");
      case "/chartist-plugin-threshold.js":
        return sendFile(req, res, 200, "text/javascript", "./chartist-plugin-threshold.js");
      case "/chartist-plugin-axistitle.js":
        return sendFile(req, res, 200, "text/javascript", "./chartist-plugin-axistitle.js");
      case "/style.css":
        return sendFile(req, res, 200, "text/css", "./style.css");
      default:
        return sendFile(req, res, 200, "text/html", "./index.html");
    }
  }
}).listen(3000);

const sendFile = (req, res, status, type, filePath) => {
  res.writeHead(status, { "Content-type": type });
  fs.createReadStream(filePath).pipe(res);
};

function ReqResp(req, res, status, type, data) {
  this.httpReq = req;
  this.httpRes = res;
  this.httpStatus = status;
  this.httpResType = type;
  this.data = data;
}

const processRequest = (req, res, status, type, purpose) => {
  var obj = new ReqResp(req, res, status, type, -1);
  getAPIData(obj, purpose);
}

const returnPrice = (rr) => {
  rr.httpRes.writeHead(rr.httpStatus, { 'Content-Type': rr.httpResType });
  rr.httpRes.write("" + JSON.stringify(rr.data));
  rr.httpRes.end();
}

const getDates = (dataObj) => {
  var result = [];
  dataObj.data.forEach(element => {
    result.push(element.expirationDate);
  });
  dataObj.data = result;
  returnPrice(dataObj);
}

const getStrikePrices = (dataObj) => {
  var resData;
  for (var i = 0; i < dataObj.data.length; i++) {
    if (dataObj.data[i].expirationDate === response.ttExp) {
      if (response.type === 'CALL') {
        resData = dataObj.data[i].options.CALL
      } else {
        resData = dataObj.data[i].options.PUT
      }
    }
  }

  var strikeArr = [];
  resData.forEach(element => {
    if (element.lastPrice) {
      strikeArr.push(element.strike);
    }
  });

  dataObj.data = strikeArr;
  returnPrice(dataObj)
}


const getOptionPrice = (dataObj) => {
  var resDataExpType;
  for (var i = 0; i < dataObj.data.length; i++) {
    if (dataObj.data[i].expirationDate === response.ttExp) {
      if (response.type === 'CALL') {
        resDataExpType = dataObj.data[i].options.CALL
      } else {
        resDataExpType = dataObj.data[i].options.PUT
      }
    }
  }
  var optPrice;
  for (var i = 0; i < resDataExpType.length; i++) {
    if (resDataExpType[i].strike == response.strikePrice) {
      optPrice = resDataExpType[i].lastPrice;
    }
  }
  dataObj.data = optPrice;
  returnPrice(dataObj)
}


const getAPIData = (obj, purpose) => {

  var xhr = new XMLHttpRequest();
  xhr.reqres = obj;
  xhr.purp = purpose;
  var secretkey = "5eefd46d9a9a29.74347066";
  var date = new Date();
  var currDateFormatted = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  var nextYearDateFormatted = (date.getFullYear() + 1) + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  var url = 'https://eodhistoricaldata.com/api/options/' + response.ticker + '.US?api_token=' + secretkey + '&from=' + currDateFormatted + '&to=' + nextYearDateFormatted;
  xhr.open('GET', url);

  xhr.onload = function () {
    try {
      var APIresponse = this.responseText;
      var parsedData = JSON.parse(APIresponse);

      this.reqres.data = parsedData.data;
      if (this.purp === 'getdates') {
        getDates(this.reqres);
      } else if (this.purp === 'getstrikeprices') {
        getStrikePrices(this.reqres);
      } else if (this.purp === 'getoptionprice') {
        getOptionPrice(this.reqres);
      }
    }
    catch (e) {
      console.log("in catch\h: " + e.message);
    }
  }
  xhr.send();

}


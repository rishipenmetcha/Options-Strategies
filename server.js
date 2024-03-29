const http = require('http');
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
        case "/getlastprice":
          return processRequest(req, res, 200, "application/json", "getlastprice");
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
}).listen(8080);

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
  var resData2;
  for (var i = 0; i < dataObj.data.length; i++) {
    if (dataObj.data[i].expirationDate === response.ttExp) {
      if (response.type === 'CALL' || response.type === 'BUTTERFLY') {
        resData = dataObj.data[i].options.CALL;
      } else if (response.type === 'PUT') {
        resData = dataObj.data[i].options.PUT;
      } else if (response.type === 'STRADDLE' || response.type === 'STRANGLE' || response.type === 'IRONCONDOR') {
        resData = dataObj.data[i].options.CALL;
        resData2 = dataObj.data[i].options.PUT;
      }
    }
  }

  var strikeArr = [];
  var strikeArr2 = [];
  resData.forEach(element => {
    if (element.lastPrice) {
      strikeArr.push(element.strike);
    }
  });
  if (response.type === 'STRADDLE') {
    resData2.forEach(element => {
      if (element.lastPrice) {
        strikeArr2.push(element.strike);
      }
    });
    strikeArr = strikeArr.filter(value => strikeArr2.includes(value));
  }
  dataObj.data = strikeArr;
  if (response.type === 'STRANGLE' || response.type === 'IRONCONDOR') {
    resData2.forEach(element => {
      if (element.lastPrice) {
        strikeArr2.push(element.strike);
      }
    });
    dataObj.data = { call: strikeArr, put: strikeArr2 };
  }
  returnPrice(dataObj)
}


const getOptionPrice = (dataObj) => {
  var resDataExpType;
  var resDataExpType2;
  for (var i = 0; i < dataObj.data.length; i++) {
    if (dataObj.data[i].expirationDate === response.ttExp) {
      if (response.type === 'CALL' || response.type === 'BUTTERFLY') {
        resDataExpType = dataObj.data[i].options.CALL;
      } else if (response.type === 'PUT') {
        resDataExpType = dataObj.data[i].options.PUT;
      } else if (response.type === 'STRADDLE' || response.type === 'STRANGLE' || response.type === 'IRONCONDOR') {
        resDataExpType = dataObj.data[i].options.CALL
        resDataExpType2 = dataObj.data[i].options.PUT;
      }
    }
  }
  var optPrice;
  var strike = response.strikePrice;
  if (response.type === 'STRANGLE') strike = response.strikePrice.call;
  if (response.type === 'BUTTERFLY') strike = response.strikePrice.lowcall.toString();
  if (response.type === 'IRONCONDOR') strike = response.strikePrice.highcall;


  for (var i = 0; i < resDataExpType.length; i++) {
    if (resDataExpType[i].strike == strike) {
      optPrice = resDataExpType[i].lastPrice;
    }
  }

  if (response.type === 'IRONCONDOR') {
    strike = response.strikePrice.shortcall;
    for (var i = 0; i < resDataExpType.length; i++) {
      if (resDataExpType[i].strike == strike) {
        optPrice = ((optPrice * 1000000) - (resDataExpType[i].lastPrice * 1000000)) / 1000000;
      }
    }
    strike = response.strikePrice.lowput;
    for (var i = 0; i < resDataExpType2.length; i++) {
      if (resDataExpType2[i].strike == strike) {
        optPrice = ((optPrice * 1000000) + (resDataExpType2[i].lastPrice * 1000000)) / 1000000;
      }
    }
    strike = response.strikePrice.shortput;
    for (var i = 0; i < resDataExpType2.length; i++) {
      if (resDataExpType2[i].strike == strike) {
        optPrice = ((optPrice * 1000000) - (resDataExpType2[i].lastPrice * 1000000)) / 1000000;
      }
    }
  }


  if (response.type === 'BUTTERFLY') {
    strike = response.strikePrice.shortcall.toString();
    for (var i = 0; i < resDataExpType.length; i++) {
      if (resDataExpType[i].strike == strike) {
        optPrice = ((optPrice * 10000) - (resDataExpType[i].lastPrice * 20000)) / 10000;
      }
    }
    strike = response.strikePrice.highcall.toString();
    for (var i = 0; i < resDataExpType.length; i++) {
      if (resDataExpType[i].strike == strike) {
        optPrice = ((optPrice * 10000) + (resDataExpType[i].lastPrice * 10000)) / 10000;
      }
    }
  }

  if (response.type === 'STRANGLE') strike = response.strikePrice.put;
  if (response.type === "STRADDLE" || response.type === "STRANGLE") {
    for (var i = 0; i < resDataExpType2.length; i++) {
      if (resDataExpType2[i].strike == strike) {
        optPrice = ((optPrice * 10000) + (resDataExpType2[i].lastPrice * 10000)) / 10000;
      }
    }
  }
  console.log("Final option price is: " + optPrice);
  dataObj.data = optPrice;
  returnPrice(dataObj);
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
      } else if (this.purp === 'getlastprice') {
        this.reqres.data = parsedData.lastTradePrice;
        returnPrice(this.reqres);
      }
    }
    catch (e) {
      console.log("in catch\h: " + e.message);
    }
  }
  xhr.send();

}
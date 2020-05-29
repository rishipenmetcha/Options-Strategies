var intrinioSDK = require('intrinio-sdk');



intrinioSDK.ApiClient.instance.authentications['ApiKeyAuth'].apiKey = "OjdhZDkwZDU3MTZlM2VjMDU4ZDMxZDQ0MGY0MTRkZmI1";

var securityAPI = new intrinioSDK.SecurityApi();

var identifier = "AAPL"; // String | A Security identifier (Ticker, FIGI, ISIN, CUSIP, Intrinio ID)

var today = new Date();
var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

var optsSecurity = {
  // 'startDate': new Date("2018-01-01"), // Date | Return prices on or after the date
  'endDate': date, // Date | Return prices on or before the date
  'frequency': "daily", // String | Return stock prices in the given frequency
  'pageSize': 1, // Number | The number of results to return
  'nextPage': null // String | Gets the next page of data from a previous API call
};

var currStockPrice;

function setPrice(p) {
  currStockPrice = p;
  console.log("THIS WORKS PRICE IS --> " + currStockPrice);
}

securityAPI.getSecurityStockPrices(identifier, optsSecurity).then(function (data) {
  // console.log(data);
  console.log("Inside then price is " + data.stock_prices[0].close);
  setPrice(data.stock_prices[0].close);
}, function (error) {
  console.error(error);
});

function getPrice() {
  return currStockPrice;
}


// var optionsAPI = new intrinioSDK.OptionsApi();
// var expdate;
// if (today.getMonth == 11) {
//   expdate = (today.getFullYear() + 1) + "-" + 1 + "-" + today.getDate();
// } else {
//   expdate = today.getFullYear() + "-" + (today.getMonth() + 2) + "-" + today.getDate();
// }

// var optsOptions = {
//   // 'type': "call", // Date | Return prices on or before the date
//   // 'strikeLessThan': 300, // String | Return stock prices in the given frequency
//   // 'expirationBefore': expdate,
//   // 'pageSize': 1, // Number | The number of results to return
//   // 'nextPage': null // String | Gets the next page of data from a previous API call


//   'type': "put", // String | The option contract type.
//   'strike': 170.0, // Number | The strike price of the option contract. This will return options contracts with strike price equal to this price.
//   'strikeGreaterThan': 190.0, // Number | The strike price of the option contract. This will return options contracts with strike prices greater than this price.
//   'strikeLessThan': 150.0, // Number | The strike price of the option contract. This will return options contracts with strike prices less than this price.
//   'expiration': "2019-03-01", // String | The expiration date of the option contract. This will return options contracts with expiration dates on this date.
//   'expirationAfter': "2019-01-01", // String | The expiration date of the option contract. This will return options contracts with expiration dates after this date.
//   'expirationBefore': "2019-12-31", // String | The expiration date of the option contract. This will return options contracts with expiration dates before this date.
//   'pageSize': 100, // Number | The number of results to return
//   'nextPage': null // String | Gets the next page of data from a previous API call


// };
// console.log("Right before options: " + identifier);
// // optionsAPI.getOptions(identifier, optsOptions).then(function (data) {
// //   console.log(data);
// // }, function (error) {
// //   console.error(error);
// // });



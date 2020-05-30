var intrinioSDK = require('intrinio-sdk');
intrinioSDK.ApiClient.instance.authentications['ApiKeyAuth'].apiKey = "OjdhZDkwZDU3MTZlM2VjMDU4ZDMxZDQ0MGY0MTRkZmI1";

var optionsAPI = new intrinioSDK.OptionsApi();

var symbol = 'MSFT'; // String | The option symbol, corresponding to the underlying security.

var opts = {
  // 'type': "call", // String | The option contract type.
  // 'strike': 300, // Number | The strike price of the option contract. This will return options contracts with strike price equal to this price.
  // 'strikeGreaterThan': 190.0, // Number | The strike price of the option contract. This will return options contracts with strike prices greater than this price.
  // 'strikeLessThan': 150.0, // Number | The strike price of the option contract. This will return options contracts with strike prices less than this price.
  // 'expiration': "2019-03-01", // String | The expiration date of the option contract. This will return options contracts with expiration dates on this date.
  // 'expirationAfter': "2020-05-20", // String | The expiration date of the option contract. This will return options contracts with expiration dates after this date.
  // 'expirationBefore': "2020-06-29", // String | The expiration date of the option contract. This will return options contracts with expiration dates before this date.
  'pageSize': 15, // Number | The number of results to return
  // 'nextPage': null // String | Gets the next page of data from a previous API call
};

optionsAPI.getOptions(symbol).then(function (data) {
  console.log(data);
}, function (error) {
  console.error(error);
});
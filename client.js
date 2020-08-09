const getData = () => {

  const tickerInput = document.getElementById('ticker').value;
  var strikeInput = document.getElementById('strike').value;
  const strikeInput2 = document.getElementById('strike2').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = fromDisplayDate(document.getElementById('ttExp').value);
  if (!(tickerInput && strikeInput && typeInput && expiryInput)) {
    alert("Please fill out all inputs!")
    return;
  }
  if (typeInput === 'STRANGLE') {
    console.log("Call is..." + strikeInput2);
    console.log("Put is..." + strikeInput);

    if (strikeInput2 <= strikeInput) {
      alert("Strike of the call option must be greater than strike of put option in a Strangle strategy");
      return;
    }
    strikeInput = { call: strikeInput2, put: strikeInput };
  }
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./processrequest", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var optionPrice = xhttp.responseText;
      document.getElementById("out").innerHTML = "The price of the option is: $" + optionPrice;
      drawGraph(optionPrice, strikeInput, typeInput);

    }
  };
  const response = {
    ticker: tickerInput,
    strikePrice: strikeInput,
    type: typeInput,
    ttExp: expiryInput
  }
  xhttp.send(JSON.stringify(response));
}

const tickerUpdated = () => {
  getDates();
  getLastPrice();
}


const getDates = () => {

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./getdates", true);

  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var listDates = JSON.parse(xhttp.responseText);
      var select = document.getElementById("ttExp");
      select.options.length = 0
      for (var i = 0; i < listDates.length; i++) {
        const opt = toDisplayDate(listDates[i]);
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
      }
      getStrikePrices();
    }
  };

  const tickerInput = document.getElementById('ticker').value;
  const strikeInput = document.getElementById('strike').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = document.getElementById('ttExp').value;
  const response = {
    ticker: tickerInput,
    strikePrice: strikeInput,
    type: typeInput,
    ttExp: expiryInput
  }
  xhttp.send(JSON.stringify(response));
}


const getStrikePrices = () => {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./getstrikeprices", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var listStrikePrices = JSON.parse(xhttp.responseText);

      var select = document.getElementById("strike");
      select.options.length = 0

      if (typeInput === "STRANGLE") {
        var listStrikePrices2 = listStrikePrices.call;
        var select2 = document.getElementById("strike2");
        select2.options.length = 0
        listStrikePrices = listStrikePrices.put;
        for (var i = 0; i < listStrikePrices2.length; i++) {
          var opt = listStrikePrices2[i];
          var el = document.createElement("option");
          el.textContent = opt;
          el.value = opt;
          select2.appendChild(el);
        }
      }

      for (var i = 0; i < listStrikePrices.length; i++) {
        var opt = listStrikePrices[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
      }
    }
  };

  const tickerInput = document.getElementById('ticker').value;
  const strikeInput = document.getElementById('strike').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = fromDisplayDate(document.getElementById('ttExp').value);

  if (typeInput === "STRANGLE") {
    document.getElementById("strikeLabel2").style.display = "inline";
    document.getElementById("strike2").style.display = "inline";
    document.getElementById("strikeLabel1").innerHTML = "Put Strike:";
  } else {
    document.getElementById("strikeLabel2").style.display = "none";
    document.getElementById("strike2").style.display = "none";
    document.getElementById("strikeLabel1").innerHTML = "Strike:";

  }

  const response = {
    ticker: tickerInput,
    strikePrice: strikeInput,
    type: typeInput,
    ttExp: expiryInput
  }

  xhttp.send(JSON.stringify(response));
}









const getLastPrice = () => {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./getlastprice", true);

  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var lastPrice = JSON.parse(xhttp.responseText);
      document.getElementById("currentPrice").innerHTML = "Last Closing Price: " + lastPrice;
    }
  };

  const tickerInput = document.getElementById('ticker').value;
  const strikeInput = document.getElementById('strike').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = document.getElementById('ttExp').value;
  const response = {
    ticker: tickerInput,
    strikePrice: strikeInput,
    type: typeInput,
    ttExp: expiryInput
  }
  xhttp.send(JSON.stringify(response));
}









const toDisplayDate = (date) => {
  const lst = date.split('-');
  const res = lst[1] + '-' + lst[2] + '-' + lst[0];
  return res;
}

const fromDisplayDate = (date) => {
  const lst = date.split('-');
  const res = lst[2] + '-' + lst[0] + '-' + lst[1];
  return res;
}










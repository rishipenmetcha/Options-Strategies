const emptyGraph = () => {
  drawGraph(0,0,"EMPTY");
}


const getData = () => {

  const tickerInput = document.getElementById('ticker').value;
  var strikeInput = document.getElementById('strike').value;
  var strikeInput2 = document.getElementById('strike2').value;
  var strikeInput3 = document.getElementById('strike3').value;
  var strikeInput4 = document.getElementById('strike4').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = fromDisplayDate(document.getElementById('ttExp').value);
  if (!(tickerInput && strikeInput && typeInput && expiryInput)) {
    alert("Please fill out all inputs!")
    return;
  }
  if (typeInput === 'STRANGLE') {
    console.log("Call is..." + strikeInput2);
    console.log("Put is..." + strikeInput);

    strikeInput = Number(strikeInput);
    strikeInput2 = Number(strikeInput2);

    if (strikeInput2 <= strikeInput) {
      alert("Call strike must be greater than put strike in a Strangle strategy");
      return;
    }
    strikeInput = strikeInput.toString();
    strikeInput2 = strikeInput2.toString();
    strikeInput = { call: strikeInput2, put: strikeInput };
  } else if (typeInput === 'BUTTERFLY') {
    strikeInput = Number(strikeInput);
    strikeInput2 = Number(strikeInput2);
    strikeInput3 = Number(strikeInput3);
    if (strikeInput <= strikeInput2) {
      alert("Short strike must be greater than the low call strike");
      return;
    }
    if (strikeInput3 <= strikeInput2) {
      if(typeInput === 'BUTTERFLY') alert("High call strike must be greater than the short strike");
      return;
    }
    strikeInput = { shortcall: strikeInput, lowcall: strikeInput2, highcall: strikeInput3};
  }


  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./processrequest", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var optionPrice = xhttp.responseText;
      if(Number(optionPrice) <= 0 || strikeInput.shortcall-strikeInput.lowcall-Number(optionPrice) <= 0) {
        alert('Please pick a new combination of strike, prices are not up to date.');
        return;
      }

      document.getElementById("out").innerHTML = "Option(s) Price: $" + optionPrice;

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
      console.log("strike prices fun called");
      var select = document.getElementById("strike");
      var select2 = document.getElementById("strike2");
      var select3 = document.getElementById("strike3");
      var select4 = document.getElementById("strike4");
      select.options.length = 0
      select2.options.length = 0
      select3.options.length = 0
      select4.options.length = 0

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

  var b1 = document.createElement("br");
  var b2 = document.createElement("br");

  if (typeInput === "STRANGLE") {
    document.getElementById("strikeLabel2").style.display = "inline";
    document.getElementById("strike2").style.display = "inline";
    document.getElementById("strikeLabel3").style.display = "none";
    document.getElementById("strike3").style.display = "none";
    document.getElementById("strikeLabel4").style.display = "none";
    document.getElementById("strike4").style.display = "none";
    document.getElementById("strikeLabel1").innerHTML = "Put Strike:";
    document.getElementById("strikeLabel2").innerHTML = "Call Strike:";
  } else if (typeInput === "BUTTERFLY") {
    document.getElementById("strikeLabel2").style.display = "inline";
    document.getElementById("strike2").style.display = "inline";
    document.getElementById("strikeLabel3").style.display = "inline";
    document.getElementById("strike3").style.display = "inline";
    document.getElementById("strikeLabel4").style.display = "none";
    document.getElementById("strike4").style.display = "none";
    document.getElementById("strikeLabel1").innerHTML = "Short Call Strike:";
    document.getElementById("strikeLabel2").innerHTML = "Low Call Strike:";
    document.getElementById("strikeLabel3").innerHTML = "High Call Strike:";
  } else if (typeInput === "IRONCONDOR") {
    document.getElementById("strikeLabel2").style.display = "inline";
    document.getElementById("strike2").style.display = "inline";
    document.getElementById("strikeLabel3").style.display = "inline";
    document.getElementById("strike3").style.display = "inline";
    document.getElementById("strikeLabel4").style.display = "inline";
    document.getElementById("strike4").style.display = "inline";
    document.getElementById("strikeLabel1").innerHTML = "Low Put Strike:";
    document.getElementById("strikeLabel2").innerHTML = "Short Put Strike:";
    document.getElementById("strikeLabel3").innerHTML = "Short Call Strike:";
    document.getElementById("strikeLabel4").innerHTML = "High Call Strike:";
  } else {
    document.getElementById("strikeLabel2").style.display = "none";
    document.getElementById("strike2").style.display = "none";
    document.getElementById("strikeLabel3").style.display = "none";
    document.getElementById("strike3").style.display = "none";
    document.getElementById("strikeLabel4").style.display = "none";
    document.getElementById("strike4").style.display = "none";
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
      var b1 = document.createElement("br");
      var b2 = document.createElement("br");

      var lastPriceElem = document.getElementById("currentPrice");
      lastPriceElem.innerHTML = "Last Close: $" + lastPrice;
      lastPriceElem.append(b1,b2);
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

const updateStrikes = () => {
  const typeInput = document.getElementById('type').value;
  var strikeInput = document.getElementById('strike').value;
  if(typeInput === "BUTTERFLY") {
    var lowArr = []
    strikeInput = Number(strikeInput);
    var allStrikes = Array.from(document.getElementById('strike').options);
    allStrikes = allStrikes.map(x => x.value);
    var tempArr = allStrikes;
    allStrikes.forEach(element => {
      var diff = strikeInput - element;
      if(element < strikeInput) {
        if(tempArr.includes((strikeInput + diff).toString())) {
        lowArr.push(element);
        }
      }
    });

    var select2 = document.getElementById("strike2");
    select2.options.length = 0;
    for (var i = 0; i < lowArr.length; i++) {
      var opt = lowArr[i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      if(i === 0) {
        console.log("Firsy strike")
        el.selected = true;
      }
      select2.appendChild(el);
    }
    updateStrikes2();
  }
}

const updateStrikes2 = () => {
  const typeInput = document.getElementById('type').value;
  var strikeInput = document.getElementById('strike').value;
  var strikeInput2 = document.getElementById('strike2').value;
  if(typeInput === "BUTTERFLY") {
    var select3 = document.getElementById("strike3");
    select3.options.length = 0;
    var opt = (Number(strikeInput) - Number(strikeInput2)) + Number(strikeInput);
    console.log(opt);
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    el.selected = true;
    select3.appendChild(el);
  }

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










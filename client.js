const emptyGraph = () => {
  drawGraph(0, 0, "EMPTY");
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
      if (typeInput === 'BUTTERFLY') alert("High call strike must be greater than the short strike");
      return;
    }
    strikeInput = { shortcall: strikeInput, lowcall: strikeInput2, highcall: strikeInput3 };
  } else if (typeInput === 'IRONCONDOR') {
    if (!(tickerInput && strikeInput && strikeInput2 && strikeInput3 && strikeInput4 && typeInput && expiryInput)) {
      alert("Please fill out all inputs!")
      return;
    }
    strikeInput = { lowput: strikeInput, shortput: strikeInput2, shortcall: strikeInput3, highcall: strikeInput4 };
  }


  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./processrequest", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var optionPrice = xhttp.responseText;
      if (typeInput === 'BUTTERFLY') {
        if (Number(optionPrice) <= 0 || strikeInput.shortcall - strikeInput.lowcall - Number(optionPrice) <= 0) {
          alert('Please pick a new combination of strike, prices are not up to date.');
          return;
        }
      }

      if (typeInput === 'IRONCONDOR') {
        if (Number(optionPrice >= 0)) {
          alert('Please pick a new combination of strike, prices are not up to date.');
          return;
        }
      }

      console.log(optionPrice);

      roundedOpt = (optionPrice * 100000) / 100000;
      if (Number(optionPrice < 0)) {
        document.getElementById("out").innerHTML = "Option(s) Cost: -$" + -roundedOpt;
      } else {
        document.getElementById("out").innerHTML = "Option(s) Cost: $" + roundedOpt;
      }

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
  updateInfoLink();
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./getstrikeprices", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var listStrikePrices = JSON.parse(xhttp.responseText);
      var select = document.getElementById("strike");
      var select2 = document.getElementById("strike2");
      var select3 = document.getElementById("strike3");
      var select4 = document.getElementById("strike4");
      select.options.length = 0
      select2.options.length = 0
      select3.options.length = 0
      select4.options.length = 0

      // Updates only if it is Strangle
      if (typeInput === "STRANGLE") {
        var listStrikePrices2 = listStrikePrices.call;
        // var select2 = document.getElementById("strike2");
        // select2.options.length = 0
        listStrikePrices = listStrikePrices.put;
        for (var i = 0; i < listStrikePrices2.length; i++) {
          var opt = listStrikePrices2[i];
          var el = document.createElement("option");
          el.textContent = opt;
          el.value = opt;
          select2.appendChild(el);
        }
      }

      // Updates only if it is Iron Condor
      if (typeInput === 'IRONCONDOR') {
        listStrikePrices2 = listStrikePrices.call;
        for (var i = 0; i < listStrikePrices2.length; i++) {
          var opt = listStrikePrices2[i];
          var el = document.createElement("option");
          el.textContent = opt;
          el.value = opt;
          select3.appendChild(el);
        }
        listStrikePrices = listStrikePrices.put;
      }

      // Updates for all types
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

  document.getElementById("arrow1").style.display = "none";
  document.getElementById("arrow2").style.display = "none";
  document.getElementById("arrow3").style.display = "none";
  document.getElementById("arrow4").style.display = "none";


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
    document.getElementById("arrow1").style.display = "inline";
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
    document.getElementById("arrow1").style.display = "inline";
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
      lastPriceElem.append(b1, b2);
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
  var select2 = document.getElementById("strike2");
  select2.options.length = 0;
  if (typeInput === "BUTTERFLY") {
    document.getElementById("arrow1").style.display = "none";
    var lowArr = []
    strikeInput = Number(strikeInput);
    var allStrikes = Array.from(document.getElementById('strike').options);
    allStrikes = allStrikes.map(x => x.value);
    var tempArr = allStrikes;
    allStrikes.forEach(element => {
      var diff = strikeInput - element;
      if (element < strikeInput) {
        if (tempArr.includes((strikeInput + diff).toString())) {
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
      if (i === 0) {
        el.selected = true;
      }
      select2.appendChild(el);
    }
    updateStrikes2();
  }
  if (typeInput === 'IRONCONDOR') {
    document.getElementById("arrow1").style.display = "none";
    document.getElementById("arrow2").style.display = "inline";
    document.getElementById("arrow3").style.display = "none";


    var allStrikes = Array.from(document.getElementById('strike').options);
    allStrikes = allStrikes.map(x => x.value);
    allStrikes.forEach(element => {
      var el = document.createElement("option");
      el.textContent = element;
      el.value = element;
      select2.appendChild(el);
    })
  }


}

const updateStrikes2 = () => {
  const typeInput = document.getElementById('type').value;
  var strikeInput = document.getElementById('strike').value;
  var strikeInput2 = document.getElementById('strike2').value;
  var callStrikes = Array.from(document.getElementById('strike3').options);
  var select3 = document.getElementById("strike3");


  if (typeInput === "BUTTERFLY") {
    var opt = ((Number(strikeInput) * 1000 - Number(strikeInput2) * 1000) + Number(strikeInput) * 1000) / 1000;
    console.log(opt);
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    el.selected = true;
    select3.appendChild(el);
  }

  if (typeInput === "IRONCONDOR") {
    document.getElementById("arrow1").style.display = "none";
    document.getElementById("arrow2").style.display = "none";
    document.getElementById("arrow3").style.display = "inline";

    callStrikes = callStrikes.map(x => x.value);
    var spread = (Number(strikeInput2) * 1000 - Number(strikeInput) * 1000) / 1000;
    if (spread <= 0) {
      alert("Short put strike has to be greater than low put strike");
      document.getElementById("arrow3").style.display = "none";
      document.getElementById("arrow2").style.display = "inline";
      return;
    }
    select3.options.length = 0;
    var tempArr = callStrikes;
    console.log(tempArr);
    var res = [];
    callStrikes.forEach(element => {
      var num = (Number(element) * 1000 + spread * 1000) / 1000;
      if (tempArr.includes(num + "")) {
        res.push(element);
      }
    });
    console.log(res);
    res.forEach(element => {
      var el = document.createElement("option");
      el.textContent = element;
      el.value = element;
      select3.appendChild(el);
    });
  }
}

const updateStrikes3 = () => {
  const typeInput = document.getElementById('type').value;
  var strikeInput = document.getElementById('strike').value;
  var strikeInput2 = document.getElementById('strike2').value;
  var strikeInput3 = document.getElementById('strike3').value;
  var select4 = document.getElementById("strike4");
  select4.options.length = 0;
  document.getElementById("arrow1").style.display = "none";
  document.getElementById("arrow2").style.display = "none";
  document.getElementById("arrow3").style.display = "none";


  if (typeInput === 'IRONCONDOR') {
    if (Number(strikeInput3) <= Number(strikeInput2)) {
      alert("Short call strike must be greater than short put strike");
      document.getElementById("arrow3").style.display = "inline";
      return;
    }
    var res = (Number(strikeInput2) * 1000 - Number(strikeInput) * 1000 + Number(strikeInput3) * 1000) / 1000;
    var el = document.createElement("option");
    el.textContent = res + "";
    el.value = res + "";
    select4.appendChild(el);
  }
}

const updateInfoLink = () => {
  const typeInput = document.getElementById('type').value;
  var info = document.getElementById('info');

  switch (typeInput) {
    case "CALL":
      info.innerHTML = "More info on calls"
      info.href = "https://www.investopedia.com/terms/c/calloption.asp"
      break;
    case "PUT":
      info.innerHTML = "More info on puts"
      info.href = "https://www.investopedia.com/terms/p/putoption.asp"
      break;
    case "STRADDLE":
      info.innerHTML = "More info on straddles"
      info.href = "https://www.investopedia.com/terms/s/straddle.asp"
      break;
    case "STRANGLE":
      info.innerHTML = "More info on strangles"
      info.href = "https://www.investopedia.com/terms/s/strangle.asp"
      break;
    case "BUTTERFLY":
      info.innerHTML = "More info on butterflies"
      info.href = "https://www.investopedia.com/terms/b/butterflyspread.asp"
      break;
    case "IRONCONDOR":
      info.innerHTML = "More info on iron condors"
      info.href = "https://www.investopedia.com/terms/i/ironcondor.asp"
      break;
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










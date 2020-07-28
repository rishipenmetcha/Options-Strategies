
const getData = () => {

  const tickerInput = document.getElementById('ticker').value;
  const strikeInput = document.getElementById('strike').value;
  const typeInput = document.getElementById('type').value;
  const expiryInput = document.getElementById('ttExp').value;

  if(!(tickerInput && strikeInput && typeInput && expiryInput)) {
    alert("Please fill out all inputs!")
    return;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./processrequest", true);

  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      document.getElementById("out").innerHTML = "The price of the option is: " + xhttp.responseText;
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

const getDates = () => {

  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "./getdates", true);

  xhttp.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
      // Typical action to be performed when the document is ready:
      console.log("Got the dates, they should be on the next line");
      var listDates = JSON.parse(xhttp.responseText);

      var select = document.getElementById("ttExp"); 
      select.options.length = 0

      for(var i = 0; i < listDates.length; i++) {
        var opt = listDates[i];
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
      console.log("Got the dates, they should be on the next line");
      var listStrikePrices = JSON.parse(xhttp.responseText);

      var select = document.getElementById("strike"); 
      select.options.length = 0

      for(var i = 0; i < listStrikePrices.length; i++) {
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
  const expiryInput = document.getElementById('ttExp').value;

  const response = {
    ticker: tickerInput,
    strikePrice: strikeInput,
    type: typeInput,
    ttExp: expiryInput
  }

  xhttp.send(JSON.stringify(response));
}










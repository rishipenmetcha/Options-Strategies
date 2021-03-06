const drawGraph = (optionPrice, strikeString, type) => {
    optionPrice = Number(optionPrice);
    var strike;

    // For butterfly it is not actually call and put but wanted to reuse the same
    // logic.
    if (type === "STRANGLE") {
        strike = {};
        strike.call = Number(strikeString.call);
        strike.put = Number(strikeString.put);
    } else if (type === "BUTTERFLY") {
        strike = {};
        strike.call = Number(strikeString.highcall);
        strike.put = Number(strikeString.lowcall);
        strike.short = Number(strikeString.shortcall);
    } else if (type === "IRONCONDOR") {
        strike = {};
        strike.lowput = Number(strikeString.lowput);
        strike.shortput = Number(strikeString.shortput);
        strike.shortcall = Number(strikeString.shortcall);
        strike.highcall = Number(strikeString.highcall);
    } else {
        strike = Number(strikeString);
    }

    const yticks = getYTicks(optionPrice, strike, type);
    const ylow = yticks[0];
    const yhigh = yticks[yticks.length - 1];

    const xticks = getXTicks(strike, optionPrice, type);
    const xlow = xticks[0];
    const xhigh = xticks[xticks.length - 1];

    const dataPoints = getDataPoints(strike, xlow, xhigh, ylow, yhigh, optionPrice, type);

    var padding = {
        top: 15,
        right: 20,
        bottom: 20,
        left: 30
    };

    // removes 15 pixel buffer at the top if the two edge data points in a strangle are greater than yhigh. 
    // This will cut off the top tick but it gets the full area shaded green.   
    if (type === 'STRANGLE') {
        if (dataPoints[0].y > yhigh || dataPoints[3].y > yhigh) {
            padding = {
                top: 0,
                right: 20,
                bottom: 20,
                left: 30
            };
        }
    }

    new Chartist.Line('.ct-chart', {
        series: [dataPoints]
    }, {
        axisX: {
            type: Chartist.FixedScaleAxis,
            ticks: xticks,
            high: xhigh,
            low: xlow,
            axisOffset: 50
        },
        axisY: {
            type: Chartist.FixedScaleAxis,
            ticks: yticks,
            high: yhigh,
            low: ylow
        },
        width: '900px',
        height: '550px',
        chartPadding: padding,
        lineSmooth: Chartist.Interpolation.none(),
        showPoint: false,
        showArea: true,
        plugins: [
            Chartist.plugins.ctThreshold({
                threshold: 0,
            }),
            Chartist.plugins.ctAxisTitle({
                axisX: {
                    axisTitle: "Stock Price($)",
                    axisClass: "ct-axis-title",
                    offset: {
                        x: 0,
                        y: 40
                    },
                    textAnchor: "middle"
                },
                axisY: {
                    axisTitle: "Profit/Loss($)",
                    axisClass: "ct-axis-title",
                    offset: {
                        x: 0,
                        y: 20
                    },
                    flipTitle: true
                }
            })
        ]
    });
}

const getYTicks = (optionPrice, strike, type) => {
    rangeExact = optionPrice * 3;
    if (type === "BUTTERFLY") {
        rangeExact = ((strike.short - strike.put) - optionPrice) * 1.5;
        if (optionPrice * 1.5 > rangeExact) {
            rangeExact = optionPrice * 1.5;
        }
    } else if (type === "IRONCONDOR") {
        rangeExact = -optionPrice * 1.5;
        if ((strike.shortput - strike.lowput + optionPrice) * 1.5 > rangeExact) {
            rangeExact = (strike.shortput - strike.lowput + optionPrice) * 1.5;
        }
    }
    var tickSize = getYTickSize(rangeExact);
    const realRange = round(rangeExact, tickSize);
    var curr = -realRange;
    var res = [];
    while (curr <= realRange) {
        res.push(curr);
        curr = (curr * 1000 + tickSize * 1000) / 1000;
    }
    return res;
}

const getXTicks = (central, optionPrice, type) => {
    var exactTick;
    if (type === "STRANGLE" || type === "BUTTERFLY") {
        exactTick = ((optionPrice * 6) + (central.call - central.put)) / 20;
    } else if (type === "IRONCONDOR") {
        exactTick = ((central.highcall - central.lowput) * 1.5) / 20;
    } else {
        exactTick = ((optionPrice * 6) / 20);
    }
    var realTick = getXTickSize(exactTick);
    var start;
    if (type === "STRANGLE" || type === "BUTTERFLY") {
        start = floor(central.put - (3 * optionPrice), realTick);
    } else if (type === "IRONCONDOR") {
        var tempStart = ((central.shortcall + central.shortput) / 2) - (((central.highcall - central.lowput) * 1.5) / 2);
        start = floor(tempStart, realTick);
    } else {
        start = floor(central - (3 * optionPrice), realTick);
    }

    var unadjustedStart = start;
    if (start < 0) {
        start = 0;
        if (type === "STRANGLE" || type === "BUTTERFLY") {
            realTick = getXTickSize((central.call + (optionPrice * 3)) / 20);
        } else if (type === "IRONCONDOR") {
            realTick = getXTickSize((((central.shortcall + central.shortput) / 2) + (((central.highcall - central.lowput) * 1.5) / 2)) / 20);
        } else {
            realTick = getXTickSize((central + (optionPrice * 3)) / 20);
        }
    }
    var curr = start;
    if (curr.toString().length >= 6) {
        if (type === "STRANGLE" || type === "BUTTERFLY") {
            exactTick = ((optionPrice * 6) + (central.call - central.put)) / 13;
        } else if (type === "IRONCONDOR") {
            exactTick = ((central.highcall - central.lowput) * 1.5) / 13;
        } else {
            exactTick = ((optionPrice * 6) / 13);
        }
        realTick = getXTickSize(exactTick);
        if (type === "STRANGLE" || type === "BUTTERFLY") {
            start = floor(central.put - (3 * optionPrice), realTick);
        } else if (type === "IRONCONDOR") {
            var tempStart = ((central.shortcall + central.shortput) / 2) - (((central.highcall - central.lowput) * 1.5) / 2);
            start = floor(tempStart, realTick);
        } else {
            start = floor(central - (3 * optionPrice), realTick);
        }
        var unadjustedStart = start;
    }
    var res = [];
    var max;
    if (type === "STRANGLE" || type === "BUTTERFLY") {
        max = ceiling(central.call + (optionPrice * 3), realTick);
    } else if (type === "IRONCONDOR") {
        max = ceiling(((central.shortcall + central.shortput) / 2) + (((central.highcall - central.lowput) * 1.5) / 2), realTick);
    } else {
        max = ceiling(central + optionPrice * 3, realTick);
    }
    while (curr <= max) {
        res.push(curr);
        curr = (curr * 1000000 + realTick * 1000000) / 1000000;
    }
    return res;
}


const round = (num, roundVal) => {
    const quotientRounded = Math.round(num / roundVal);
    const res = ((quotientRounded * 100) * (roundVal * 100)) / 10000;
    return res;
}

const floor = (num, roundVal) => {
    const floored = Math.floor(num / roundVal);
    const res = ((floored * 100) * (roundVal * 100)) / 10000;
    return res;
}

const ceiling = (num, roundVal) => {
    const ceiled = Math.ceil(num / roundVal);
    const res = ((ceiled * 100) * (roundVal * 100)) / 10000;
    return res;
}



const getYTickSize = (rangeExact) => {
    if (rangeExact <= 0.1) {
        tickSize = 0.01;
    } else if (rangeExact <= 0.25) {
        tickSize = 0.025;
    } else if (rangeExact <= 0.5) {
        tickSize = 0.05
    } else if (rangeExact <= 1) {
        tickSize = 0.1;
    } else if (rangeExact <= 2) {
        tickSize = 0.2
    } else if (rangeExact <= 2.5) {
        tickSize = 0.25;
    } else if (rangeExact <= 5) {
        tickSize = 0.5
    } else if (rangeExact <= 10) {
        tickSize = 1;
    } else if (rangeExact <= 20) {
        tickSize = 2;
    } else if (rangeExact <= 25) {
        tickSize = 2.5;
    } else if (rangeExact <= 50) {
        tickSize = 5;
    } else if (rangeExact <= 100) {
        tickSize = 10;
    } else if (rangeExact <= 150) {
        tickSize = 15;
    } else if (rangeExact <= 200) {
        tickSize = 20;
    } else if (rangeExact <= 250) {
        tickSize = 25;
    } else if (rangeExact <= 500) {
        tickSize = 50;
    } else if (rangeExact <= 1000) {
        tickSize = 100;
    } else if (rangeExact <= 2000) {
        tickSize = 200;
    } else if (rangeExact <= 2500) {
        tickSize = 250;
    } else {
        tickSize = 500;
    }
    return tickSize;
}

const getXTickSize = (exactTick) => {
    var tickSize;
    if (exactTick <= 0.01) {
        tickSize = 0.01;
    } else if (exactTick <= 0.02) {
        tickSize = 0.02;
    } else if (exactTick <= 0.05) {
        tickSize = 0.05
    } else if (exactTick <= 0.1) {
        tickSize = 0.1;
    } else if (exactTick <= 0.15) {
        tickSize = 0.15;
    } else if (exactTick <= 0.2) {
        tickSize = 0.2;
    } else if (exactTick <= 0.25) {
        tickSize = 0.25
    } else if (exactTick <= 0.5) {
        tickSize = 0.5;
    } else if (exactTick <= 1) {
        tickSize = 1;
    } else if (exactTick <= 2) {
        tickSize = 2;
    } else if (exactTick <= 4) {
        tickSize = 4;
    } else if (exactTick <= 5) {
        tickSize = 5;
    } else if (exactTick <= 10) {
        tickSize = 10;
    } else if (exactTick <= 15) {
        tickSize = 15;
    } else if (exactTick <= 20) {
        tickSize = 20;
    } else if (exactTick <= 25) {
        tickSize = 25;
    } else if (exactTick <= 50) {
        tickSize = 50;
    } else if (exactTick <= 100) {
        tickSize = 100;
    } else if (exactTick <= 200) {
        tickSize = 200;
    } else if (exactTick <= 250) {
        tickSize = 250;
    } else if (exactTick <= 500) {
        tickSize = 500;
    } else if (exactTick <= 1000) {
        tickSize = 1000;
    } else {
        tickSize = 5000;
    }
    return tickSize;
}

const getDataPoints = (strike, xlow, xhigh, ylow, yhigh, optionPrice, type) => {
    var res = [];
    if (type === 'CALL') {
        res = [
            { x: xlow, y: -optionPrice },
            { x: strike, y: -optionPrice },
            { x: xhigh, y: ((-optionPrice) + (xhigh - strike)) },
        ];
    } else if (type === 'PUT') {
        res = [
            { x: xlow, y: ((-optionPrice) + (strike - xlow)) },
            { x: strike, y: -optionPrice },
            { x: xhigh, y: -optionPrice },
        ]
    } else if (type === 'STRADDLE') {
        res = [
            { x: xhigh, y: -optionPrice + (xhigh - strike) },
            { x: strike, y: -optionPrice },
            { x: xlow, y: -optionPrice + (strike - xlow) },
        ]
    } else if (type === 'STRANGLE') {
        var edgeMin = -optionPrice + (strike.put - xlow);
        var edgeMax = -optionPrice + (xhigh - strike.call)
        res = [
            { x: xlow, y: edgeMin },
            { x: strike.put, y: -optionPrice },
            { x: strike.call, y: -optionPrice },
            { x: xhigh, y: edgeMax }
        ]
    } else if (type === 'BUTTERFLY') {
        res = [
            { x: xlow, y: -optionPrice },
            { x: strike.put, y: -optionPrice },
            { x: strike.short, y: (strike.short - strike.put) - optionPrice },
            { x: strike.call, y: -optionPrice },
            { x: xhigh, y: -optionPrice }
        ]
    } else if (type === 'IRONCONDOR') {
        var loss = -optionPrice - (strike.shortput - strike.lowput);
        if (loss >= 0) {
            alert('Please pick a new combination of strike, prices are not up to date.');
            return;
        }
        res = [
            { x: xlow, y: loss },
            { x: strike.lowput, y: loss },
            { x: strike.shortput, y: -optionPrice },
            { x: strike.shortcall, y: -optionPrice },
            { x: strike.highcall, y: loss },
            { x: xhigh, y: loss }
        ]
    }
    return res;
}



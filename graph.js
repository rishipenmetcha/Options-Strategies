const drawGraph = (optionPrice, strikeString, type) => {
    const strike = parseInt(strikeString);
    const yticks = getYTicks(optionPrice);
    const ylow = yticks[0];
    const yhigh = yticks[yticks.length - 1];

    const xticks = getXTicks(strike, optionPrice);
    const xlow = xticks[0];
    const xhigh = xticks[xticks.length - 1];

    const dataPoints = getDataPoints(strike, xlow, xhigh, optionPrice, type);

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
        chartPadding: {
            top: 15,
            right: 15,
            bottom: 20,
            left: 30
        },
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

const getYTicks = (optionPrice) => {
    rangeExact = optionPrice * 3;
    var tickSize = getYTickSize(rangeExact);
    console.log(tickSize);
    console.log("range exact is " + rangeExact);
    const realRange = round(rangeExact, tickSize);
    console.log(realRange);
    var curr = -realRange;
    var res = [];
    while (curr <= realRange) {
        res.push(curr);
        curr = (curr * 100 + tickSize * 100) / 100;
    }
    console.log(res);
    return res;
}

const getXTicks = (central, optionPrice) => {
    const exactTick = ((optionPrice * 6) / 20);
    var realTick = getXTickSize(exactTick);
    var start = round(central - (3 * optionPrice), realTick);
    const unadjustedStart = start;
    if (start < 0) {
        start = 0;
        realTick = getXTickSize((central + (optionPrice * 3)) / 20);
    }
    var curr = start;
    var res = [];
    while (curr <= ((central - unadjustedStart) + central)) {
        res.push(curr);
        curr = (curr * 100 + realTick * 100) / 100;
    }
    return res;
}


const round = (num, roundVal) => {
    const quotientRounded = Math.round(num / roundVal);
    const res = (quotientRounded * roundVal * 100) / 100;
    console.log(res);
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

const getDataPoints = (strike, xlow, xhigh, optionPrice, type) => {
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
    }
    return res;
}



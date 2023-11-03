const path = document.getElementById('graph')
const PATH_WIDTH = 400
const PATH_HEIGHT = 400
const signals = []
const SIGNAL_MAX = 1
let lastTime = undefined
const MAX_TIME = 6000
const x = (time) => time * PATH_WIDTH / MAX_TIME
const y = (signal) => Math.abs(signal - SIGNAL_MAX) * PATH_HEIGHT / SIGNAL_MAX


function addSignal(signal) {
    const currentTime = Date.now()
    const deltaTime = lastTime != undefined ? currentTime - lastTime : 0
    lastTime = currentTime
    // signals.push({signal: signal, deltaTime: deltaTime})

    signals.push({ signal: signal, time: signals.length ? deltaTime + signals[signals.length - 1].time : 0 })

    while (signals[signals.length - 1].time > MAX_TIME) {
        signals.shift()
        const timeDif = signals[0].time
        signals.forEach((signal) => {
            signal.time -= timeDif
        })
    }
    console.log(signals);
    drawGraph()
}

function drawGraph() {
    path.setAttribute('d', (signals.length) ? `M ${signals.map((signal) => `${x(signal.time)} ${y(signal.signal)}`).join(' L ')}`: '')
}
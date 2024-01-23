const path = document.getElementById('graph')
const pathFFT = document.getElementById('graphFFT')
const svgFFT = document.getElementById('svgFFT')
const svgSignal = document.getElementById('signal')
const pulseContainer = document.getElementById('pulse')

const debugButton = document.getElementById('debug__button')
debugButton.addEventListener('click', () => {
    console.log(JSON.stringify(signals))
})

const PATH_WIDTH = 400
const PATH_HEIGHT = 400
const signals = []

const SIGNAL_MAX = 1

const FFT_COUNT = 15000
//МС
const PERIOD_TIME = 50
const MAX_TIME = 10000

// N - следующая степень двойки после MAX_TIME


// КОЛ-ВО КОЛЕБАНИЙ В СЕКУНДУ 

// const MIN_FREQUENCY = 20 / 60
// const MAX_FREQUENCY = 120 / 60
const input = []
const output = []



// Pulse
let pulses = []
// 




// 1. Изменить функцию сглаживания 
// 2. Потестить FFT, сделать так, чтобы оно нормально работало и выводило пики
// 4. Нормально оформить графики


// const SMOOTH_SIGNAL = 5
// Подготовили input массив для fft (содержит в себе значения в каждой миллисекунде от 0 до 16384) Ступенчатая функция
// signal (time value)
function makeInput(signals, N) {
    const input = new Array(N * 2) //n * 2 = количество сигналов 

    for (let i = 0; i < signals.length; i++) {
        input[i] = signals[i]
    }

    for (let i = signals.length; i < N * 2; i++) {
        input[i] = 0
    }

    return input//.map((_, index, arr) => {
    //const array = arr.slice(Math.max(index - smoothing_window, 0), index + smoothing_window + 1)

    //return array.reduce((prev, curr) => prev + curr, 0) / array.length})
    //[v1, v2, ..., v16384] --> index = time (period = 1ms)
}

function smoothSignal(signals, smoothing_window) {
    return signals.map((_, index, arr) => {
        const array = arr.slice(Math.max(index - smoothing_window, 0), index + smoothing_window + 1)
        return array.reduce((prev, curr) => prev + curr, 0) / array.length
    })
}

function getFrequencyGraph(FFToutput, N, length) // пики
{
    const frequencyGraph = new Array(N)


    const period = config.resampling ? PERIOD_TIME / config.resampling_rate : PERIOD_TIME


    //n = 200
    //100 1000 1024 2048
    for (let i = 0; i < N; i++) {
        //Почему такая формула? 
        //Это интенсивность (на сколько высоко пика)
        frequencyGraph[i] = {
            intensity: (Math.pow(FFToutput[2 * i], 2) + Math.pow(FFToutput[2 * i + 1], 2)) / Math.pow(length, 2), // 
            frequency: i / (2 * N * (period / 1000))
            //0.001 - период между значениями в графике
            //количество ударов в секунду  (частота)
        }
    }
    return frequencyGraph //возвращаем массив объектов
}


// i/(2 * N)

// Получаем частоту
function getFrequency(signals) {
    //FFT нужно вызывать от степени двойки
    const N = Math.pow(2, Math.ceil(Math.log2(FFT_COUNT)))

    const fft = new FFTJS(N * 2)

    const output = fft.createComplexArray(N * 2)

    // output.length = N * 2 * 2

    const input = makeInput(signals, N) //массив сигналов 

    fft.realTransform(output, input) //output = преобразование фурье массив фиг знает чего, который в 2 раза чем массив сигналов (из-за комплексной части)
    //в output лежит результат преобразования фурье ()
    // console.log(output)



    const frequencyGraph = getFrequencyGraph(output, N, signals.length)

    return frequencyGraph

}

const signalQueue = []

//частота - количество ударов в секунду
//чсс - количество ударов в минуту
async function addSignal(signal, uuid) {
    await waitForCondition(() => signalQueue[0] == uuid)
    signalQueue.shift()
    signals.push(signal)
    while ((signals.length - 1) * PERIOD_TIME > MAX_TIME) {
        //Убрать 1ый сигнал
        signals.shift()
    }
    let processedSignals = signals
    processedSignals = normalizeSignal(deleteTrend(processedSignals))
    processedSignals = centralize(processedSignals)
    const minSignal = Math.min(...processedSignals)
    const maxSignal = Math.max(...processedSignals)
    if (config.resampling) processedSignals = resampling(processedSignals)
    if (config.smoothing) processedSignals = smoothSignal(processedSignals, config.smoothing_window)

    drawGraph(processedSignals, 0, MAX_TIME, minSignal, maxSignal)


    const min_frequency = config.min_frequency / 60  //Герцы 1/с
    const max_frequency = config.max_frequency / 60


    // frequencyGraph = [(f, i), (f, i), ..., (f, i)]

    const frequencyGraph = getFrequency(processedSignals)
        .filter((value) => value.frequency >= min_frequency && value.frequency <= max_frequency)

        //todo: убрать 1ю пику самую высокую
    const pulse = frequencyGraph[frequencyGraph.reduce((prev, cur, curIndex, self) => self[prev].intensity > cur.intensity ? prev : curIndex, 0)].frequency * 60 // пульс

    pulses = [...pulses, pulse].slice(-config.pulse_window)

    pulseContainer.textContent = "heart rate: " + (pulses.reduce((prev, curr) => prev + curr, 0) / pulses.length).toFixed(0) //toFixed - количет сво знаков после запятой 
    // console.log(frequencyGraph)
    drawFFTGraph(
        frequencyGraph,
        min_frequency,
        max_frequency,
        0, //MIN INTENSITY
        // Высчитываем максимальную intensity только при freq от minFrequency по maxFrequency
        Math.max(...frequencyGraph
            .map((value) => value.intensity))
    )


    function normalizeSignal(signals) {
        const minSignal = Math.min(...signals)
        const maxSignal = Math.max(...signals)
        return signals.map((signal) => (signal - minSignal) / (maxSignal - minSignal))
    }
    // test 


    // const f = (x) => 150*Math.sin((Math.PI/250)*x)
    // const time = 15000
    // const testSignals = test(time, f)
    // console.log(testSignals)
    // drawGraph(testSignals,0 , time, -300, 300)
    // const frequencyGraph = getFrequency(testSignals, time).filter((value) => value.frequency >= MIN_FREQUENCY && value.frequency <= MAX_FREQUENCY)
    // drawFFTGraph(frequencyGraph, MIN_FREQUENCY, MAX_FREQUENCY, 0, Math.max(...frequencyGraph.map((value) => value.intensity)))
}
// 

function drawGraph(signals, minTime, maxTime, minSignal, maxSignal) {
    const height = maxSignal - minSignal
    const width = maxTime - minTime
    if (height == 0 || width == 0) {
        return;
    }
    const period = config.resampling ? PERIOD_TIME / config.resampling_rate : PERIOD_TIME
    const size = Math.max(height, width)
    // Преобразовали систему координат 
    const y = (y) => size - (((y - minSignal) / height) * size)
    const x = (x) => ((x - minTime) / width) * size
    // Размер окна 
    svgSignal.setAttribute('viewBox', `0 0 ${size} ${size}`)
    path.setAttribute('stroke-width', size * 0.005)
    path.setAttribute('d', (signals.length) ? `M ${signals.map((signal, index) => `${x(index * period)} ${y(signal)}`).join(' L ')}` : '')
}

// frequencyGraph = интенсивность частот
function drawFFTGraph(frequencyGraph, minFrequency, maxFrequency, minIntensity, maxIntensity) { //M 1 2 L 5 6
    //viewBox="0 -4096 8192 8192"
    const height = maxIntensity - minIntensity
    const width = maxFrequency - minFrequency
    if (height == 0 || width == 0) {
        return;
    }
    const size = Math.max(height, width)
    const y = (y) => size - (((y - minIntensity) / height) * size)
    const x = (x) => ((x - minFrequency) / width) * size
    if (maxIntensity == 0) {
        console.log('AAAAAAAAA')
    }

    // Размер окна 
    if (frequencyGraph.length)
        svgFFT.setAttribute('viewBox', `0 0 ${size} ${size}`)
    pathFFT.setAttribute('stroke-width', size * 0.005)
    pathFFT.setAttribute('d', (frequencyGraph.length) ? `M ${frequencyGraph
        .map((v) => `${x(v.frequency)} ${y(v.intensity)}`).join(" L ")}` : '')

}
// M ['10 15' , '14 13' L ... ' '] -> M P1 L P2 L ... PN L PN+1





function test(time, func) {
    const signals = []
    for (let i = 0; i < time; i += PERIOD_TIME) {
        signals.push(func(i)) //- x
    }
    return signals
}


/** 
 * функция ожидания выполнения условия
 * 
 * @param {() => boolean} condition функция, которая возвращает условие
 */

async function waitForCondition(condition) {
    // Разрешатель promise
    const poll = resolve => {
        if (condition()) {
            resolve()
        } else {
            setTimeout(_ => poll(resolve), 10)
        }
    }
    return new Promise(poll);
}

//разобраться
function resampling(signals) {
    const linearInterpolate = (x1, x2, y1, y2, x) => {
        const slope = (y2 - y1) / (x2 - x1)
        return y1 + slope * (x - x1)
    }
    return signals.map((y, i, self) => {
        if (i == self.length - 1) return [y]
        const x1 = i * PERIOD_TIME
        const y1 = y
        const x2 = (i + 1) * PERIOD_TIME
        const y2 = self[i + 1]
        return Array.from(Array(config.resampling_rate)).map((_, i) => linearInterpolate(x1, x2, y1, y2, x1 + i * (PERIOD_TIME / config.resampling_rate)))
    }).flat(1)
}


function deleteTrend(signals){
    const period = config.resampling ? PERIOD_TIME / config.resampling_rate : PERIOD_TIME
    const trend = smoothSignal(signals, Math.round(1000 / period))
    return signals.map((v, i) => v - trend[i])
}

function centralize(signals){
    const m = signals.reduce((p, c) => p+c, 0) / signals.length
    return signals.map(v => v - m)
  }
  
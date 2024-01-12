const path = document.getElementById('graph')
const pathFFT = document.getElementById('graphFFT')
const svgFFT = document.getElementById('svgFFT')
const svgSignal = document.getElementById('signal')

const PATH_WIDTH = 400
const PATH_HEIGHT = 400
const signals = []

const SIGNAL_MAX = 1
let lastTime = undefined
const MAX_TIME = 20000

// N - следующая степень двойки после MAX_TIME


const x = (time) => time * PATH_WIDTH / MAX_TIME
const y = (signal) => Math.abs(signal - SIGNAL_MAX) * PATH_HEIGHT / SIGNAL_MAX

const input = []
const output = []

// Подготовили input массив для fft (содержит в себе значения в каждой миллисекунде от 0 до 16384) Ступенчатая функция
// signal (time value)
function makeInput(signals, N) {
    const input = new Array(N * 2) //n * 2 = количество сигналов 

    for (let i = 0; i < signals.length - 1; i++) {
        const currentSignal = signals[i]
        const currentTime = currentSignal.time
        const nextSignal = signals[i + 1]
        const nextTime = nextSignal.time
        for (let j = currentTime; j < nextTime; j++) {
            input[j] = currentSignal.signal
        }
    }

    for (let i = signals[signals.length - 1].time; i < N * 2; i++) {
        input[i] = 0
    }

//Сглаженная ступенчатая функция
    return input.map((_, index, arr) => {
        const array = arr.slice(Math.max(index - 100, 0), index + 101)
        
        return array.reduce((prev, curr) => prev + curr, 0) / array.length
    })


    //[v1, v2, ..., v16384] --> index = time (period = 1ms)
}

function getFrequencyGraph(FFToutput, N) // пики
{
    const frequencyGraph = new Array(N)


    //n = 200
    //100 1000 1024 2048
    for (let i = 0; i < N; i++) {
        //Почему такая формула? А вот хер знает...)
        //Это интенсивность (на сколько высоко пика)
        //
        frequencyGraph[i] = {
            intensity: (Math.pow(FFToutput[2 * i], 2) + Math.pow(FFToutput[2 * i + 1], 2)) / Math.pow(MAX_TIME, 2), // 
            frequency: i / (2 * N * 0.001)
        }
    }
    return frequencyGraph //возвращаем массив объектов
}

// Получаем частоту
function getFrequency(signals, MAX_TIME) {
    //FFT нужно вызывать от степени двойки
    const N = Math.pow(2, Math.ceil(Math.log2(MAX_TIME)))

    const fft = new FFTJS(N * 2)

    const output = fft.createComplexArray(N * 2)

    // output.length = N * 2 * 2

    const input = makeInput(signals, N) //массив сигналов 

    fft.realTransform(output, input) //output = преобразование фурье массив хуй знает чего, который в 2 раза чем массив сигналов (из-за комплексной части)
    //в output лежит результат преобразования фурье ()
    // console.log(output)



    const frequencyGraph = getFrequencyGraph(output, N)

    return frequencyGraph

}

function addSignal(signal) {
    const currentTime = Date.now()
    const deltaTime = lastTime != undefined ? currentTime - lastTime : 0
    console.log(deltaTime)
    lastTime = currentTime
    // signals.push({signal: signal, deltaTime: deltaTime})

    signals.push({
        signal: signal, // -y
        time: signals.length ? deltaTime + signals[signals.length - 1].time : 0
    }) //- x

    while (signals[signals.length - 1].time > MAX_TIME) {
        signals.shift()
        const timeDif = signals[0].time
        signals.forEach((signal) => {
            signal.time -= timeDif
        })
    }
    
    // console.log(signals);
    drawGraph(signals,  0, MAX_TIME, 0, 1)


    
    // frequencyGraph = [(f, i), (f, i), ..., (f, i)]
    const minFrequency = 60
    const maxFrequency = 140
    const frequencyGraph = getFrequency(signals, MAX_TIME)
    .filter((value) => value.frequency >= minFrequency && value.frequency <= maxFrequency)
    // .map((_, index, arr) => {
    //    // Сглаживание графика интенсивности (возможно не нужен здесь, но пригодится для сглаживания ступенчитой функции исходного сигнала)
    //     const array = arr.slice(Math.max(index - 3, 0), index + 4).map((value) => value.intensity)
        
    //     return {
    //         frequency: arr[index].frequency,
    //         intensity: array.reduce((prev, curr) => prev + curr, 0) / array.length
    //     }
    // })
    console.log(frequencyGraph)
    drawFFTGraph(
        frequencyGraph, 
        minFrequency, 
        maxFrequency, 
        0, 
        // Высчитываем максимальную intensity только при freq от minFrequency по maxFrequency
        Math.max(...frequencyGraph
            .map((value) => value.intensity))
    )
   


    // test
    // const f = (x) => 150*Math.sin((Math.PI/100)*x) + 100*Math.sin((Math.PI/50)*x) + 50*Math.sin((Math.PI/1000)*x)
    // const time = 1000
    // const testSignals = test(time, f)
    // console.log(testSignals)
    // drawGraph(testSignals, -300, 300, time)
    
    // drawFFTGraph(getFrequency(testSignals, time))
}


function drawGraph(signals, minTime, maxTime, minSignal, maxSignal) {
    const height = maxSignal - minSignal
    const width = maxTime - minTime
    const size = Math.max(height, width) 
    // Преобразовали систему координат 
    const y = (y) => size - (((y - minSignal) / height) * size )
    const x = (x) => ((x - minTime) / width ) * size
    // Размер окна 
    svgSignal.setAttribute('viewBox', `0 0 ${size} ${size}`)
    path.setAttribute('stroke-width', size*0.005)
    path.setAttribute('d', (signals.length) ? `M ${signals.map((signal) => `${x(signal.time)} ${y(signal.signal)}`).join(' L ')}` : '')
}

// frequencyGraph = интенсивность частот
function drawFFTGraph(frequencyGraph, minFrequency, maxFrequency, minIntensity, maxIntensity) { //M 1 2 L 5 6
    //viewBox="0 -4096 8192 8192"
    const height = maxIntensity - minIntensity
    const width = maxFrequency - minFrequency
    const size = Math.max(height, width) 
    const y = (y) => size - (((y - minIntensity) / height) * size )
    const x = (x) => ((x - minFrequency) / width ) * size
    if (maxIntensity == 0){
        console.log('AAAAAAAAA')
    }

    // Размер окна 
    svgFFT.setAttribute('viewBox', `0 0 ${size} ${size}`)
    pathFFT.setAttribute('stroke-width', size*0.005)
    pathFFT.setAttribute('d', `M ${frequencyGraph
        .map((v) => `${x(v.frequency)} ${y(v.intensity)}`).join(" L ")}`)

}
// M ['10 15' , '14 13' L ... ' '] -> M P1 L P2 L ... PN L PN+1





// function test(time, func) {
//     const signals = []
//     for (let i = 0; i < time; i++) {
//         signals.push({
//             signal: func(i), 
//             time: i
//         }) //- x
//     }
//    return signals
// }



















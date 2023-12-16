const path = document.getElementById('graph')
const pathFFT = document.getElementById('graphFFT')
const svgFFT = document.getElementById('svgFFT')
const PATH_WIDTH = 400
const PATH_HEIGHT = 400
const signals = []
const SIGNAL_MAX = 1
let lastTime = undefined
const MAX_TIME = 15000

// N - следующая степень двойки после MAX_TIME
const N = Math.pow(2, Math.ceil(Math.log2(MAX_TIME)))

const x = (time) => time * PATH_WIDTH / MAX_TIME
const y = (signal) => Math.abs(signal - SIGNAL_MAX) * PATH_HEIGHT / SIGNAL_MAX

const input = []
const output = []

// Подготовили input массив для fft (содержит в себе значения в каждой миллисекунде от 0 до 16384) Ступенчатая функция
function makeInput() {
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


    return input


    //[v1, v2, ..., v16384] --> index = time (period = 1ms)
}

function getFrequencyGraph(FFToutput) // пики
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
function getFrequency() {
    //FFT нужно вызывать от степени двойки
    const fft = new FFTJS(N * 2)

    const output = fft.createComplexArray(N * 2)

    // output.length = N * 2 * 2
    const input = makeInput() //массив сигналов 

    fft.realTransform(output, input) //output = преобразование фурье массив хуй знает чего, который в 2 раза чем массив сигналов (из-за комплексной части)
    //в output лежит результат преобразования фурье ()
    // console.log(output)



    const frequencyGraph = getFrequencyGraph(output)

    drawFFTGraph(frequencyGraph)

}

function addSignal(signal) {
    const currentTime = Date.now()
    const deltaTime = lastTime != undefined ? currentTime - lastTime : 0
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
    drawGraph()

    getFrequency()
}

function drawGraph() {
    path.setAttribute('d', (signals.length) ? `M ${signals.map((signal) => `${x(signal.time)} ${y(signal.signal)}`).join(' L ')}` : '')
}

function drawFFTGraph(frequencyGraph) { //M 1 2 L 5 6
    //viewBox="0 -4096 8192 8192"
    const maxFrequency = frequencyGraph[frequencyGraph.length - 1].frequency
    const maxIntensity = Math.max(...frequencyGraph.map((v) => v.intensity))
    const maxIntensityFrequency = (frequencyGraph.find((v) => v.intensity == maxIntensity)).frequency

    svgFFT.setAttribute('viewBox', `${maxIntensityFrequency - 1} ${-maxIntensity} 2 ${maxIntensity}`)
    pathFFT.setAttribute('d', `M ${frequencyGraph.map((v) => `${v.frequency} ${-v.intensity}`).join(" L ")}`)
    console.log(frequencyGraph)
    console.log(maxFrequency, maxIntensity, maxIntensityFrequency)
}
// M ['10 15' , '14 13' L ... ' '] -> M P1 L P2 L ... PN L PN+1


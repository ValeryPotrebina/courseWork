const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    //Return promiss
    navigator
        // .mediaDevices
        .getUserMedia(
            { video: {} },
            stream => video.srcObject = stream,
            error => console.error(error)
        )

    // stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    // video.srcObject = stream
}

video.addEventListener('play', () => {
    setInterval(() => {
        detectFace()
    }, PERIOD_TIME)

})




async function detectFace() {
    const imgData = getFrame()
    const detection = await faceapi.detectSingleFace(video,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
    if (!detection) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        return
    }
    const displaySize = faceapi.matchDimensions(canvas, video)
    const resizedDetection = faceapi.resizeResults(detection, displaySize)
    context.clearRect(0, 0, canvas.width, canvas.height)
    const area = getPieceOfFace(resizedDetection, canvas)
    area.forEach((p) => drawPiecesOfFace(p, canvas))

    //---------------------------
    const color = getAreaColor(imgData, area[0])
    // console.log(makeSignal(color))
    addSignal(makeSignal(color))

    //-------------------------
    faceapi.draw.drawDetections(canvas, resizedDetection)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection)
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetection)

}



function getPieceOfFace(detection, canvas) {
    const noseLine = [detection.landmarks.getNose()[1], detection.landmarks.getNose()[2]]
    const upLine = makePerpendicularLine(noseLine[0], noseLine)
    const downLine = makePerpendicularLine(noseLine[1], noseLine)
    const left_brow = [detection.landmarks.getLeftEyeBrow()[1], detection.landmarks.getLeftEyeBrow()[3]]
    const right_brow = [detection.landmarks.getRightEyeBrow()[1], detection.landmarks.getRightEyeBrow()[3]]

    //Левая щека
    const leftCheekPoints = [
        ...left_brow.map((point) => pointProjection(point, upLine)),
        ...left_brow.map((point) => pointProjection(point, downLine)).reverse()
    ]
    // pointProjection(left_brow[0], upJawLine)
    // pointProjection(left_brow[0], downJawLine)

    // pointProjection(left_brow[1], upJawLine)
    // pointProjection(left_brow[1], downJawLine)

    //Правая щека
    const rightCheekPoints = [
        ...right_brow.map((point) => pointProjection(point, upLine)),
        ...right_brow.map((point) => pointProjection(point, downLine)).reverse()
    ]

    return [leftCheekPoints, rightCheekPoints]

}

function drawPiecesOfFace(points, canvas) {
    context.beginPath()
    context.moveTo(points[points.length - 1]._x, points[points.length - 1]._y)
    points.forEach(p => context.lineTo(p._x, p._y))
    context.stroke()
}

function pointProjection(point, line) {
    //Находим вектора
    const vector = [line[1]._x - line[0]._x, line[1]._y - line[0]._y]
    const moduleVector = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
    const unitVector = [vector[0] / moduleVector, vector[1] / moduleVector]
    //Нормальный вектор - поменять местами координаты и отрицать xую
    const normalVector = [-unitVector[1], unitVector[0]]
    //Пишем 2 уравнения, чтобы найти точку пересечения векторов 
    // (point[0]._x + normalVector[0] * k2 - line[0]._x) / unitVector[0] = (point[0]._y + normalVector[1] * k2 - line[0]._y) / unitVector[1]
    // Поиск точки пересечения для 2х прямых, заданных через точку и вектор
    const k2 = (unitVector[1] * (line[0]._x - point._x) + unitVector[0] * (point._y - line[0]._y)) / (normalVector[0] * unitVector[1] - normalVector[1] * unitVector[0])
    return {
        _x: point._x + normalVector[0] * k2,
        _y: point._y + normalVector[1] * k2
    }
}

// console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: -1, _y: 0 }, { _x: 1, _y: 0 }]));
// console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: 1, _y: 0 }, { _x: 1, _y: 2 }]));
// console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: 0, _y: 0 }, { _x: 1, _y: 1 }]));


// (point[0]._x + normalVector[0] * k2 - line[0]._x) * unitVector[1]  = (point[0]._y + normalVector[1] * k2 - line[0]._y)* unitVector[0]

// point[0]._x * unitVector[1] + normalVector[0] * k2 * unitVector[1]  - line[0]._x * unitVector[1] = point[0]._y * unitVector[0] + normalVector[1] * k2 * unitVector[0] -  line[0]._y * unitVector[0]
// normalVector[0] * k2 * unitVector[1] - normalVector[1] * k2 * unitVector[0] =  line[0]._x * unitVector[1] - point[0]._x * unitVector[1] +  point[0]._y * unitVector[0] -  line[0]._y * unitVector[0]

function makePerpendicularLine(point, line) {
    //Находим вектора
    const vector = [line[1]._x - line[0]._x, line[1]._y - line[0]._y]
    const moduleVector = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
    const unitVector = [vector[0] / moduleVector, vector[1] / moduleVector]
    //Нормальный вектор - поменять местами координаты и отрицать xую
    const normalVector = [-unitVector[1], unitVector[0]]
    const secondPoint = {
        _x: point._x + normalVector[0],
        _y: point._y + normalVector[1]
    }
    return point._x < secondPoint._x ? [point, secondPoint] : [secondPoint, point]

}

function getFrame() {
    const canvasForFrame = document.createElement('canvas')
    const displaySize = faceapi.matchDimensions(canvasForFrame, video)
    const contextForFrame = canvasForFrame.getContext('2d')
    contextForFrame.drawImage(video, 0, 0, displaySize.width, displaySize.height);
    // testContext.drawImage(video, 0, 0, displaySize.width, displaySize.height);
    const PixelsOfOneFrame = contextForFrame.getImageData(0, 0, displaySize.width, displaySize.height)
    canvasForFrame.remove()
    return PixelsOfOneFrame;
}



// TODO: 1. брать кадры
// TODO: 1. Вычислять цвет (усредненный) на области
// TODO: 1. Как-то перевести 3 цвета в сигнал от 0 до 1
// TODO: 1. Строить график чсс в реальном времени 



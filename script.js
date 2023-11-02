const video = document.getElementById('video')

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
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detection = await faceapi.detectSingleFace(video,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
        if (!detection) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            return
        }
        // console.log(detection.landmarks.getJawOutline())
        const resizedDetection = faceapi.resizeResults(detection, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        getPieceOfFace(resizedDetection, canvas)
        faceapi.draw.drawDetections(canvas, resizedDetection)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection)

        // faceapi.draw.drawFaceExpressions(canvas, resizedDetection)
    }, 100)

})

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
    drawPiecesOfFace(leftCheekPoints, canvas)
    //
    // pointProjection(left_brow[0], upJawLine)
    // pointProjection(left_brow[0], downJawLine)
    
    // pointProjection(left_brow[1], upJawLine)
    // pointProjection(left_brow[1], downJawLine)

    //Правая щека
    const rightCheekPoints = [
        ...right_brow.map((point) => pointProjection(point, upLine)),
        ...right_brow.map((point) => pointProjection(point, downLine)).reverse()
    ]
    drawPiecesOfFace(rightCheekPoints, canvas)

    // pointProjection(right_brow[0], upJawLine)
    // pointProjection(right_brow[0], downJawLine)

    // pointProjection(right_brow[1], upJawLine)
    // pointProjection(right_brow[1], downJawLine)

    
    // context.beginPath()
    // context.moveTo(upJawLine[0]._x, upJawLine[0]._y)
    // context.lineTo(upJawLine[1]._x, upJawLine[1]._y)
    // context.moveTo(downJawLine[0]._x, downJawLine[0]._y)
    // context.lineTo(downJawLine[1]._x, downJawLine[1]._y)
    // context.stroke()
}

function drawPiecesOfFace(points, canvas){
    const context = canvas.getContext('2d')
    context.beginPath()
    context.moveTo(points[points.length - 1]._x, points[points.length - 1]._y)
    points.forEach(p => context.lineTo(p._x, p._y))
    // for (let i = 0; i < points.length; i ++){
    //     context.lineTo(points[i]._x, points[i]._y)
    // }
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

console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: -1, _y: 0 }, { _x: 1, _y: 0 }]));
console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: 1, _y: 0 }, { _x: 1, _y: 2 }]));
console.log(pointProjection({ _x: 0, _y: 1 }, [{ _x: 0, _y: 0 }, { _x: 1, _y: 1 }]));


// (point[0]._x + normalVector[0] * k2 - line[0]._x) * unitVector[1]  = (point[0]._y + normalVector[1] * k2 - line[0]._y)* unitVector[0]

// point[0]._x * unitVector[1] + normalVector[0] * k2 * unitVector[1]  - line[0]._x * unitVector[1] = point[0]._y * unitVector[0] + normalVector[1] * k2 * unitVector[0] -  line[0]._y * unitVector[0]
// normalVector[0] * k2 * unitVector[1] - normalVector[1] * k2 * unitVector[0] =  line[0]._x * unitVector[1] - point[0]._x * unitVector[1] +  point[0]._y * unitVector[0] -  line[0]._y * unitVector[0]

function makePerpendicularLine(point, line){
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
const testCanvas = document.getElementById('testCanvas')
// console.log(testCanvas);
const testContext = testCanvas.getContext('2d')

// testContext.fillStyle = "rgba(200, 0, 0, 0.2)"
// testContext.fillRect(10, 10, 55, 55)

// testContext.fillStyle = "rgba(0, 0, 200, 0.5)"
// testContext.fillRect(40, 40, 55, 55)

// testContext.fillStyle = "rgba(0, 200, 0, 0.6)"
// testContext.beginPath();
// testContext.arc(75, 75, 50, 0, Math.PI * 2, true); // Внешняя окружность
// testContext.moveTo(110, 75);
// testContext.arc(75, 75, 35, 0, Math.PI, false); // рот (по часовой стрелке)
// testContext.moveTo(65, 65);
// testContext.arc(60, 65, 5, 0, Math.PI * 2, true); // Левый глаз
// testContext.moveTo(95, 65);
// testContext.arc(90, 65, 5, 0, Math.PI * 2, true); // Правый глаз
// testContext.stroke();


// console.log("a");
var img = new Image()
// console.log("a");
testContext.strokeStyle = "rgb(200, 0, 0)"
img.onload = function () {
    // console.log("a");
    testContext.drawImage(img, 0, 0);
    testContext.beginPath();
    testContext.moveTo(175, 175);
    testContext.lineTo(195, 135);
    testContext.lineTo(215, 250);
    testContext.lineTo(300, 60);
    testContext.stroke();
}
img.src = "1.jpg"
img.id = "img1"
img.onclick = "changeImage()"

function changeImage()
        {
            image = document.getElementById("img1");
            console.log(2)
            image.src = "2.jpg"
            console.log(1)
        }

// for (var i = 0; i < 6; i++) {
//     for (var j = 0; j < 6; j++) {
//         testContext.fillStyle =
//         "rgba(" +
//         Math.floor(255 - 42.5 * i) +
//         "," +
//         Math.floor(255 - 42.5 * j) +
//         ",0, 0.9)";
//         testContext.fillRect(j * 50, i * 50, 50, 50);
//     }
//   }

//   for (let i = 0; i < 6; i++){
//     for (let j = 0; j < 6; j++){
//         testContext.strokeStyle = 
//         "rgb(0," +
//         Math.floor(255 - 42.5 * i) +
//         "," +
//         Math.floor(255 - 42.5 * j) + 
//         ")";
//         testContext.beginPath()
//         testContext.arc(33 + j * 50, 33 + i * 50, 30, 0, Math.PI * 2, true)
//         testContext.stroke()
    
//     }
// }

//     console.log(testContext.getImageData(0, 0, testCanvas.width / 2, testCanvas.height / 2))
  

//лаба 4 по графике
//edge = [p1, p2]
//p1 = [x, y]


function getAreaColor(imgData, area){
    // console.log(imgData);
    const color = []
    const lines = {}
    const edges = makeEdges(area.map((p) => ({
        _x: Math.round(p._x),
        _y: Math.round(p._y)
    })))
    // console.log(edges);
    edges.forEach((edge) => {
        if (edge[0]._y == edge[1]._y)
            return
        const yMinIndex = edge[0]._y < edge[1]._y ? 0 : 1 //y = kx + b -> x = ((y* - y0) - ((y0 - y1) / (x0 - x1))*x0) / ((y0 - y1) / (x0 - x1))
                                                                            // (y* - y0)* (x0 - x1))*x0 - (y0 - y1) / ()
        const x = (y) => (((y - edge[0]._y)*(edge[1]._x - edge[0]._x)) / (edge[1]._y - edge[0]._y)) + edge[0]._x
        0// y = kx + b -> x = (y - b) / k              k = (y0 - y1 / x0 - x1) , b = y0 - (y0 - y1 / x0 - x1)*x0
        for(let i = edge[yMinIndex]._y; i < edge[(yMinIndex + 1) % 2]._y; i++){
            if (!lines[i]){
                lines[i] = []
            }
            lines[i].push(Math.round(x(i)))
        }
    })
    
    for(let i in lines){
        lines[i].sort((a, b) => a - b)
        for(let j = 0; j < Math.floor(lines[i].length / 2); j++){ //цикл по парам
            for(let k = lines[i][2*j]; k < (lines[i][2*j+1] + 1); k++){
                const index = i * imgData.width + k
                color.push([imgData.data[index * 4], imgData.data[index * 4 + 1], imgData.data[index * 4 + 2]])
            }
        }
    }
    // console.log(imgData.length, imgData.width, imgData.height);
    // console.log(color);
    return color.reduce((result, current) => result.map((res, i) => res + current[i])).map((a) => Math.round(a / color.length))
}

function makeEdges(points){
    return points.map((p, i, self) => {
        if (i == self.length - 1)
            return [p, self[0]]
        return [p, self[i + 1]]
    })
}

function makeSignal(color){ //[[r, g, b], [r, g, b], [] ...] => [num, num, ..., num] => avrNum / length
    return color.map(color => (config.clr_r * color[0] + color[1] * config.clr_g + color[2] * config.clr_b) / (config.clr_r + config.clr_g + config.clr_b) / 255).reduce((prev, cur) => prev + cur, 0) / color.length
}

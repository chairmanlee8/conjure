var http = require('http'),
    fs = require('fs');

function toArray (rs) {
    var parts = rs.split(","),
        result = [];

    parts.forEach(function (part) {
        var m = part.indexOf('R');
        if (m < 0) {
            result.push(parseInt(part));
        } else {
            var a = parseInt(part.slice(0, m)),
                b = parseInt(part.slice(m+1));

            for (var i = a; i <= b; i++) {
                result.push(i);
            }
        }
    });

    return result;
}

function generateDice (id) {
    var sides = Math.floor((Math.random() * (24 - 6)) + 6),
        roll = Math.floor(Math.random() * sides + 1),
        time = (new Date()).toISOString();

    return {
        "id": id,
        "sides": sides,
        "roll": roll,
        "time": time
    }
}

var server = http.createServer(function (req, resp) {
    var parts = req.url.split("?");

    switch (parts[0]) {
        case "/":
            resp.writeHead(200, {"Content-Type": "text/html"});
            var fin = fs.createReadStream("app.html");
            fin.pipe(resp);
            break;
        case "/app.bundle.js":
            resp.writeHead(200, {"Content-Type": "text/html"});
            var fin = fs.createReadStream("app.bundle.js");
            fin.pipe(resp);
            break;
        case "/die":
        case "/dice":
            var ids = toArray(parts[1].slice(2));
            var die = ids.map(generateDice);
            resp.writeHead(200, {"Content-Type": "application/json"});
            resp.write(JSON.stringify({"result": die}));
            resp.end();
            break;
        default:
            resp.writeHead(404, {"Content-Type": "text/plain"});
            resp.write("404 Not Found\n");
            resp.end();
            break;
    }
});

server.listen(8000);

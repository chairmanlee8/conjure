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

var server = http.createServer(function (req, resp) {
    var parts = req.url.split("?");

    if (parts[0] == "/") {
        resp.writeHead(200, {"Content-Type": "text/html"});
        var fin = fs.createReadStream("app.html");
        fin.pipe(resp);
    } else if (parts[0].startsWith("/node_modules")) {
        resp.writeHead(200, {});
        var fin = fs.createReadStream("../.." + parts[0]);
        fin.pipe(resp);
    } else if (parts[0].endsWith(".js") || parts[0].endsWith(".css")) {
        resp.writeHead(200, {});
        var fin = fs.createReadStream(parts[0].slice(1));
        fin.pipe(resp);
    } else {
        resp.writeHead(404, {"Content-Type": "text/plain"});
        resp.write("404 Not Found\n");
        resp.end();
    }
});

server.listen(8000);

var static = require('node-static');
var http = require('http');
var fs = require('fs');

var PORT = 9801;
var logFilePath = './log';
var content = new static.Server('./dist', { cache: 3600 });

function WriteToLog(path, address) {
    var timestamp = new Date().toUTCString();
    var data = timestamp + "\t" + path + "\t\t\t" + address + "\n";
    fs.appendFileSync(logFilePath, data);
}

http.createServer((req, res) => {
    
    req.addListener('end', () => {
        content.serve(req, res, (e, res) => {
            if(e && (e.status==404)) {
                content.serveFile('./dist/404.html', 404, {}, req, res);
            }
            WriteToLog(req.url, req.connection.remoteAddress);
        });
    }).resume();

}).listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}.`);
    WriteToLog("", `Server running on port ${PORT}.`);
});

var static = require('node-static');
var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = 9801;
var logFilePath = './log';
var content = new static.Server('./dist', { cache: 3600 });

function WriteToLog(path, address) {
    var timestamp = new Date().toUTCString();
    var data = timestamp + "\t" + path + "\t\t\t" + address + "\n";
    fs.appendFileSync(logFilePath, data);
}

http.createServer((req, res) => {
    fs.readdir(path.join(__dirname, "dist"), (err, files) => {
        if(err) return;
        files = files.filter(file => {
            if(['.html', '.ico'].indexOf(path.extname(file)) != -1) return file;
        });
        fs.readdir(path.join(__dirname, "dist", "posts"), (err, posts) => {
            if(err) return;
            posts = posts.filter(post => {
                if(path.extname(post) == ".html") return post;
            });

            if(files.indexOf(`${req.url.split('/').pop()}.html`) != -1) req.url = req.url + '.html';
            else if(posts.indexOf(`${req.url.split('/').pop()}.html`) != -1 ) req.url = req.url + '.html';

            req.addListener('end', () => {
                content.serve(req, res, (e, response) => {
                    if(e && (e.status==404)) {
                        content.serveFile('/404.html', 404, {}, req, res);
                    }
                    WriteToLog(req.url, req.connection.remoteAddress);
                });
            }).resume();
        });
    });
}).listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}.`);
    WriteToLog("", `Server running on port ${PORT}.`);
});

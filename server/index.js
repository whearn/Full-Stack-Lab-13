// var http = require('http');
// var fs = require('fs');
// var url = require('url');
// var path = require('path');

// var clientPath = path.join(__dirname, '..', 'client');

// var server = http.createServer(function(req, res) {
//     var urlData = url.parse(req.url, true);
//     if (urlData.pathname === '/' && req.method === 'GET') {
//         //requests homepage
//         res.writeHead(200, { 'Content-Type': 'text/html'});
//         fs.createReadStream(path.join(clientPath, 'index.html')).pipe(res);
//     } else if (urlData.pathname === '/api/chirps') {
//         if (req.method === 'GET') {
//             res.writeHead(200, { 'Content-Type': 'application/json' });
//             // fs.readFile(path.join(__dirname, 'data.json'), function(err, contents) {
//             //     if (err) {
//             //         console.log(err);
//             //     } else {
//             //         var dataContent = JSON.parse(contents);
//             //         console.log(dataContent);
//             //     }
//             // });
//             fs.createReadStream(path.join(__dirname, 'data.json')).pipe(res);
//         } else if (req.method === 'POST') {
//             fs.readFile(path.join(__dirname, 'data.json'), 'utf8', function(err, data) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     //turns into an array
//                     var chirps = JSON.parse(data);
//                     var incomingData = '';
//                     req.on('data', function(chunk) {
//                         incomingData += chunk;
//                     });
//                     //all pieces of data have been received
//                     req.on('end', function() {
//                         var newChirp = JSON.parse(incomingData);
//                         chirps.push(newChirp);

//                         // Now we need to convert instructors array back to JSON
//                         // and write the JSON string back to data.json
//                         fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(instructors), function(err) {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 // everything is ok and finished
//                                 res.writeHead(201, { 'Content-Type': 'application/json' });
//                                 res.end('{}');
//                             }
//                         });
//                     });
//                 }
//             });
//         } else {

//         }
//     } else if (req.method === 'GET') {
//         //need to try to read requested file from client folder
//         var filePath = path.join(clientPath, urlData.pathname);
//         var readStream = fs.createReadStream(filePath);
//         readStream.on('error', function(e) {
//             res.writeHead(404, { 'Content-Type': 'text/plain' });
//             res.end('File Not Found');
//         });
//         var extension = path.extname(filePath);
//         var contentType;

//         switch (extension) {
//             case '.html':
//                 contentType = 'text/html';
//                 break;
//             case '.css':
//                 contentType = 'text/css';
//                 break;
//             case '.js':
//                 contentType = 'text/javascript';
//                 break;
//             default:
//                 contentType = 'text/plain';
//         }

//         res.writeHead(200, { 'Content-Type': contentType});
//         readStream.pipe(res);
//     }
// });
// server.listen(3000);


//In Class Solution
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var clientPath = path.join(__dirname, '..', 'client');
var dataPath = path.join(__dirname, 'data.json');

var server = http.createServer(function(req, res) {
    var urlData = url.parse(req.url, true);

    if(urlData.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(clientPath, 'index.html')).pipe(res);
    } else if (urlData.pathname === '/api/chirps') {
        switch (req.method) {
            case 'GET':
                //GET logic
                res.writeHead(200, { 'Content-Type': 'application/json' });
                fs.createReadStream(dataPath).pipe(res);
                break;
            case 'POST':
                //POST logic
                fs.readFile(dataPath, 'utf8', function(err, fileContents) {
                    if (err) {
                        console.log(err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        var chirps = JSON.parse(fileContents);

                        var incomingData = '';
                        req.on('data', function(chunk) {
                            incomingData += chunk;
                        });
                        req.on('end', function() {
                            var newChirp = JSON.parse(incomingData);
                            chirps.push(newChirp);

                            var chirpsJSONData = JSON.stringify(chirps);
                            fs.writeFile(dataPath, chirpsJSONData, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                                    res.end('Internal Server Error');
                                } else {
                                    res.writeHead(201);
                                    res.end();
                                }
                            });
                        });
                    }
                });
                break;
        }
    } else if (req.method === 'GET') { //for all other GET requests
        var fileExtension = path.extname(urlData.pathname);
        var contentType;
        switch (fileExtension) {
            case '.html':
                contentType = 'text/html';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            default:
                contentType = 'text/plain';
        }

        var readStream = fs.createReadStream(path.join(clientPath, urlData.pathname));
        readStream.on('error', function(err) {
            res.writeHead(404);
            res.end();
        });
        res.writeHead(200, { 'Content-Type': contentType });
        readStream.pipe(res);
    }
});
server.listen(3000);
var express = require('express')
var app = express()
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/vizu1', function(req, res) {
    res.sendFile(path.join(__dirname + '/vizu1.html'));
});
app.get('/vizu2', function(req, res) {
    res.sendFile(path.join(__dirname + '/vizu2.html'));
});
app.get('/vizu3', function(req, res) {
    res.sendFile(path.join(__dirname + '/vizu3.html'));
});
app.get('/vizu4', function(req, res) {
    res.sendFile(path.join(__dirname + '/vizu4.html'));
});

app.use('/js', express.static(__dirname + '/js'));

app.use('/data', express.static(__dirname + '/data'));

app.use('/geodata', express.static(__dirname + '/geodata'));

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use('/css', express.static(__dirname + '/css'));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/src'));

app.listen('8000');
console.log('working on 8000');
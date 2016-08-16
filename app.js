var express = require('express');
var sql = require('mssql');
//bluebird as promises engine
sql.Promise = require('bluebird');

var app = express();

//port setup
var port = process.env.PORT || 5000;

//routes setup
var foldImagesRouter = require('./routes/foldImagesRouter');
var aboutRouter = require('./routes/aboutRouter');
var projectsRouter = require('./routes/projectsRouter');
var articlesRouter = require('./routes/articlesRouter');

app.use('/api', aboutRouter, foldImagesRouter, projectsRouter, articlesRouter);

//default message
app.get('/', function (req, res) {
  res.send('Blurbyte web content API.');
});

app.listen(port, function () {
});

var express = require('express');
var sql = require('mssql');

//lodash
var keyBy = require('lodash/keyBy');
var mapValues = require('lodash/mapValues');

var foldImagesRouter = express.Router();

//connection config
var sqlConfig = require('./sqlConfig');

//foldImages
foldImagesRouter.route('/fold-images')
  .get(function (req, res) {
    var connection = new sql.Connection(sqlConfig);
    connection.connect()
      .then(function() {
        //new SQL request for opened connection
        var request = new sql.Request(connection);

        request.query('select pageName, imgFile, imgAlt, descr from foldImage')
          .then(function (foldImages) {
            //formatting up json
            foldImages = mapValues(keyBy(foldImages, 'pageName'), function (image) {
              return { file: image.imgFile, alt: image.imgAlt, description: image.descr };
            });

            //sendig final json response
            res.json(foldImages);
          })
          .catch(function (err) {
            res.status(500).send(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  });

module.exports = foldImagesRouter;

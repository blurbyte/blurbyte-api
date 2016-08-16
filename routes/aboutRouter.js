var express = require('express');
var sql = require('mssql');

//lodash
var map = require('lodash/map');
var groupBy = require('lodash/groupBy');
var omitBy = require('lodash/omitBy');
var isNil = require('lodash/isNil');
var split = require('lodash/split');

var aboutRouter = express.Router();

//connection config
var sqlConfig = require('./sqlConfig');

//about
aboutRouter.route('/about')
  .get(function (req, res) {

	  var connection = new sql.Connection(sqlConfig);
    connection.connect()
      .then(function() {
        //new SQL request for opened connection
        var request = new sql.Request(connection);
        request.query('select sectionName, contentType, attributes, markdown, graphCategory, graphLabels, imgFile, imgAlt, descr from about order by id;')
          .then(function (about) {
            //formatting properties names
            about = map(about, function (section) {
              var labels = section.graphLabels;
              if (labels) {
                labels = split(section.graphLabels, '|');
              }
              return { section: section.sectionName, type: section.contentType, attributes: section.attributes, markdown: section.markdown, category: section.graphCategory, labels: labels, file: section.imgFile, alt: section.imgAlt, description: section.descr };
            });

            //removing null values
            about = map(about, function (section) {
              return omitBy(section, isNil);
            });

            //grouping by section
            about = groupBy(about, 'section');

            //sendig final json response
            res.json(about);
          })
          .catch(function (err) {
            res.status(500).send(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  });

module.exports = aboutRouter;

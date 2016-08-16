var express = require('express');
var sql = require('mssql');

//lodash
var map = require('lodash/map');
var groupBy = require('lodash/groupBy');
var omitBy = require('lodash/omitBy');
var isNil = require('lodash/isNil');
var mapValues = require('lodash/mapValues');

var projectsRouter = express.Router();

//connection config
var sqlConfig = require('./sqlConfig');

//projects
projectsRouter.route('/projects')
  .get(function (req, res) {
    var connection = new sql.Connection(sqlConfig);
    connection.connect()
      .then(function() {
        //new SQL request for open connection
        var request = new sql.Request(connection);
        //allows getting multiple tables at once
        request.multiple = true;

        request.query('select * from project order by projectOrder; select * from projectContent order by id')
          .then(function (recordset) {
            var projects = recordset[0];
            var projectsContent = recordset[1];

            //grouping content by projectId
            projectsContent = groupBy(projectsContent, 'projectId');

            //removing projectId and empty values
            projectsContent = mapValues(projectsContent, function(contents) {
              return map(contents, function(content) {
                var formattedContent = { type: content.contentType, attributes: content.attributes, markdown: content.markdown, file: content.imgFile, alt: content.imgAlt };
                return omitBy(formattedContent, isNil);
              });
            });

            //adding formatted content to project
            projects = map(projects, function(project) {
              return { id: project.id, title: project.title, description: project.descr, category: project.projectCategory, content: projectsContent[project.id] };
            });

            //sendig final json response
            res.json(projects);
          })
          .catch(function (err) {
            res.status(500).send(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      })
  });

module.exports = projectsRouter;

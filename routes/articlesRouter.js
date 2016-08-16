var express = require('express');
var sql = require('mssql');

//lodash
var map = require('lodash/map');
var groupBy = require('lodash/groupBy');
var omitBy = require('lodash/omitBy');
var isNil = require('lodash/isNil');
var mapValues = require('lodash/mapValues');

var articlesRouter = express.Router();

//connection config
var sqlConfig = require('./sqlConfig');

//articles
articlesRouter.route('/articles')
  .get(function (req, res) {

    var connection = new sql.Connection(sqlConfig);
    connection.connect()
      .then(function() {
        //new SQL request for open connection
        var request = new sql.Request(connection);
        //allows getting multiple tables at once
        request.multiple = true;

        request.query('select * from article; select * from articleContent order by id; select * from articleFoldImage;')
          .then(function (recordset) {
            var articles = recordset[0];
            var articlesContent = recordset[1];
            var articlesFoldImages = recordset[2];

            //grouping content and fold images by articleId
            articlesContent = groupBy(articlesContent, 'articleId');
            articlesFoldImages = groupBy(articlesFoldImages, 'articleId');

            //removing articleId and empty values
            articlesContent = mapValues(articlesContent, function(contents) {
              return map(contents, function(content) {
                var formattedContent = { type: content.contentType, attributes: content.attributes, markdown: content.markdown, file: content.imgFile, alt: content.imgAlt };
                return omitBy(formattedContent, isNil);
              });
            });

            articlesFoldImages = mapValues(articlesFoldImages, function(images) {
              return map(images, function(image) {
                return { file: image.imgFile, alt: image.imgAlt, description: image.descr };
              });
            });

            //adding formatted content and fold image to article
            articles = map(articles, function(article) {
              return { id: article.id, title: article.title, description: article.descr, topic: article.topic, pubdate: article.pubdate, readtime: article.readtime, foldImage: articlesFoldImages[article.id][0], content: articlesContent[article.id] };
            });

            //sendig final json response
            res.json(articles);
          })
          .catch(function (err) {
            res.status(500).send(err);
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  });

module.exports = articlesRouter;

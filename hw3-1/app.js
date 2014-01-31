(function () {
  'use strict';

  var _ = require('lodash');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect('mongodb://localhost:27017/school', function (err, db) {
    if (err) { throw err; }

    var
      query = {},
      cursor = db.collection('students').find(query);

    cursor.each(function(err, student) {
      if (err) { throw err; }
      if (student === null) {
        return db.close();
      }

      var lowScore = _.min(student.scores, function (score) {
        if (score.type === 'homework') { return score.score }
      });
      
      console.log(student);
      console.log(lowScore);
    });

  });

})();

(function () {
  'use strict';

  var _ = require('lodash');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect('mongodb://localhost:27017/school', function (err, db) {
    if (err) { throw err; }

    var
      collection = db.collection('students'),
      cursor = collection.find(),
      Students = function (count) {
        this.count = count;
        
        this.next = function () {
          this.count--;
          this.check();
        };

        this.check = function () {
          if (this.count === 0) {
            return db.close();
          }
        };

        
        this.check();
      };
      
    cursor.count(function (err, count) {
      if (err) { throw err; }
      var students = new Students(count);

      cursor.each(function(err, student) {
        if (student === null) { return; }

        var lowestScore = _.min(student.scores, function (score) {
          if (score.type === 'homework') { return score.score }
        });

        if (lowestScore === Infinity) {
          return students.next();
        }
          
        _.pull(student.scores, lowestScore);
        return collection.save(student, {safe: true}, students.next);
      });

    });

  });

})();

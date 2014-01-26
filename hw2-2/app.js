(function () {
	'use strict';

	var MongoClient = require('mongodb').MongoClient;

	MongoClient.connect('mongodb://localhost:27017/weather', function (err, db) {
		if (err) { throw err; }

		var 
		  prevState,	
			query = {},
			sort = [['State', 1], ['Temperature', -1]],
			cursor = db.collection('data').find(query).sort(sort);

		cursor.each(function(err, doc) {
			if (err) { throw err; }
			if (doc === null) { return; }

			if (prevState !== doc.State) {
			  console.log(doc.State + '\'s month high is ' + doc.Temperature + ' degrees.');
				prevState = doc.State;
				doc['month_high'] = true;

				db.collection('data').save(doc, function (err) {
			    if (err) { throw err; } 
			    console.log(doc.State + '\'s month_high was saved.');
					
					if (prevState === doc.State) { 
            return db.close();
					}
				});
			}
		})

	});		

})();

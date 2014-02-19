use test;
db.zips.aggregate([
  {
    "$project": {
      "pop": 1,
      "city": 1,
      "first_char": { "$substr" : ["$city", 0, 1] },
    }
  },
  {
    "$match": {
      "first_char": /^\d+$/
    }
  },
  {
    "$group": {
      "_id": null,
      "total_pop": { "$sum": "$pop" }
    }
  }
]);

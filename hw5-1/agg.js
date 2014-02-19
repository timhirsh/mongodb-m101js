use blog;
db.posts.aggregate([
  {
    "$unwind": "$comments"
  },
  {
    "$group": {
      "_id": { "author": "$comments.author" },
      "total_comments": { "$sum": 1 }
    }
  },
  {
    "$sort": { "total_comments": -1 }
  }
]);

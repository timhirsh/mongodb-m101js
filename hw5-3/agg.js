use students;
db.grades.aggregate([
  {
    "$unwind": "$scores"
  },
  {
    "$match": {
      "scores.type": { "$ne": "quiz" }
    }
  },
  {
    "$group": {
      "_id": {
        "class_id": "$class_id",
        "student_id": "$student_id"
      },
      "avg_score": { "$avg": "$scores.score" }
    }
  },
  {
    "$group": {
      "_id": {
        "class_id": "$_id.class_id",
      },
      "avg_class_score": { "$avg": "$avg_score" }
    }
  },
  {
    "$sort": { "avg_class_score": -1 }
  }
]);

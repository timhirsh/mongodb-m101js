// Please use the Enron dataset you imported for the previous problem. For this
// question you will use the aggregation framework to figure out pairs of
// people that tend to communicate a lot. To do this, you will need to unwind
// the To list for each message.

// This problem is a little tricky because a recipient may appear more than
// once in the To list for a message. You will need to fix that in a stage of
// the aggregation before doing your grouping and counting of (sender, recipient)
// pairs.

use enron;

db.messages.aggregate([
  // project only the data we need
  {
    "$project" : {
      "from" : "$headers.From",
      "to" : "$headers.To",
    }
  },
  // unwind then regroup using addToSet to remove dupe addresses from the 'To' array
  {
    "$unwind": "$to"
  },
  {
    "$group": {
      "_id": {
        "_id": "$_id",
        "from": "$from"
      },
      "to": { "$addToSet": "$to" }
    }
  },
  // unwind again to form final sender/recipient pairs
  {
    "$unwind": "$to"
  },
  // calculate the total for each pair
  {
    "$group": {
      "_id": {
        "from": "$_id.from",
        "to": "$to"
      },
      "total": { "$sum": 1 }
    }
  },
  // do a final sort. solution will be the last document
  {
    "$sort": { "total" : 1 }
  }
]);

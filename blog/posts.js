/* The PostsDAO must be constructed with a connected database object */
function PostsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof PostsDAO)) {
        console.log('Warning: PostsDAO constructor called without "new" operator');
        return new PostsDAO(db);
    }

    var posts = db.collection("posts");

    this.insertEntry = function (title, body, tags, author, callback) {
        "use strict";
        console.log("inserting blog entry" + title + body);

        // fix up the permalink to not include whitespace
        var permalink = title.replace( /\s/g, '_' );
        permalink = permalink.replace( /\W/g, '' );

        // Build a new post
        var post = {"title": title,
                "author": author,
                "body": body,
                "permalink":permalink,
                "tags": tags,
                "comments": [],
                "date": new Date()}

        posts.insert(post, {safe: true}, function (err, result) {
            if (!err) {
                return callback(null, result[0].permalink);
            }

            return callback(err, null);
        });
    }

    this.getPosts = function(num, callback) {
        "use strict";

        posts.find().sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " posts");

            callback(err, items);
        });
    }

    this.getPostsByTag = function(tag, num, callback) {
        "use strict";

        posts.find({ tags : tag }).sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " posts");

            callback(err, items);
        });
    }

    this.getPostByPermalink = function(permalink, callback) {
        "use strict";
        posts.findOne({'permalink': permalink}, function(err, post) {
            "use strict";

            if (err) return callback(err, null);

            // fix up likes values. set to zero if data is not present
            if (typeof post.comments === 'undefined') {
                post.comments = [];
            }

            // Each comment document in a post should have a "num_likes" entry, so we have to
            // iterate all the comments in the post to make sure that is the case
            for (var i = 0; i < post.comments.length; i++) {
                if (typeof post.comments[i].num_likes === 'undefined') {
                    post.comments[i].num_likes = 0;
                }
                post.comments[i].comment_ordinal = i;
            }
            callback(err, post);
        });
    }

    this.addComment = function(permalink, name, email, body, callback) {
        "use strict";

        var comment = {'author': name, 'body': body}

        if (email != "") {
            comment['email'] = email
        }

        posts.findAndModify(
            {permalink: permalink},
            [],
            {$push: {comments: comment}},
            {safe: true},
            function(err, post) {
                if (err) { return callback(err, null); }
                callback(null, post);
            }
        );
    }

    this.incrementLikes = function(permalink, comment_ordinal, callback) {
        "use strict";

        var update = { '$inc': {} };
        update['$inc']['comments.' + comment_ordinal + '.num_likes'] = 1;

        this.getPostByPermalink(permalink, function (err, post) {
            posts.update({'permalink': permalink}, update, function(err, updated) {
                if (err) return callback(err, null);
                callback(err, post);
            });
        });
    }
}

module.exports.PostsDAO = PostsDAO;

(function (root) {
	'use strict';

    if(!root.mongodb) {
        root.mongodb = {
            collection: {
                insert: function (model) {

                }
            },
            db: {
                collection: function (name, callback) {
                    callback.call(this, '', mongodb.collection);
                }
            },
            MongoClient: {
                connect: function (url, callback) {
                    callback.call(this, '', mongodb.db);
                }
            }
        };

        define('mongodb', function () {
            return root.mongodb;
        });
    }

})(this);
'use strict';

require('applyjs');

define(['apply', 'connect'], function (apply, connect) {

    var port = 8080;

    apply.router.add('', {
        GET: function (req, res) {
            res.end('Hello World!');
        }
    });

    connect().use(apply.connect.router()).listen(port);

    console.log('Server running on '+port+'...');

});
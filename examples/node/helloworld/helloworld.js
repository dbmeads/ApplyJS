'use strict';

require('applyjs');

define(['apply', 'connect'], function (apply, connect) {

    apply.router.add('', function (request, response) {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello World!');
    });

    connect().use(function (request, response) {
        apply.router.route(request.url, request, response);
    }).listen(9000);

    console.log('Server running on 9000...');

});
(function () {
    'use strict';

    require('applyjs');

    define(['http', 'apply'], function (http, apply) {

        apply.router.add('', function(request, response) {
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('Hello World!');
        });

        http.createServer(function (request, response) {
            request.addListener('end', function () {
                apply.router.route(request.url, request, response);
            });
        }).listen(9000);

        console.log('Server running...');

    });

})();
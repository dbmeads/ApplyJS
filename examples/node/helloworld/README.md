###Getting the hello world example running.

##Instructions:

1. Install Node.js
2. Copy the helloworld.js to a directory of your choosing.
2. Run "npm install applyjs" from the directory with helloworld.js to install ApplyJS.
3. Start the server by running "node helloworld.js".
4. Point your browser at "http://localhost:9000".

##Notes:

One thing you might notice is that the example looks more like AMD then CommonJS.
That's because we've decided to adopt AMD as our standard for consistency between the server and browser.
As long as your main app file requires ApplyJS (e.g.: require('applyjs');) then you'll be able to use define in your modules.

The following example demonstrates how you might include a relative module using define:

###Directory Structure:

    project/myModule.js
    project/subdirectory/myOtherModule.js

###Define Call:

#### myModule.js

define('myModule', [__dirname+'/subdirectory/myOtherModule'], function(myOtherModule) {
    // do something
})

###Getting the hello world example running.

##Instructions:

1. install Node.js
2. go to the directory you would like to clone ApplyJS to.
2. run "git clone https://github.com/dbmeads/ApplyJS.git"
3. run "cd ApplyJS/examples/node/helloworld"
4. run "npm install"
5. run "node helloworld"

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

// create the worker
var worker = new Worker('worker.js');

// get shout service interface
window.workerio
    .getInterface(worker, 'shoutService')
    .then(function (ShoutService) {

        // use the shoutService
        var shoutService = ShoutService.create();
        shoutService
             .shout('Michael')
             .then(function (result) {
                console.log(result);
                // Hello Michael
              });

        shoutService
              .pssst()
              .then(function (result) {
                console.log(result); 
                // now it is silence here :)
              });
});
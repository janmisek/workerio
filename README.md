
```
      __   __        ___  __      __
|  | /  \ |__) |__/ |__  |__)  | /  \
|/\| \__/ |  \ |  \ |___ |  \ .| \__/

```

# RPC interfaces for your web workers
Worker.IO automatically creates interfaces from object's inside workers and allows you to use them
from browser's main thread. Created Interfaces utilizes `postMessage` mechanism
and returns Promises/A+ compliant results.

## Example usage:
    
**worker.js**


define server in worker's thread:
```js

// shoutService is object we want to have proxied on client
var shoutService = {

	shout: function (name) {
		return 'Hello ' + name;
	},

	pssst: function() {
		return Promise.resolve('now it is silence here :)');
	},

};

// import workerio
importScripts('workerio.js');

// lets publish shoutService to client
self.workerio
	.publishInterface(self, 'shoutService', shoutService);

```

**app.js**
  

define client in main browser thread:
```js

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
```
In example above we have web worker in `worker.js` with workerio `Server` which publishes interface of object `shoutService` to workerio `Client` ran in browser thread.  

Client did create for us proxy object with same interface as the worker's shoutService.  So we can call any method of the worker object from window.

Because inter-process communication between main browser thread and worker utilizes asynchronous `postMessage`mechanism all executions on client interface returns promises compliant with Promise/A+.

## API

**workerio.getInterface**

Main client api method which retrieves interfaces from server.

**workerio.publishInterface**

Main server api method which publishes interfaces to client.


**Server**

Should be created in worker around the worker's port. Port is usually `self`.
Server should publish its interface to client by `publishInterface` method. Server must be named.
The `iface` name is used to pair communication between server and client.
More servers and thus more interfaces could be run around single port. Server can provide up to single interface.

**Client**

Should be created in browser's main thread around the port. Client retrieves interface definition from server
and builds interface class for you. You can then extend the interface class to override or implement new methods.
The `iface` name must be same as the server one. Client can provide up to single interface.

**Port**

Generally Worker.IO could work with any port implementation as `window`, `Worker`, `SharedWorker` or even custom made port. Port must implement `postMessage` method and `message` event. 

**Connection**

Wraps communication between `Server` and `Client` over port to some standardized interface

**Builder**

`Builder` is used to build client interfaces (the classes) and to prepare definition of interface to be sent by `Server` to the `Client`. Builder utilizes `PropertyBuilders` which builds proxy methods on client interface for each property of interfaced object depending on its type.

## Advanced usage examples

**Extend client interface**
```js


window.workerio
	.getInterface(worker, 'shoutService')
	.then(function (ShoutService) {
	
		MyShoutService = ShoutService.extend({
		    shout: function(name) {
		       var supr = ShoutService.prototype.shout.apply(this,arguments);
		       return supr.then(function(result) {
                   return result + ', How are you?';
               });
             }
	});
});

// somewhere in the code later we will use extended class
var shoutService = MyShoutService.create();
   	shoutService
   	    .shout('Michael')
   	    .then(function (result) {
   	        console.log(result); 
   	        // Hello Michael, How are you?
   	    });

```

**Retrieve more interfaces at once**:
```js


window.workerio
	.getInterfaces(worker, ['shoutService', 'indexingService'])
	.then(function (Services) {
		var indexingService = Services.IndexingService.create();
		var shoutService = Services.ShoutService.create();

		// use services ...

	});
```


## What can be proxied
- synchronous methods of objects 
- asynchronous method of object which returns Promise/A+
- properties of objects - as automatically generated getters and setters (currently wip)

## Roadmap
Worker IO is currently WIP. Future plans are:

- finish the docs
- better errror handling - resolve timeouting when worker loads itself for too long
- ability to specify base class for interface proxy
- seperate platform to integrate with ember
- create ember addon with service integration
- create property builder for setting/getting properties and even objects
- filter properties/methods not to be interfaced
- make compatibile with window - target origin is needed regarding the error "Failed to execute 'postMessage' on 'Window': Invalid target origin '' in a call to 'postMessage'"

## Test and build
Test
```
npm install
bower install
broccoli server
# go to http://localhost:4200/dist/tests
```
Build
```
npm install
bower install
broccoli build dist
```



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
Server.create({port: self})
	.publishInterface('shoutService', shoutService);

```

**app.js**
  

define client in main browser thread:
```js

// create the client
var client = window.workerio.Client.create({
     port: new Worker('worker.js'), 
     iface: 'shoutService'
});

// get shout service interface
client.getInterface().then(function (ShoutService) {

        // use the shoutService
        var shoutService = ShoutService.create();
        
        shoutService
             .shout('Michael')
             .then(function (result) {
                 console.log(result); // Hello Michael
       	      });

        shoutService
              .pssst('Michael')
              .then(function (result) {
        	  console.log(result); // now it is silence here :)
       	      });
       		
       		
});
```
In example above we have web worker in `worker.js` with workerio `Server` which publishes interface of object
`shoutService` to workerio `Client` ran in browser thread.  Client did create for us proxy object with same interface
as the worker's shoutService.  So we can call any method of the worker object from window.

Because interprocess communication between main browser thread and worker utilizes asynchronous `postMessage`
mechanism all executions on client interface returns promises compliant with Promise/A+.

## API

**Server**

Should be created in worker around the worker's port. Port is usually `self`.
Server should publish its interface to client by `publishInterface` method. Server must be named.
The `iface` name is used to pair communication between server and client.
More servers and thus more interfaces could be run around single port. Server can provide up to single interface.

**Client**

Should be created in browser's main thread around the port. Client retrieves interface definition from server
and builds interface class for you. You can then extend the interface class to override or implement new methods.
The `iface` name must be same as the server one. Server can provide up to single interface.


extend client interface:
```js


client.getInterface().then(function (ShoutService) {
	
	var MyShoutService = ShoutService.extend({
		shout: function(name) {
			var supr = ShoutService.prototype.shout.apply(this,arguments);

			return supr.then(function(result) {
				return result + ', How are you?';
			});
		}
	});

	var shoutService = MyShoutService.create();
    	shoutService.shout('Michael').then(function (result) {
	         console.log(result); // Hello Michael, How are you?
    	});
});

```


**Port**

Generally Worker.IO could work with any port implementation as `window`, `Worker`, `SharedWorker` or even custom made port. Port must implement `postMessage` method and `message` event. 

**Connection**

Wraps communication between `Server` and `Client` over port to some standardized interface

**Builder**

`Builder` is used to build client interfaces (the classes) and to prepare definition of interface to be sent by `Server` to the `Client`. Builder utilizes `PropertyBuilders` which builds proxy methods on client interface for each property of interfaced object depending on its type.




## What can be proxied
- synchronous methods of objects 
- asynchronous method of object which returns Promise/A+
- properties of objects - are proxies as getters and setters (currently wip)



## Roadmap
Worker IO is currently WIP. Future plans are:

- finish the docs
- better errror handling
- create property builder for setting/getting properties and even objects
- filter properties to be interfaced

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

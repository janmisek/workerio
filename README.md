

```
      __   __        ___  __      __
|  | /  \ |__) |__/ |__  |__)  | /  \
|/\| \__/ |  \ |  \ |___ |  \ .| \__/

```

# RPC interfaces for your web workers
Worker.IO automatically creates interfaces from object's inside workers and allows you to use then from browser's main thread. Created Interfaces utilizes `postMessage` mechanism and returns Promises/A+ compliant results.

## Example usage:
    
**worker.js**

```js  
var shoutService = {

	pssst: function() {
		return 'pssst!!!';
	},
	
	shout: function (name) {
		return 'Hello + name;
	}
};

Server.create({port: self})
	.publishInterface('shoutService', shoutService);

```

**app.js**
  
```js  
var client = Client.create({
     port: new Worker('worker.js'), 
     iface: 'shoutService'
 });

client.getInterface().then(function (ShoutService) {
        var shoutService = ShoutService.create();
        shoutService.shout('Michael')
          	.then(function (result) {
			console.log(result);
			// Hello Michael
       });
});
```

## Roadmap
Worker IO is currently WIP. Future plans are:

- make including package easier in worker (currently requirejs is needed)
- finish the docs
- support promises returned by proxied methods
- create property builder for setting/getting properties and even objects

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

# ractive-render

A simple way to render Ractive templates on node.js.

## Installation

```
$ npm install ractive-render
```

Use v0.3.0 for Ractive v0.5.x.

Use v0.2.0 for Ractive v0.4.0.

## Usage

```js
var rr = require('ractive-render');
var template = 'template.html';
var options = { data: { ... } };
var callback = function (err, html) { ... };

rr.renderFile(template, options, callback);
```

```.renderFile()``` returns a Promise so you can use ```.then()``` instead of the callback:
```js
rr.renderFile(template, options).then(callback);
```

If you don't specify ```data``` in ```options```, the whole ```options``` object will be passed to Ractive as ```data``` argument:
```js
options = { ... }; // the same as { data: { ... } }

rr.renderFile(template, options, callback);
```

### Partials
You can define your partial directly:
```js
options = { data: { ... }, partials: { partial: myPart } };

rr.renderFile(template, options, callback);
```

Or you can provide a path to the partial:
```js
options = { data: { ... }, partials: { partial: 'partial!path/to/the/partial' } };

rr.renderFile(template, options, callback);
```

If you have your partials in the same directory as template, you can let ractive-render to take care of the whole process:
```js
rr.config({ autoloadPartials: true }); // you can omit this as it defaults to true

rr.renderFile(template, options, callback);
```

### Components
Just like with partials, you can define your components directly:
```js
options = { data: { ... }, components: { component: myComp } };

rr.renderFile(template, options, callback);
```

Or you can provide a path. This requires either RVC or load plugin to be installed:
```js
options = { data: { ... }, components: { component: 'path/to/the/component' } };

rr.renderFile(template, options, callback);
```

### Ractive RVC
To use the RVC plugin, you need to install it along with RequireJS:
```
$ npm install rvc requirejs
```
Be careful to install the correct RVC version for your version of Ractive:

- for Ractive 0.4.0 use RVC 0.1.3,
- for Ractive 0.5.x use RVC 0.2.x.

Tell ractive-render to use the plugin:
```js
rr.use('rvc').config({ componentsLoader: 'rvc' });
```

Now you can render your components like this:
```js
options = { use: 'rvc', data: { ... } };

rr.renderFile(template, options, callback);
```

Optionally, use can set RVC as default loader and omit the ```use``` parameter.
```js
rr.config({ defaultLoader: 'rvc' });

options = { data: { ... } };

rr.renderFile(template, options, callback);
```

### Ractive load
```
$ npm install ractive-load
```

You can use it the same way as the RVC plugin.

### Integration with Express

```js
var rr = require('ractive-render');
app.engine('html', rr.renderFile);

app.render(template, options, callback);
```

## Performance
If you set ```cache``` to ```true```, ractive-render will cache the templates in memory:
```js
options = { cache: true, data: { ... } };

rr.renderFile(template, options, callback);
```

Note that Express does this automatically for production environments. You can clear the cache by calling ```rr.clearCache()```.

## More details
Just look at the code.

## License
Copyright (c) 2014 Martin Kolárik. Released under the MIT license.

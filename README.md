# ractive-render

A simple way to render Ractive templates on node.js.

## Installation

```
$ npm install ractive-render
```

## Usage

```js
var rr = require('ractive-render');

rr.renderFile('template.html', { data: { ... } }, function (err, html) { ... });
```

```.renderFile()``` returns a Promise so you can use ```.then()``` instead of the callback:
```js
rr.renderFile('template.html', { data: { ... } }).then(function (err, html) { ... });
```

If you don't specify ```data``` in ```options```, the whole ```options``` object will be passed to Ractive as ```data``` argument:
```js
rr.renderFile('template.html', { ... }, function (err, html) { ... });
```

### Partials
You can define your partial directly:
```js
rr.renderFile('template.html', { data: { ... }, partials: { partial: myPart } }, function (err, html) { ... });
```

Or you can provide a path to the partial:
```js
rr.renderFile('template.html', { data: { ... }, partials: { partial: 'partial!path/to/the/partial' } }, function (err, html) { ... });
```

Optionally (if you set ```autoloadPartials``` to ```true```), you can let ractive-render to take care of the whole process:
```js
rr.renderFile('template.html', { data: { ... } }, function (err, html) { ... });
```

### Components
Just like with partials, you can define your components directly:
```js
rr.renderFile('template.html', { data: { ... }, components: { component: myComp } }, function (err, html) { ... });
```

Or you can provide a path. This requires either RVC or load plugin to be installed:
```js
rr.renderFile('template.html', { data: { ... }, components: { component: 'path/to/the/component' } }, function (err, html) { ... });
```

### Ractive RVC
To use the RVC plugin, you need to install it along with RequireJS:
```
$ npm install rvc requirejs
```

Then you have to tell ractive-render to use the plugin:
```js
rr.use('rvc').config({ componentsLoader: 'rvc' });
```

Now you can render your components like this:
```js
rr.renderFile('component.html', { use: 'rvc', data: { ... } }, function (err, html) { ... });
```

Optionally, use can set RVC as default loader and omit the ```use``` parameter.
```js
rr.config({ defaultLoader: 'rvc' });

rr.renderFile('component.html', { data: { ... } }, function (err, html) { ... });
```

### Ractive load
To use the Ractive load plugin, you need to install it first:
```
$ npm install ractive-load
```

Now you can use it the same way as the RVC plugin.

### Integration with Express

```js
var rr = require('ractive-render');
app.engine('html', rr.renderFile);

app.render('template.html', { data: { ... } }, function (err, html) { ... });
```


## Performance
If you set ```cache``` to ```true```, ractive-render will cache the template in memory:
```js
rr.renderFile('template.html', { cache: true, data: { ... } }).then(function (err, html) { ... });
```

Note that Express sets this automatically for production environments.

## More details
Just look at the code.

## License
MIT.
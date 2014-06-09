var fs = require('fs');
var path = require('path');

var Promise = require('bluebird');
var Ractive = require('Ractive');

fs = Promise.promisifyAll(Object.create(fs));

var rr = require('./ractive-render');
var utils = require('./utils');
module.exports = load;

/**
 * Create a component from the given file
 *
 * @param {string} file
 * @param {Object} options
 * @returns {Promise}
 * @public
 */
function load(file, options) {
	if (options.cache && rr.cache['tpl!' + file]) {
		return Promise.resolve(rr.cache['tpl!' + file]);
	}

	return fs.readFileAsync(file, 'utf8').then(function (template) {
		return utils.wrap(Ractive.parse(template), options);
	}).then(function (template) {
		var basePath = path.relative(options.settings.views, path.dirname(file));
		var cOptions = utils.buildOptions(options, null, true);
		cOptions.template = template;

		return Promise.join(utils.buildComponentsRegistry(cOptions), utils.buildPartialsRegistry(basePath, cOptions), function (components, partials) {
			cOptions.components = components;
			cOptions.partials = partials;
			options.components = {};
			options.partials = {};

			var Component = Ractive.extend(cOptions);

			if (options.cache) {
				rr.cache['tpl!' + file] = Component;
			}

			return Component;
		});
	});
}
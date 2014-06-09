var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');
var ractiveLoad = require('ractive-load');

var rr = require('./ractive-render');
var utils = require('./utils');
module.exports = load;

/**
 * Ractive load config
 */
ractiveLoad.cache = false;

/**
 * Create a component from the given file using RVC
 *
 * @param {string} file
 * @param {Object} options
 * @returns {Promise}
 * @public
 */
function load(file, options) {
	if (options.cache && rr.cache['load!' + file]) {
		return Promise.resolve(rr.cache['load!' + file]);
	}

	return ractiveLoad(file.replace(/\\/g, '/')).then(function (Component) {
		var basePath = path.relative(options.settings.views, path.dirname(file));
		options.template = utils.selectTemplate(options, Component);
		Component.defaults.template = options.template;

		return Promise.join(utils.buildComponentsRegistry(options), utils.buildPartialsRegistry(basePath, options), function (components, partials) {
			_.assign(Component.components, components);
			_.assign(Component.partials, partials);
			options.components = {};
			options.partials = {};

			if (options.cache) {
				rr.cache['load!' + file] = Component;
			}

			return Component;
		});
	});
}
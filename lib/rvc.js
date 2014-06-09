var path = require('path');

var _ = require('lodash');
var requireJS = require('requireJS');
var Promise = require('bluebird');

var rr = require('./ractive-render');
var utils = require('./utils');
module.exports = load;

/**
 * RequireJS config
 */
requireJS.config({
	isBuild: true,
	baseUrl: '.',
	paths: {
		rvc: requireJSPath(path.relative('.', require.resolve('rvc')), '.js'),
		ractive: requireJSPath(path.relative('.', require.resolve('ractive')), '.js')
	}
});

/**
 * Create a component from the given file using RVC
 *
 * @param {string} file
 * @param {Object} options
 * @returns {Promise}
 * @public
 */
function load(file, options) {
	if (options.cache && rr.cache['rvc!' + file]) {
		return Promise.resolve(rr.cache['rvc!' + file]);
	}

	return requireJSAsync(file).then(function (Component) {
		// flush requireJS's cache
		_.forEach(requireJS.s.contexts._.defined, function (value, key, array) {
			if (key.substr(0, 4) === 'rvc!') {
				delete array[key];
			}
		});

		return utils.wrap(utils.selectTemplate(options, Component), options).then(function (template) {
			var basePath = path.relative(options.settings.views, path.dirname(file));
			Component.defaults.template = options.template = template;

			return Promise.join(utils.buildComponentsRegistry(options), utils.buildPartialsRegistry(basePath, options), function (components, partials) {
				_.assign(Component.components, components);
				_.assign(Component.partials, partials);
				options.components = {};
				options.partials = {};

				if (options.cache) {
					rr.cache['rvc!' + file] = Component;
				}

				return Component;
			});
		});
	});
}

/**
 * Wrapper for requireJS
 *
 * @param {string} file
 * @returns {Promise}
 * @private
 */
function requireJSAsync (file) {
	return new Promise(function (resolve, reject) {
		requireJS([ 'rvc!' + requireJSPath(file, '.html') ], resolve, reject);
	});
}

/**
 * Get RequireJS path to the given file
 *
 * @param {string} file
 * @param {string} [extension]
 * @returns {string}
 * @private
 */
function requireJSPath(file, extension) {
	return path.join(path.dirname(file), path.basename(file, extension)).replace(/\\/g, '/');
}
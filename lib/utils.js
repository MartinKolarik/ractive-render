var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');
var Ractive = require('ractive');

fs = Promise.promisifyAll(Object.create(fs));

var rr = require('./ractive-render');
var utils = exports;

/**
 * Load all components specified in `options.components`
 *
 * @param {Object} options
 * @returns {Promise}
 * @public
 */
utils.buildComponentsRegistry = function (options) {
	if (!options.components) {
		return Promise.resolve({});
	}

	return Promise.map(_.values(options.components), function (component) {
		// already built component
		if (typeof component === 'function') {
			return component;
		}

		var fPath = path.join(options.settings.views, component + '.html');

		// prevent infinite loops
		if (options.parent !== fPath) {
			return rr.loaders[rr.settings.componentsLoader](fPath, utils.buildOptions(options, fPath));
		}
	}).then(function (components) {
		// filter out undefined values
		return _.forEach(_.zipObject(_.keys(options.components), components), function (value, key, array) {
			if (value === undefined) {
				delete array[key];
			}
		});
	});
};

/**
 * Build options for Ractive.extend()
 *
 * @param {Object} options
 * @param {String} [parent]
 * @param {Boolean} [inherit]
 * @returns {Object}
 * @public
 */
utils.buildOptions = function (options, parent, inherit) {
	var newOptions = inherit || rr.config.inheritRegistries
		? _.pick(options, [ 'settings', 'cache', 'components', 'partials' ])
		: _.pick(options, [ 'settings', 'cache' ]);

	if (parent) {
		newOptions.parent = parent;
	}

	return newOptions;
};

/**
 * Load all partials specified in `options.partials` or found by `findPartials()`
 *
 * @param {String} basePath
 * @param {Object} options
 * @returns {Promise}
 * @private
 */
utils.buildPartialsRegistry = function (basePath, options) {
	options.partials = options.partials || {};

	if (rr.settings.autoloadPartials) {
		var partials = _.mapValues(_.zipObject(findPartials(options.template)), function (value, name) {
			return 'partial!A!' + path.join(basePath, name);
		});

		// won't overwrite already defined keys in options.partials
		_.defaults(options.partials, partials);
	}

	return Promise.map(_.values(options.partials), function (partial) {
		// already parsed
		if (_.isObject(partial)) {
			return partial;
		}

		// file reference - auto detected
		if (partial.substr(0, 10) === 'partial!A!') {
			return fs.readFileAsync(path.join(options.settings.views, partial.substr(10)) + rr.settings.extension, 'utf8').then(function (template) {
				return Ractive.parse(template, options);
			}).catch(function () {});
		}

		// file reference
		if (partial.substr(0, 8) === 'partial!') {
			return fs.readFileAsync(path.join(options.settings.views, partial.substr(8)) + rr.settings.extension, 'utf8').then(function (template) {
				return Ractive.parse(template, options);
			});
		}

		// raw HTML
		return Ractive.parse(partial, options);
	}).then(function (partials) {
		// filter out undefined values
		return _.forEach(_.zipObject(_.keys(options.partials), partials), function (value, key, array) {
			if (value === undefined) {
				delete array[key];
			}
		});
	});
};

/**
 * Select the correct template to use
 *
 * @param {Object} options
 * @param {Object} Component
 * @returns {Array|Object}
 * @public
 */
utils.selectTemplate = function (options, Component) {
	if (options.template === undefined) {
		options.template = Component.template !== undefined
			? Component.template
			: Component.defaults.template;
	}

	return options.template;
};

/**
 * Wrap the given template
 *
 * @param {Array|Object} template
 * @param {Object} options
 * @returns {Promise}
 * @public
 */
utils.wrap = function (template, options) {
	if (!options.wrapper) {
		return Promise.resolve(template);
	}

	return fs.readFileAsync(path.join(options.settings.views, options.wrapper), 'utf8').then(function (wrapper) {
		return injectTemplate(Ractive.parse(wrapper, options), options.el, template);
	});
};

/**
 * Return a list of all partials used in the given template
 *
 * @param {Array|Object} fragment
 * @returns {Array|Object}
 * @private
 */
function findPartials(fragment) {
	var found = [];

	walkRecursive(fragment.t, function(item) {
		if (item.t === 8) {
			found.push(item.r);
		}
	});

	return _.uniq(found);
}

/**
 * Inject template
 *
 * @param {Array|Object} template
 * @param {String} id
 * @param {Array} newContent
 * @returns {Array|Object}
 * @private
 */
function injectTemplate(template, id, newContent) {
	walkRecursive(template.t, function (item) {
		if (item.t === 7 && Array.isArray(item.m) && item.m.filter(function (a) { return a.n === 'id' && a.f === id; }).length) {
			item.f = newContent.t;

			// break;
			return false;
		}
	});

	return template;
}

/**
 * Walk recursive
 *
 * @param {Array} array
 * @param {Function} callback
 * @returns {Boolean}
 * @private
 */
function walkRecursive(array, callback) {
	for (var i = 0, c = array.length; i < c; i++) {
		if (_.isObject(array[i].f)) {
			if (walkRecursive(array[i].f, callback) === false) {
				return false;
			}
		} else if (callback(array[i], i, array) === false) {
			return false;
		}
	}
}

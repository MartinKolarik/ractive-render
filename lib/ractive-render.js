/**
 * ractive-render 0.1.0
 * https://github.com/MartinKolarik/ractive-render/
 *
 * Copyright (c) 2014 Martin Kolárik
 * martin@kolarik.me
 * http://kolarik.me
 *
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/MIT
 */

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var Promise = require('bluebird');

fs = Promise.promisifyAll(Object.create(fs));

var template = require('./template');
var rr = exports;

/**
 * Cache
 *
 * @type {Object}
 * @public
 */
rr.cache = {};

/**
 * Registered loaders
 *
 * @type {Object}
 * @public
 */
rr.loaders = {
	template: template
};

/**
 * Configuration
 *
 * @type {{autoloadPartials: boolean, componentsLoader: string|null, extension: string, inheritRegistries: boolean, templateLoader: string}}
 * @public
 */
rr.options = {
	autoloadPartials: true,
	componentsLoader: null,
	defaultLoader: 'template',
	extension: '.html',
	inheritRegistries: true,
	templateLoader: 'template'
};

/**
 * Clear the cache
 *
 * @returns {ractiveRender}
 * @public
 */
rr.clearCache = function () {
	_.forEach(rr.cache, function (value, key, array) {
		delete array[key];
	});

	return rr;
};

/**
 * Compile (recursively) all templates in the directory
 *
 * @param {string} dir
 * @param {Object} [options]
 * @param {function} [callback]
 * @returns {Promise}
 * @public
 */
rr.compile = function (dir, options, callback) {
	return fs.readdirAsync(dir).map(function (file) {
		var fPath = dir + '/' + file;

		return fs.statAsync(fPath).then(function (stat) {
			return stat.isDirectory()
				? rr.compile(fPath, options)
				: rr.renderFile(fPath, options);
		});
	}).nodeify(callback);
};

/**
 * Config
 *
 * @param {Object} options
 * @returns {ractiveRender}
 * @public
 */
rr.config = function (options) {
	_.merge(rr.options, options);

	return rr;
};

/**
 * Render the given template or component
 *
 * @param {string} file
 * @param {Object} [options]
 * @param {function} [callback]
 * @returns {Promise}
 * @public
 */
rr.renderFile = function (file, options, callback) {
	return Promise.try(function () {
		// make sure everything is there so we don't have to check later
		options = options || {};
		options.use = options.use || rr.options.defaultLoader;
		options.settings = options.settings || {};
		options.settings.views = options.settings.views || path.dirname(file);

		return rr.loaders[options.use](file, options).then(function (Component) {
			options.data = options.data || options;

			return new Component(options).toHTML();
		});
	}).nodeify(callback);
};

/**
 * Register the given loader
 *
 * @param {string|Object} loader
 * @param {string} [as]
 * @returns {ractiveRender}
 * @public
 */
rr.use = function (loader, as) {
	typeof loader === 'string'
		? rr.loaders[as || loader] = require('./' + loader)
		: rr.loaders[as] = loader;

	return rr;
};
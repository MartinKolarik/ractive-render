var _ = require('lodash');
var expect = require('chai').expect;
var express = require('express');
var ractiveRender = require('../../');

var app = express();
app.set('views', __dirname + '/../samples');
app.engine('html', ractiveRender.renderFile);

describe('clearCache', function () {
	before(function (done) {
		app.set('view cache', true);

		app.render('template/template-partial.html', { partials: { partial: 'partial!template/partial' } }, function (err) {
			if (err) {
				done(err);
			}

			done();
		});
	});

	it('should clear the cache', function () {
		expect(_.size(ractiveRender.cache)).to.equal(1);
		ractiveRender.clearCache();
		expect(_.size(ractiveRender.cache)).to.equal(0);
	});
});

describe('compile', function () {
	it('should compile all templates', function (done) {
		ractiveRender.clearCache();
		ractiveRender.compile(app.get('views')).spread(function (load, rvc, template) {
			expect(load.length).to.equal(8);
			expect(rvc.length).to.equal(9);
			expect(template.length).to.equal(8);

			done();
		});
	});
});

describe('config', function () {
	before (function () {
		ractiveRender.settings.a = 1;
		ractiveRender.settings.b = 2;
	});

	it('should set "b" to 3 and "c" to 4', function () {
		ractiveRender.config({ b: 3, c: 4 });

		expect(ractiveRender.settings.a).to.equal(1);
		expect(ractiveRender.settings.b).to.equal(3);
		expect(ractiveRender.settings.c).to.equal(4);
	});
});
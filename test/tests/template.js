var _ = require('lodash');
var expect = require('chai').expect;
var express = require('express');
var Ractive = require('ractive');
var ractiveRender = require('../../');

var app = express();
app.set('views', __dirname + '/../samples');
app.engine('html', ractiveRender.renderFile);

describe('template', function () {
	before(function () {
		ractiveRender.use('rvc').config({ componentsLoader: 'rvc' });
	});

	describe('no cache', function () {
		before(function () {
			app.set('view cache', false);
		});

		it('should render the template', function (done) {
			app.render('template/template.html', { data: { name: 'Word' } }, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello Word!</p>');
				done();
			});
		});

		it('should render the template even when data are not explicitly set', function (done) {
			app.render('template/template.html', { name: 'Word' }, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello Word!</p>');
				done();
			});
		});

		describe('partials', function () {
			describe('autoload off', function () {
				before(function () {
					ractiveRender.config({ autoloadPartials: false });
				});

				it('should render a partial defined as a string', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!template/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should not try to autoload the partial', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>');
						done();
					});
				});
			});

			describe('autoload on', function () {
				before(function () {
					ractiveRender.config({ autoloadPartials: true });
				});

				it('should render a partial defined as a string', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!template/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should autoload the partial', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should autoload the partial rendered inside another element', function (done) {
					app.render('template/template-partial-nested.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p><p>Hi there!</p>');
						done();
					});
				});

				it('should not fail if partial doesn\'t exist', function (done) {
					app.render('template/template-no-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>');
						done();
					});
				});
			});
		});

		describe('components', function () {
			it('should render a component defined as an object', function (done) {
				app.render('template/template-component.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{abc}}', data: { abc: 123 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should render a component defined as a file', function (done) {
				app.render('template/template-component.html', { data: { name: 'Word' }, components: { comp: 'template/component' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});
		});
	});

	describe('cache', function () {
		before(function () {
			app.set('view cache', true);
			ractiveRender.clearCache();
		});

		it('should cache the template', function (done) {
			app.render('template/template.html', { data: { name: 'Word' } }, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello Word!</p>');
				expect(_.size(ractiveRender.cache)).to.equal(1);
				done();
			});
		});

		it('should not cache the data', function (done) {
			app.render('template/template.html', {}, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello !</p>');
				done();
			});
		});

		describe('partials', function () {
			describe('autoload off', function () {
				before(function () {
					ractiveRender.config({ autoloadPartials: false });
				});

				it('should render a partial defined as a string', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should cache a partial defined as a string', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should allow a cached partial defined as a string to be overridden', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi again!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi again!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					ractiveRender.clearCache();
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should cache a partial defined as an object', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should allow a cached partial defined as an object to be overridden', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi again!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi again!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					ractiveRender.clearCache();
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!template/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should cache a partial defined as a file', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should not try to autoload the partial', function (done) {
					ractiveRender.clearCache();
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>');
						done();
					});
				});
			});

			describe('autoload on', function () {
				before(function () {
					ractiveRender.config({ autoloadPartials: true });
				});

				it('should autoload the partial', function (done) {
					ractiveRender.clearCache();
					app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should allow an autoloaded partial to be overridden', function (done) {
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should not autoload the partial', function (done) {
					ractiveRender.clearCache();
					app.render('template/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');

						app.render('template/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
							expect(html).to.equal('<p>Hello Word!</p>Hi!');
							done();
						});
					});
				});
			});
		});

		describe('components', function () {
			it('should render a component defined as an object', function (done) {
				ractiveRender.clearCache();
				app.render('template/template-component.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{abc}}', data: { abc: 123 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should cache a component defined as an object', function (done) {
				app.render('template/template-component.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should allow a cached component defined as an object to be overridden', function (done) {
				app.render('template/template-component.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{xyz}}', data: { xyz: 456 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>456');
					done();
				});
			});

			it('should render a component defined as a file', function (done) {
				ractiveRender.clearCache();
				app.render('template/template-component.html', { data: { name: 'Word' }, components: { comp: 'template/component' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should cache a component defined as a file', function (done) {
				app.render('template/template-component.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});
		});

		describe('wrap', function () {
			it('should render the template', function (done) {
				app.render('template/template.html', { data: { name: 'Word' }, wrapper: 'template/wrapper.html', el : 'el' }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<div class="my-cl"></div><span></span><div id="el"><p>Hello Word!</p></div>');
					done();
				});
			});

			it('should cache the correct template', function (done) {
				app.render('template/template.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<div class="my-cl"></div><span></span><div id="el"><p>Hello Word!</p></div>');
					done();
				});
			});
		});
	});
});

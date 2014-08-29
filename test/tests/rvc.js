var _ = require('lodash');
var expect = require('chai').expect;
var express = require('express');
var Ractive = require('ractive');
var ractiveRender = require('../../');

var app = express();
app.set('views', __dirname + '/../samples');
app.engine('html', ractiveRender.renderFile);

describe('rvc', function () {
	before(function () {
		ractiveRender.use('rvc').config({ componentsLoader: 'rvc', defaultLoader: 'rvc' });
	});

	describe('no cache', function () {
		before(function () {
			app.set('view cache', false);
		});

		it('should render the component', function (done) {
			app.render('rvc/template.html', { data: { name: 'Word' } }, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello Word!</p>');
				done();
			});
		});

		it('should render the component even when data are not explicitly set', function (done) {
			app.render('rvc/template.html', { name: 'Word' }, function (err, html) {
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
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!rvc/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should not try to autoload the partial', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>');
						done();
					});
				});

				it('should allow the default partial to be overridden', function (done) {
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' },  partials: { partial: 'Hi there!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});
			});

			describe('autoload on', function () {
				before(function () {
					ractiveRender.config({ autoloadPartials: true });
				});

				it('should render a partial defined as a string', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!rvc/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should autoload the partial', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
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
					});
				});

				it('should allow the default partial to be overridden', function (done) {
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});
			});
		});

		describe('components', function () {
			it('should render a component defined as an object', function (done) {
				app.render('rvc/template-component.html', { data: { name: 'Word' }, r:1, components: { comp: Ractive.extend({ 'template': '{{var}}', data: { var: 123 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should render a component defined as a file', function (done) {
				app.render('rvc/template-component.html', { data: { name: 'Word' }, components: { comp: 'rvc/component' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			describe('imported components', function () {
				it('should render a component imported via link', function (done) {
					app.render('rvc/template-import.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should render a component imported via require', function (done) {
					app.render('rvc/template-require.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should the imported component to be overridden', function (done) {
					app.render('rvc/template-require.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{xyz}}', data: { xyz: 456 } }) } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>456');
						done();
					});
				});
			});
		});
	});

	describe('cache', function () {
		before(function () {
			app.set('view cache', true);
			ractiveRender.clearCache();
		});

		it('should cache the component', function (done) {
			app.render('rvc/template.html', { data: { name: 'Word' } }, function (err, html) {
				if (err) {
					done(err);
				}

				expect(html).to.equal('<p>Hello Word!</p>');
				expect(_.size(ractiveRender.cache)).to.equal(1);
				done();
			});
		});

		it('should not cache the data', function (done) {
			app.render('rvc/template.html', {}, function (err, html) {
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
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should cache a partial defined as a string', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should allow a cached partial defined as a string to be overridden', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi again!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi again!');
						done();
					});
				});

				it('should render a partial defined as an object', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should cache a partial defined as an object', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should allow a cached partial defined as an object to be overridden', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: [ 'Hi again!' ] } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi again!');
						done();
					});
				});

				it('should render a partial defined as a file', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'partial!rvc/partial' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should cache a partial defined as a file', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should not try to autoload the partial', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>');
						done();
					});
				});

				it('should allow the default partial to be overridden', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' }, partials: { partial: 'Hi there!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should cache the correct partial', function (done) {
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
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
					app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should allow an autoloaded partial to be overridden', function (done) {
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');
						done();
					});
				});

				it('should not autoload the partial', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial.html', { data: { name: 'Word' }, partials: { partial: 'Hi!' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi!');

						app.render('rvc/template-partial.html', { data: { name: 'Word' } }, function (err, html) {
							expect(html).to.equal('<p>Hello Word!</p>Hi!');
							done();
						});
					});
				});

				it('should allow the default partial to be overridden', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});

				it('should cache the correct partial', function (done) {
					app.render('rvc/template-partial-2.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>Hi there!');
						done();
					});
				});
			});
		});

		describe('components', function () {
			it('should render a component defined as an object', function (done) {
				ractiveRender.clearCache();
				app.render('rvc/template-component.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{var}}', data: { var: 123 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should cache a component defined as an object', function (done) {
				app.render('rvc/template-component.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should allow a cached component defined as an object to be overridden', function (done) {
				app.render('rvc/template-component.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{xyz}}', data: { xyz: 456 } }) } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>456');
					done();
				});
			});

			it('should render a component defined as a file', function (done) {
				ractiveRender.clearCache();
				app.render('rvc/template-component.html', { data: { name: 'Word' }, components: { comp: 'rvc/component' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			it('should cache a component defined as a file', function (done) {
				app.render('rvc/template-component.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<p>Hello Word!</p>123');
					done();
				});
			});

			describe('imported components', function () {
				it('should render a component imported via link', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-import.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should cache a component imported via link', function (done) {
					app.render('rvc/template-import.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should render a component imported via require', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-require.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should cache  a component imported via require', function (done) {
					app.render('rvc/template-require.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>123');
						done();
					});
				});

				it('should allow the imported component to be overridden', function (done) {
					ractiveRender.clearCache();
					app.render('rvc/template-require.html', { data: { name: 'Word' }, components: { comp: Ractive.extend({ 'template': '{{xyz}}', data: { xyz: 456 } }) } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>456');
						done();
					});
				});

				it('should cache the correct component', function (done) {
					app.render('rvc/template-require.html', { data: { name: 'Word' } }, function (err, html) {
						if (err) {
							done(err);
						}

						expect(html).to.equal('<p>Hello Word!</p>456');
						done();
					});
				});
			});
		});

		describe('wrap', function () {
			it('should render the component', function (done) {
				app.render('rvc/template.html', { data: { name: 'Word' }, wrapper: 'rvc/wrapper.html', el: 'el' }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<div id="el"><p>Hello Word!</p></div><div class="my-cl"></div><span></span>');
					done();
				});
			});

			it('should cache the correct template', function (done) {
				app.render('rvc/template.html', { data: { name: 'Word' } }, function (err, html) {
					if (err) {
						done(err);
					}

					expect(html).to.equal('<div id="el"><p>Hello Word!</p></div><div class="my-cl"></div><span></span>');
					done();
				});
			});
		});
	});
});

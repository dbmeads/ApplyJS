(function (root, apply) {
	'use strict';

	describe('apply.mixins.view.renderer.dynamic', function () {

		var View = apply.View(apply.mixins.view.renderer.dynamic);

		it('should accept a view and attach that view to the container element by default', function () {
			var view = View.singleton();

			view.render(apply.View({
				source: '<span>hi</span>'
			}).singleton());

			expect(view.$el.html()).toBe('<span>hi</span>');
		});

		it('should accept an "attachTo" selector that the dynamic view will be placed in', function () {
			var view = View({
				source: '<div><div class="dynamic"></div></div>',
				attachTo: '.dynamic'
			}).singleton();

			view.render(apply.View({
				source: '<span>hi</span>'
			}).singleton());

			expect(view.$el.html()).toBe('<div class="dynamic"><span>hi</span></div>');
		});

		it('should not attempt to render an undefined view', function () {
			var view = View.singleton();

			view.render();

			expect(view.$el.html()).toBe('');
		});

	});
})(this, this.apply);
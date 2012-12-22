(function (root, undefined) {
	'use strict';

	var xhr;

	root.xhr = {
		spy: function () {
			if (!jasmine.isSpy(root.XMLHttpRequest)) {
				xhr = jasmine.createSpyObj('', ['open', 'send']);
				spyOn(root, 'XMLHttpRequest').andCallFake(function () {
					return xhr;
				});
			}
			return xhr;
		},
		open: function (status, response) {
			this.spy();
			xhr.open = function () {
				this.status = status;
				this.responseText = response;
			};
		}
	};
})(this);
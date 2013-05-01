(function (root) {
	'use strict';

	root.xhr = {
		spy: function (status, response) {
			var xhr = {
				open: function (method, url, async) {
					this.async = async;
				},
				send: function () {
					this.status = status;
					this.readyState = 4;
					if (status === 200) {
						this.responseText = response;
						if (this.async && this.onload) {
							this.onload();
						}
					} else {
						this.statusText = response;
					}
				}
			};

			spyOn(xhr, 'open').andCallThrough();

			if (!jasmine.isSpy(root.XMLHttpRequest)) {
				spyOn(root, 'XMLHttpRequest').andCallFake(function () {
					return xhr;
				});
			}
			return xhr;
		}
	};
})(this);
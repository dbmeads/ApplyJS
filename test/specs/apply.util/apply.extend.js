(function (root, apply) {
	'use strict';

	describe('apply.extend', function () {

		var obj, obj1;

		beforeEach(function () {
			obj = {
				deep: {
					prop1: 'prop1'
				}
			};
			obj1 = {
				prop1: 'obj1',
				prop2: 'obj1'
			};
		});

		it('should set properties on the passed object', function () {
			apply.extend(obj, obj1);

			expect(obj.prop1).toBe('obj1');
		});

		it('should ba able to extend using multiple src objects applied in argument order', function () {
			apply.extend(obj, obj1, {
				prop2: 'obj2'
			});

			expect(obj.prop1).toBe('obj1');
			expect(obj.prop2).toBe('obj2');
		});

		it('should return the object that was just extended', function () {
			expect(apply.extend(obj, obj1)).toBe(obj);
		});

		it('should support deep extending', function () {
			var deep = {
				deep: {
					prop2: 'prop2'
				}
			};

			apply.extend(true, obj, deep);

			expect(obj.deep.prop1).toBe('prop1');
			expect(obj.deep.prop2).toBe('prop2');
		});

	});
})(this, this.apply);
(function($) {
	//变量定义（外部不可访问）
	var settings = {};
	//公开方法
	var methods = {
		init : function(options){
			//初始化插件当前元素的变量空间
			settings[$(this).selector] = {};

			var defaults = {
				'valueProperty':'id',
				'htmlProperty':'name'
			};
			//初始化变量
			settings[$(this).selector] = $.extend(defaults, options);

			var _this = this;
			return this.each(function(){

				settings[$(_this).selector][0] = this;
				
				var iSelector = $('<div class="ding-input-selector"></div>');
				iSelector.width($(this).outerWidth(true));
				$(this).after(iSelector);

				$(this).on("focus",function(){
					if(!$.isEmpty($(this).val()))
						methods['request']();
				});

				$(this).on("keyup",function(){
					if(!$.isEmpty($(this).val()))
						methods['request']();
				});
			});
		},
		request : function(){
			$.getJSON(settings.url,settings.params,function(result){
				console.log(result.data);
			});
		}
	};

	$.fn.inputSelector = function(options){

		var method = arguments[0];
 
		if(methods[method]) {
			method = methods[method];
			// 我们的方法是作为参数传入的，把它从参数列表中删除，因为调用方法时并不需要它
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if( typeof(method) == 'object' || !method ) {
			method = methods.init;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.inputSelector' );
			return this;
		}
 
		// 用apply方法来调用我们的方法并传入参数
		return method.apply(this, arguments);
		
	};
	
})(jQuery);
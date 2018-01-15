(function($) {
	//变量定义（外部不可访问）
	var settings = {};
	//私有方法
	var private_methods = {
		init : function(options){
			//初始化插件当前元素的变量空间
			settings[$(this).selector] = {};

			var defaults = {
				'valueProperty':'id',//选择器的value字段名
				'htmlProperty':'name',//选择器的显示在界面的字段名
				'dataProperty':'data',//展示的内容储存于返回结果的哪个字段，可以是字符串变量（默认储存在data中），也可是数组（若是数组，返回结果后会先进行遍历递归，获取展示的数组数据）
				'iSelector':$('<div class="ding-input-selector"></div>')
			};
			//初始化变量
			settings[$(this).selector] = $.extend(defaults, options);

			var _this = this;
			return this.each(function(){

				settings[$(_this).selector][0] = this;
				
				settings[$(_this).selector].iSelector.width($(this).outerWidth(true));
				$(this).after(settings[$(_this).selector].iSelector);

				$(this).on("keyup",function(){
					if(!$.isEmpty($(this).val()))
						private_methods['request']($(this).val(),$(_this).selector);
				});
			});
		},
		request : function(val,selector){
			$.getJSON(settings[selector].url,settings[selector].params,function(result){//返回结果默认储存在result.data中
				var dataList;
				if($.isArray(settings[selector])){

				}
				else{
					dataList = result.data;
				}

				var valueProperty = settings[selector].valueProperty;
				var htmlProperty = settings[selector].htmlProperty;
				var iSelector = settings[selector].iSelector;
				if(!$.isEmpty(dataList)){
					for(var i=0;i<dataList.length;i++){
						var data = dataList[i];
						var option = $('<div class="ding-input-selector-option" option="'+data[valueProperty]+'">'+data[htmlProperty]+'</div>');
						iSelector.append(option);
					}
				}
			});
		}
	};

	//公开方法
	var methods = {
		request : function(){
			private_methods.request($(this).val,$(this).selector);
		}
	};

	$.fn.inputSelector = function(options){

		var method = arguments[0];
 
		if(methods[method]) {
			method = methods[method];
			// 我们的方法是作为参数传入的，把它从参数列表中删除，因为调用方法时并不需要它
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if( typeof(method) == 'object' || !method ) {
			method = private_methods.init;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.inputSelector' );
			return this;
		}
 
		// 用apply方法来调用我们的方法并传入参数
		return method.apply(this, arguments);
		
	};
	
})(jQuery);
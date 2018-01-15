// (function($) {
// 	//变量定义（外部不可访问）
// 	var settings = {};
// 	//私有方法
// 	var private_methods = {
// 		init : function(options){
// 			//初始化插件当前元素的变量空间
// 			settings[$(this).selector] = {};

// 			var defaults = {
// 				'valueProperty':'id',//选择器的value字段名
// 				'htmlProperty':'name',//选择器的显示在界面的字段名
// 				'dataProperty':'data',//展示的内容储存于返回结果的哪个字段，可以是字符串变量（默认储存在data中），也可是数组（若是数组，返回结果后会先进行遍历递归，获取展示的数组数据）
// 				'iSelector':$('<div class="ding-input-selector"></div>')
// 			};
// 			//初始化变量
// 			settings[$(this).selector] = $.extend(defaults, options);

// 			var _this = this;
// 			return this.each(function(){

// 				settings[$(_this).selector][0] = this;
				
// 				settings[$(_this).selector].iSelector.width($(this).outerWidth(true));
// 				$(this).after(settings[$(_this).selector].iSelector);

// 				$(this).on("keyup",function(){
// 					if(!$.isEmpty($(this).val()))
// 						private_methods['request']($(this).val(),$(_this).selector);
// 				});
// 			});
// 		},
// 		request : function(val,selector){
// 			$.getJSON(settings[selector].url,settings[selector].params,function(result){//返回结果默认储存在result.data中
// 				var dataList;
// 				if($.isArray(settings[selector])){

// 				}
// 				else{
// 					dataList = result.data;
// 				}

// 				var valueProperty = settings[selector].valueProperty;
// 				var htmlProperty = settings[selector].htmlProperty;
// 				var iSelector = settings[selector].iSelector;
// 				if(!$.isEmpty(dataList)){
// 					for(var i=0;i<dataList.length;i++){
// 						var data = dataList[i];
// 						var option = $('<div class="ding-input-selector-option" option="'+data[valueProperty]+'">'+data[htmlProperty]+'</div>');
// 						iSelector.append(option);
// 					}
// 				}
// 			});
// 		}
// 	};

// 	//公开方法
// 	var methods = {
// 		request : function(){
// 			private_methods.request($(this).val,$(this).selector);
// 		}
// 	};

// 	$.fn.imgPreview = function(options){

// 		var method = arguments[0];
 
// 		if(methods[method]) {
// 			method = methods[method];
// 			// 我们的方法是作为参数传入的，把它从参数列表中删除，因为调用方法时并不需要它
// 			arguments = Array.prototype.slice.call(arguments, 1);
// 		} else if( typeof(method) == 'object' || !method ) {
// 			method = private_methods.init;
// 		} else {
// 			$.error( 'Method ' +  method + ' does not exist on jQuery.inputSelector' );
// 			return this;
// 		}
 
// 		// 用apply方法来调用我们的方法并传入参数
// 		return method.apply(this, arguments);
		
// 	};
	
// })(jQuery);

//点击到中图
var midChangeHandler = null;   

function initSmallImg(){
    $("#imageMenu li img").bind("click", function(){
        if ($(this).attr("id") != "onlickImg") {
            midChange($(this).attr("src").replace("small", "mid"));
            $("#imageMenu li").removeAttr("id");
            $(this).parent().attr("id", "onlickImg");
        }
    }).bind("mouseover", function(){
        if ($(this).attr("id") != "onlickImg") {
            window.clearTimeout(midChangeHandler);
            midChange($(this).attr("src").replace("small", "mid"));
            $(this).css({ "border": "3px solid #959595" });
        }
    }).bind("mouseout", function(){
        if($(this).attr("id") != "onlickImg"){
            $(this).removeAttr("style");
            midChangeHandler = window.setTimeout(function(){
                midChange($("#onlickImg img").attr("src").replace("small", "mid"));
            }, 1000);
        }
    });
}

function midChange(src) {
    $("#midimg").attr("src", src).load(function() {
        changeViewImg();
    });
}

function changeViewImg() {
    $("#bigView img").attr("src", $("#midimg").attr("src"));
}

$(document).ready(function(){
	// 图片上下滚动
	// var count = $("#imageMenu li").length - 5; /* 显示 6 个 li标签内容 */
	var interval = $("#imageMenu li:first").width();
	var curIndex = 0;
	
	$('.scrollbutton').click(function(){
		if( $(this).hasClass('disabled') ) return false;
		
		if ($(this).hasClass('smallImgUp')) {
            if(curIndex == 0){
                return false;
            }
            else{
                --curIndex;
            }
        }
		else {
            if (curIndex == $("#imageMenu li").length-1) 
                return false;
            else
                ++curIndex;
        }
		
		$('.scrollbutton').removeClass('disabled');
		if (curIndex == 0) $('.smallImgUp').addClass('disabled');
		if (curIndex == $("#imageMenu li").length) $('.smallImgDown').addClass('disabled');
		$("#imageMenu ul").stop(false, true).animate({"marginLeft" : -curIndex*$("#imageMenu li:first").width() + "px"}, 600);
	});	
	// 解决 ie6 select框 问题
	$.fn.decorateIframe = function(options) {
        // if ($.browser.msie && $.browser.version < 7) {
            var opts = $.extend({}, $.fn.decorateIframe.defaults, options);
            $(this).each(function() {
                var $myThis = $(this);
                //创建一个IFRAME
                var divIframe = $("<iframe />");
                divIframe.attr("id", opts.iframeId);
                divIframe.css("position", "absolute");
                divIframe.css("display", "none");
                divIframe.css("display", "block");
                divIframe.css("z-index", opts.iframeZIndex);
                divIframe.css("border");
                divIframe.css("top", "0");
                divIframe.css("left", "0");
                if (opts.width == 0) {
                    divIframe.css("width", $myThis.width() + parseInt($myThis.css("padding")) * 2 + "px");
                }
                if (opts.height == 0) {
                    divIframe.css("height", $myThis.height() + parseInt($myThis.css("padding")) * 2 + "px");
                }
                divIframe.css("filter", "mask(color=#fff)");
                $myThis.append(divIframe);
            });
        // }
    }
    $.fn.decorateIframe.defaults = {
        iframeId: "decorateIframe1",
        iframeZIndex: -1,
        width: 0,
        height: 0
    }
    //放大镜视窗
    $("#bigView").decorateIframe();
    
	initSmallImg();
    
    
    //大视窗看图
    // function mouseover(e) {
    //     if($.isEmpty($("#midimg").attr("src"))) return; 
    //     if ($("#winSelector").css("display") == "none") {
    //         $("#winSelector,#bigView").show();
    //     }
    //     $("#winSelector").css(fixedPosition(e));
    //     e.stopPropagation();
    // }
    // function mouseOut(e) {
    //     if ($("#winSelector").css("display") != "none") {
    //         $("#winSelector,#bigView").hide();
    //     }
    //     e.stopPropagation();
    // }
    // $("#midimg").mouseover(mouseover); //中图事件
    // $("#midimg,#winSelector").mousemove(mouseover).mouseout(mouseOut); //选择器事件

    var $divWidth = $("#winSelector").width(); //选择器宽度
    var $divHeight = $("#winSelector").height(); //选择器高度
    var $imgWidth = $("#midimg").width(); //中图宽度
    var $imgHeight = $("#midimg").height(); //中图高度
    var $viewImgWidth = $viewImgHeight = $height = null; //IE加载后才能得到 大图宽度 大图高度 大图视窗高度

    
    $("#bigView").scrollLeft(0).scrollTop(0);
    function fixedPosition(e) {
        if (e == null) {
            return;
        }
        var $imgLeft = $("#midimg").offset().left; //中图左边距
        var $imgTop = $("#midimg").offset().top; //中图上边距
        X = e.pageX - $imgLeft - $divWidth / 2; //selector顶点坐标 X
        Y = e.pageY - $imgTop - $divHeight / 2; //selector顶点坐标 Y
        X = X < 0 ? 0 : X;
        Y = Y < 0 ? 0 : Y;
        X = X + $divWidth > $imgWidth ? $imgWidth - $divWidth : X;
        Y = Y + $divHeight > $imgHeight ? $imgHeight - $divHeight : Y;

        if ($viewImgWidth == null) {
            $viewImgWidth = $("#bigView img").outerWidth();
            $viewImgHeight = $("#bigView img").height();
            if ($viewImgWidth < 200 || $viewImgHeight < 200) {
                $viewImgWidth = $viewImgHeight = 800;
            }
            $height = $divHeight * $viewImgHeight / $imgHeight;
            $("#bigView").width($divWidth * $viewImgWidth / $imgWidth);
            $("#bigView").height($height);
        }
        var scrollX = X * $viewImgWidth / $imgWidth;
        var scrollY = Y * $viewImgHeight / $imgHeight;
        $("#bigView img").css({ "left": scrollX * -1, "top": scrollY * -1 });
        $("#bigView").css({ "left": $(".preview").width() + 35 });

        return { left: 50+X, top: Y };
    }
});
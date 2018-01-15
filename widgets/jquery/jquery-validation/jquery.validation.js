(function(){
	jQuery.fn.extend({
		validate:function(){
			var validateResult = true;
			var validations = this.find("[validations]");
			// 表单校验，待完善
			var focusIndex = 0;
			for(var i=0;i<validations.length;i++){
				if(!$(validations[i]).validationDistributor()){
					if(focusIndex==0){
						$(validations[i]).focus();
					}
					validateResult=false;
					focusIndex++;
				}
			}
			return validateResult;
		},
		validationDistributor:function(){
			var validationsStr = this.attr("validations");
			var validationTipsStr = this.attr("validationTips");
			//校验form中的validation 元素的 validations与validationtips是否存在空值,若一个存在,另外一个不存在,则throw 异常
			if(!$.isEmpty(validationsStr)&&!$.isEmpty(validationTipsStr)){
				//分割校验内容项
				var validations=validationsStr.split("&&");
	    		var validationTips=validationTipsStr.split("&&");
	    		//校验form中的validation 元素的 validations与validationtips长度是否对称
    			if(validations.length==validationTips.length){
					var result = true;
					var tips = "";

					if($.isEmpty(this.attr("bindEvent"))){
						this.attr("bindEvent",true);
						this.blur(changeValidation);
					}

	    			for(var i=0;i<validations.length;i++){
	    				var validationItems=validations[i].split("=");
						var validationItemKey=validationItems[0];//校验项方法名
						var validationItemValue=validationItems[1];//校验项比较值
						if($.isEmpty($[validationItemKey])){
							console.log("Error ! "+validationItemKey+"不支持此种校验方式!");
							return false;
						}
						else{
							if(!$[validationItemKey](this.val(),validationItemValue)){//校验不通过
								tips += " "+validationTips[i];
								result = false;
							}
						}
	    			}
	    			if(!result){
	    				this.addClass('validation_tips');
	    				this.tooltip({
							'placement':'bottom',
							'trigger':'hover',
							'title': tips
						});
	    			}
	    			else{
	    				this.tooltip('destroy');
						this.removeClass("validation_tips");
	    			}
	    			return result;
    			}
    			else{
    				console.log("Error ! "+this[0]+"表单中的校验项与校验提示不一致!");
					return false;
    			}
			}
			else{
				console.log("Error ! "+this[0]+"表单中的校验项与校验提示不能一个为空!");
				return false;
			}
		},
		validateSelect : function(val){
			this.empty();
			this.attr("onchange","changeValidateSelector(this)");
			this.css({
				"width":"50%",
				"float":"left",
				"margin-right":"5px"
			});
			this.append('<option value="">请选择</option>');
			this.append('<option value="required">非空校验</option>');
			this.append('<option value="vEmail">邮箱校验</option>');
			this.append('<option value="vPhone">手机号校验</option>');
			this.append('<option value="vPositiveInteger">只允许正整数</option>');
			this.append('<option value="vNum2Decimal">只允许数字（两位小数）</option>');
			this.append('<option value="vComplexMaxLength">最大输入字符串数量（中文字符）</option>');
			this.append('<option value="vComplexRegionLength">字符串数量区间（中文字符）</option>');

			if(!$.isEmpty(val)){
				var validation1,validation2;
				if(val.indexOf("=")!=0){
                    var validations = val.split("=");
                    validation1 = validations[0];
                    validation2 = validations[1];
                }
                else{
                    validation1 = val;
                }

                $(this).val(validation1);
				changeValidateSelector(this,validation2);
			}
		}
	});
})();

var addValidateSelectorMap = {
	'vComplexMaxLength' : '20',
	'vComplexRegionLength' : '5,20'
};

function changeValidateSelector(selector,limitVal){
	if(!$.isEmpty(addValidateSelectorMap[$(selector).val()])){
		var limitInput = $('<input class="form-control validate_selector_limit" style="width:20%;float:left;margin-right:5px;" type="text" validations="required" validationTips="限制条件不能为空" />');
		var nLimitInput = $(selector).next(".validate_selector_limit")[0];
		if($.isEmpty(nLimitInput)){
			$(selector).after(limitInput);
			limitInput.attr("placeholder",addValidateSelectorMap[$(selector).val()]);
			if(!$.isEmpty(limitVal)){
				limitInput.val(limitVal);	
			}
		}
		else{
			$(nLimitInput).attr("placeholder",addValidateSelectorMap[$(selector).val()]);
		}
	}
	else{
		var nLimitInput = $(selector).next(".validate_selector_limit")[0];
		if(!$.isEmpty(nLimitInput)){
			$(nLimitInput).remove();
		}
	}
}

function changeValidation(){
	var validationsStr = $(this).attr("validations");
	var validationTipsStr = $(this).attr("validationTips");
	var validations=validationsStr.split("&&");
	var validationTips=validationTipsStr.split("&&");

	var result = true;

	var tips = "";
	// 
	for(var i=0;i<validations.length;i++){
		var validationItems=validations[i].split("=");
		var validationItemKey=validationItems[0];//校验项方法名
		var validationItemValue=validationItems[1];//校验项比较值
		if($.isEmpty($[validationItemKey])){
			console.log("Error ! "+validationItemKey+"不支持此种校验方式!");
			return false;
		}
		else{
			if(!$[validationItemKey]($(this).val(),validationItemValue)){//校验不通过
				tips += " "+validationTips[i];
				result = false;
			}
		}
	}
	if(result){
		$(this).tooltip('destroy');
		$(this).removeClass('validation_tips');
	}
	else{
		$(this).addClass("validation_tips");
		$(this).attr('data-original-title',tips).tooltip('show');
	}
	return result;
}

function addValidationTips(selector,tips){
	$(selector).addClass("validation_tips");
	$(selector).tooltip({
		'placement':'bottom',
		'trigger':'hover',
		'title': tips
	});
}

function removeValidationTips(selector){
	$(selector).tooltip('destroy');
	$(selector).removeClass("validation_tips");
}
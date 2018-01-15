$.isUndefined = function(obj){
	return (typeof obj=="undefined");
},
//检查参数是否是null
$.isNull = function(obj){
	return (typeof obj=="object" && !obj);//
},
//检查对象和内容不为空
$.isEmpty = function(obj){
	return Ding.isUndefined(obj)||Ding.isNull(obj)||(typeof(obj)=="string"&&obj.trim()=="");
},
//检查参数是否是RegExp对象
$.isRegex = function(obj){
    return (typeof obj=="object" && obj.constructor==RegExp);
},
//检查参数是否是函数对象
$.isFunction = function(obj){
    return (typeof obj=="function");
},
//检查参数是否是数组
$.isArray = function(obj){
    return obj instanceof Array;
},
$.isDOMElement = function(obj){
	 return !!(obj && typeof window !== 'undefined' && (obj === window || obj.nodeType));
},
$.trim = function(val){
	return val.replace(/(^\s*)|(\s*$)/g,"");
};


//================校验=========================
var reg_phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
var reg_email = /^([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
var reg_special_ymbol = new RegExp("[`~!#$^&*()=|{}':;',\\[\\]<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]");
var reg_position_num =  /^[1-9]\d*$/;
var reg_int =  new RegExp("^-?\\d+$");
var reg_string =  /^[a-zA-z\u4E00-\u9FA5]*$/;
var reg_0_int = /^[0-9]*[1-9][0-9]*$/;
var reg_num_2_decimal = new RegExp("^[0-9]+(.[0-9]{2})?$");//两位小数点
var reg_num=/^[0-9]*$/;
var reg_decimal = /^[0-9]+(.[0-9]{1,15})?$/;
var reg_positive_decimal = /^\d+(?=\.{0,1}\d+$|$)/;
$.vSpecialSymbol = function(val){
	return !reg_special_ymbol.test(val);
};
$.vNum2Decimal = function(val){
	return reg_num_2_decimal.test(val);
};
$.required = function(val){
	return $.isEmpty(val)?false:true;
};
$.vPhone = function(val){
	return reg_phone.test(val);
};
$.vEmail = function(val){
	return reg_email.test(val);
};
$.vMaxLength = function(val,limit){
	return val.length<=limit;
};
/**
 * 校验最长字节长度，英文：1字节，中文：2字节
 * @param params
 */
$.vComplexMaxLength = function(val,limit){
	var i=0;
	var sum=0;
	while(i<val.length){
        if(val.charCodeAt(i)>0||val.charCodeAt(i)<255){
            sum++;
        }
        else{
            sum+=2;
        }
        i++;
    }
	return sum<=limit;
};

/*固定长度校验*/
$.vFixedLength = function(val,limit){
	return val.length==limit;
};
/*长度区间校验，如6,18*/
$.vComplexRegionLength = function(val,limit){
	var limits = limit.split(",");
	var min = limits[0];
	var max = limits[1];
	var i=0;
	var sum=0;
	while(i<val.length){
        if(val.charCodeAt(i)>0||val.charCodeAt(i)<255){
            sum++;
        }
        else{
            sum+=2;
        }
        i++;
    }
	return sum>min||sum<max;
};
/**自定义校验*/
$.vUserDefineCheck = function(val,func){
	return window[func](val);
};
//正整数校验
$.vPositiveInteger = function(val){
	if($.isEmpty(val)) return true;
	return reg_position_num.test(val);
};
//整数校验
$.vInteger = function(val){
	if($.isEmpty(val)) return true;
	return reg_int.test(val);
};
//字符串（排除数字，name用）
$.vCharacter = function(val){
	return reg_string.test(val);
};
//0和正整数校验
$.v0PositiveInteger = function(val){
	if($.isEmpty(val)) return true;
	return reg_0_int.test(val);
};
$.vNumber = function(val){
	if($.isEmpty(val)) return true;
	return reg_num.test(val);
};
$.vDecimalNumber = function(val){//验证数字（包括小数）
	if($.isEmpty(val)) return true;
	return reg_decimal.test(val);
};
$.vPositiveDecimalNumber = function(val){//验证正数（包括小数）
	if($.isEmpty(val)) return true;
	return reg_positive_decimal.test(val);
};
$.vIdNumber = function(code){
	var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
    var tip = "";
    var pass= true;
    
    if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
        tip = "身份证号格式错误";
        pass = false;
    }
    
   else if(!city[code.substr(0,2)]){
        tip = "地址编码错误";
        pass = false;
    }
    else{
        //18位身份证需要验证最后一位校验位
        if(code.length == 18){
            code = code.split('');
            //∑(ai×Wi)(mod 11)
            //加权因子
            var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
            //校验位
            var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++)
            {
                ai = code[i];
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            if(parity[sum % 11] != code[17]){
                tip = "校验位错误";
                pass =false;
            }
        }
    }
    // if(!pass) alert(tip);
    return pass;
};
// /**
//  * 组件地址选择器校验
//  */
// vAddressSelectorNotNull:function(params){
// 	var component=params.component;
// 	//判断省与市不能为空
// 	var selectors=component.children("select");
// 	var province=selectors[0];
// 	var city=selectors[1];
// 	if($(province).val()==0||$(city).val()==0){
// 		return false;
// 	}
// 	else{
// 		return true;
// 	}
// },
	// 	vNumber:function(params){
	// 		var reg=/^[0-9]*$/;
	// 		return reg.test(params.component.value);
	// 	},
	// 	vDecimalNumber:function(params){//验证数字（包括小数）
	// 		var reg = /^[0-9]+(.[0-9]{1,15})?$/;
	// 		if(!Ding.isUndefined(params.component)){
	// 			return reg.test(params.component.value);
	// 		}
	// 		if(!Ding.isEmpty(params.value)){
	// 			return reg.test(params.value);
	// 		}
	// 	},
	// 	/**
	// 	 * 身份证校验
	// 	 */
	// 	vIdNumber:function(params){
	// 		var reg=/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
	// 		return reg.test(params.component.value);
	// 	},
	// 	
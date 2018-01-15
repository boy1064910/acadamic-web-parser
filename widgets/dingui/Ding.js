// document.onkeypress = function(){
// 	if(event.keyCode == 13){
// 		return false;
// 	}
// };

(function(){
	/*给函数原型增加一个extend函数，实现继承*/  
    Function.prototype.extend = function(superClass){  
        if(typeof superClass !== 'function'){  
            throw new Error('fatal error:Function.prototype.extend expects a constructor of class');  
        }  
        for(var p in superClass.prototype){
        	this.prototype[p] = superClass.prototype[p];
        }
	    this.superClass = superClass;//同时，添加一个指向父类构造函数的引用，方便调用父类方法或者调用父类构造函数 
    };    

	String.prototype.trim=function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};
	String.prototype.replaceAll  = function(s1,s2){
		return this.replace(new RegExp(s1,"gm"),s2);
	};
	Date.prototype.format = function(format)
	{
		var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
		}
		if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
		(this.getFullYear()+"").substr(4 - RegExp.$1.length));
		for(var k in o)if(new RegExp("("+ k +")").test(format))
		format = format.replace(RegExp.$1,
		RegExp.$1.length==1 ? o[k] :
		("00"+ o[k]).substr((""+ o[k]).length));
		return format;
	}
})(document);

(function(){
	//页面解析器
	Parser = {
		parseResult : false,
		parse : function(){		
			if(this.parseResult) return;//若已解析，无需再次解析
			//页面解析规则，解析Ding-（A-Z)*规则的样式
			
			var element,elements = Ding.getClass(/(Ding-)([A-Z]{1})\w+/);

			var parserList = {
				'Ding-Datagrid':[],
				'Ding-SlideBox':[],
				'Ding-Uploader':[],
				'Ding-ImgUploader':[],
				'Ding-InputSelector':[],
				'Ding-Selector':[],
				'Ding-SelectorInput':[],
				'Ding-Form':[]
			};

			for(var i=0,len = elements.length;i<len;i++){
				element = elements[i];
				var id = element.getAttribute("id");
				if(!Ding.isEmpty(id)){
					for(var j in parserList){
						if(element.className.indexOf(j)!=-1){
							parserList[j].push(element);
							break;
						}
					}
				}
			};
			for(var i in parserList){
				for(var j=0;j<parserList[i].length;j++){
					var temElement = parserList[i][j];		
					var clazzName = (temElement.className.match(/(Ding-)([A-Z]{1})\w+/))[0].replace("-","\.");
					var id = temElement.getAttribute("id");
					D("#"+id,clazzName);//Ding.A*
				}
			}
			this.parseResult = true;//解析成功，改变解析状态值
		},
		manualParse : function(selector){//手动解析组件
			if(typeof(selector)=="object"){
				var clazzName = (selector.className.match(/(Ding-)([A-Z]{1})\w+/))[0].replace("-","\.");
				D("#"+selector.id,clazzName);
			}
			else{
				var temElement = document.getElementById(selector);
				var clazzName = (temElement.className.match(/(Ding-)([A-Z]{1})\w+/))[0].replace("-","\.");
				D("#"+selector,clazzName);
			}
		}
	};
	//缓存组件Cache
	Cache = {};
	DingUniqueId = 0;
	//快捷方式
	D = function(selector,className){
		return Ding.isEmpty(Cache[selector]) ? (
			Ding.isEmpty(className) ? 
				(Cache[selector] = new Ding(selector)) 
				: 
				(Cache[selector] = eval("new "+className+"('"+selector+"')"))
		):(
			Cache[selector]
		);
	},
	//Ding父类
	Ding = function(selector){
		if(typeof(selector)==="object"){
			throw "selector can not be an object!";
		}
		else{
			this.selector = selector;
			// 处理#id 选择器
			if ( selector.indexOf("#")==0 ) {
				this[0] = document.getElementById( selector.substring(1) );
				if(Ding.isEmpty(this[0])){
					console.log("html中不存在id="+selector.substring(1)+"的元素");
					Cache[selector] = null;//清空Cache的数据
				}
			}
			else if(selector.indexOf(".")==0){
				this[0] = Ding.getClass(selector.substring(1));
			}
			// 处理name 选择器
			else{
				this[0] = document.getElementsByName( selector );
			}
		}
	},
	//Ding.prototype主要是Ding的所有子类公共的方法
	Ding.prototype = {
		getStyle : function(attribute){
			var val = this[0].currentStyle ? this[0].currentStyle[attribute]:document.defaultView.getComputedStyle(this[0],false)[attribute];
			return val.toString().indexOf("px") !=-1 ? parseFloat(val.substring(0,val.toString().indexOf("px"))) : val;
		},
		width : function(val){
			return !Ding.isUndefined(val) ? (
				val.toString().indexOf('px') !=-1 ? (this[0].style.width = val) : (this[0].style.width = val + 'px')
			) : (
				this.getStyle('width')
			);
		},
		height : function(val){
			return !Ding.isUndefined(val) ? (
				val.toString().indexOf('px') !=-1 ? (this[0].style.height = val) : (this[0].style.height = val + 'px')
			) : (
				this.getStyle('height')
			);
		},
		center : function(){
			this[0].style.top = (document.body.clientHeight - this.height())/2 + "px";
			this[0].style.left = (document.body.clientWidth - this.width())/2 + "px";
		},
		show : function(){
			this[0].style.display = "block";
		},
		hide : function(){
			this[0].style.display = "none";
		},
		
		val : function(val){
			if(Ding.isEmpty(this[0])){
				console.log("调用val()的对象为null!");
				return;
			}
			if(!Ding.isUndefined(val)){
				this[0].value = val;
				return ;
			}
			else{
				return this[0].value;
			}
		},
		clearVal : function(){
			this[0].value = "";
		},
		html : function(htmler){
			if(Ding.isEmpty(this[0])){
				console.log("调用html()的对象为null!");
				return;
			}
			if(!Ding.isUndefined(htmler)){
				this[0].innerHTML = htmler;
				return ;
			}
			else{
				return this[0].innerHTML;
			}
		},
		empty : function(){
			this[0].value = "";
		},
		removeAll : function(){
			this[0].innerHTML = "";
		},
		index : function(){
			var index = null;
			var parent = this[0].parentNode;
			for(var i=0,len=parent.children.length;i<len;i++){
				if(this[0]==parent.children[i]){
					index = i;
					break;
				}
			}
			return index;
		},
		hasClass : function(className){
			var classNames = this[0].className.split(" ");
			var newClassName = "";
			var isExsit = false;
			for(var i=0,length=classNames.length;i<length;i++){
				if(className==classNames[i]){
					isExsit = true;
					break;
				}
			}
			return isExsit;
		},
		addClass : function(className){
			var classNames = this[0].className.split(" ");
			var newClassName = "";
			var isExsit = false;
			for(var i=0,length=classNames.length;i<length;i++){
				if(className==classNames[i]){
					isExsit = true;
					break;
				}
			}
			if(!isExsit){//如果class name不存在
				this[0].className = this[0].className+" "+className;
			}
		},
		removeClass : function(className){
			var classNames = this[0].className.split(" ");
			var newClassName = "";
			var isExsit = false;
			for(var i=0,length=classNames.length;i<length;i++){
				if(className==classNames[i]){
					isExsit = true;
					exsitIndex=i;
				}
				else
					newClassName+=classNames[i]+" ";
			}
			if(isExsit){
				this[0].className = newClassName;
			}
		},
		after : function(domer){
			var index = this.index();
			var length = this[0].parentNode.children.length;
			if(index+1<length){
				this[0].parentNode.insertBefore(domer,this[0].parentNode.children[index+1]);
			}
			else{
				this[0].parentNode.appendChild(domer);
			}
		},
		append : function(domer){
			this[0].appendChild(domer);
		}
	}
})(document);

//==========================静态方法区域=============================
(function(){
	//页面加载完毕之后将会解析页面所有的Ding-[A-Z]组件
	Ding.ready = function(func){
		 if(document.attachEvent){ 
　　　　	document.onreadystatechange=function(){  
				if(document.readyState == 'loaded'||document.readyState=="complete"||document.readyState=='interactive'){   
					Parser.parse();
					func(); 
				} 
　　　　	}; 
　　　　} 
　　　　else{   
			document.addEventListener("DOMContentLoaded",function(){
				Parser.parse();
				func();
			},false);   //非IE  
　　　　} 
	},
	//通过className获取元素
	Ding.getClass = function(className,tagName,father){
		tagName = tagName || "*";
		father = Ding.isEmpty(father) ? document.body : father;
		var elements = father.getElementsByTagName(tagName);
		var result = [];
		var reg=/^[0-9]*$/;//遍历getTag此方法，返回的是数组，取key为数字的元素，其他元素过滤，避免重复
		if(Ding.isRegex(className)){
			for(var e in elements){
				if(reg.test(e)&&className.test(elements[e].className)){					
					result.push(elements[e]);
				}
			}
		}
		else{
			for(var i=0,len=elements.length;i<len;i++){
				if(elements[i].className.indexOf(className)!=-1){
					result.push(elements[i]);
				}
			}
		}
		return result;
	},
	Ding.hasClass = function(domer,className){
		var classNames = domer.className.split(" ");
		var newClassName = "";
		var isExsit = false;
		for(var i=0,length=classNames.length;i<length;i++){
			if(className==classNames[i]){
				isExsit = true;
				break;
			}
		}
		return isExsit;
	},
	Ding.addClass = function(domer,className){
		var classNames = domer.className.split(" ");
		var newClassName = "";
		var isExsit = false;
		for(var i=0,length=classNames.length;i<length;i++){
			if(className==classNames[i]){
				isExsit = true;
				break;
			}
		}
		if(!isExsit){//如果class name不存在
			domer.className = domer.className+" "+className;
		}
	},
	Ding.removeClass = function(domer,className){
		var classNames = domer.className.split(" ");
		var newClassName = "";
		var isExsit = false;
		for(var i=0,length=classNames.length;i<length;i++){
			if(className==classNames[i]){
				isExsit = true;
				exsitIndex=i;
			}
			else{
				if(i<length-1)
					newClassName+=classNames[i]+" ";
				else
					newClassName+=classNames[i];
			}
		}
		if(isExsit){
			domer.className = newClassName;
		}
	},
	Ding.getChildrenByClass = function(className,tagName,father){
		if(Ding.isEmpty(className))
			throw new Error("参数className(样式名称)不能为空！");
		if(Ding.isEmpty(tagName))
			throw new Error("参数tagName(标签名称)不能为空！");
		if(Ding.isEmpty(father))
			throw new Error("参数father(父级元素)不能为空！");
		var elements = father.children;
		var result = [];
		if(Ding.isRegex(className)){
			for(var i=0,len=elements.length;i<len;i++){
				if(elements[i].tagName==tagName.toUpperCase()&&className.test(elements[i].className))
					result.push(elements[i]);
			}
		}
		else{
			for(var i=0,len=elements.length;i<len;i++){
				if(elements[i].tagName==tagName.toUpperCase()&&elements[i].className.indexOf(className)!=-1){
					result.push(elements[i]);
				}
			}
		}
		return result;
	},
	//递归根据属性名称查找元素
	Ding.find = function(attributeName,father,result){
		if(Ding.isUndefined(result))
			result = [];
		for(var i=0;i<father.childNodes.length;i++){
			var child = father.childNodes[i];
			if(typeof(child.getAttribute)!="undefined"){
				if(child.childNodes.length>0){
					result = Ding.find(attributeName,child,result);
				}
				Ding.isEmpty(child.getAttribute(attributeName))?
				""
				:
				(
					result.push(child)
				)
			}
		}
		return result;
	},
	Ding.index = function(elem){
		var index = null;
		var parent = elem.parentNode;
		for(var i=0,len=parent.children.length;i<len;i++){
			if(elem==parent.children[i]){
				index = i;
				break;
			}
		}
		return index;
	},
	Ding.serialize = function(domer,params){
		if(Ding.isEmpty(params))
			params = {};
		for(var i=0;i<domer.childNodes.length;i++){
			var child = domer.childNodes[i];
			if(typeof(child.getAttribute)!="undefined"){
				if(child.childNodes.length>0){
					params = Ding.serialize(child,params);
				}
				if(!Ding.isEmpty(child.getAttribute("name"))){
					if(child.getAttribute("type")=="checkbox"){
						child.checked ? (//若是checkbox，如果属于勾选状态，则加入参数序列化中
							//如果参数对象并没有包括此表单项，则设置参数对象[key]=表单项的值
							//如果参数对象已经有了表单项的值，则判断是否数组类型，非数组类型的话则取出已有的值跟当前的值组装成一个数组，数组类型的话，则继续添加表单项的值到数组当中
							Ding.isEmpty(params[child.getAttribute("name")]) ? params[child.getAttribute("name")] = child.value : (
								Ding.changeToArray(params,child.getAttribute("name"),child.value)
							)
						) : (
							//表单中复选框的属性unCheckValue不为空的时候，才会提交此数据
							Ding.isEmpty(child.getAttribute("unCheckValue")) ? "" : params[child.getAttribute("name")] = child.getAttribute("unCheckValue")
						)
					}
					else if(child.getAttribute("type")=="radio"){
						if(child.checked){
							params[child.getAttribute("name")] = child.value;
						}
					}
					else{
						Ding.isUndefined(params[child.getAttribute("name")]) ? params[child.getAttribute("name")] = child.value : (
							Ding.changeToArray(params,child.getAttribute("name"),child.value)
						);
					}
				}
			}
		}
		return params;
	},
	/**
	* 若是params[key]是数组，则在数组的情况下拓展追加数据，若不是数组，则将params[key]转换为数组，同时将原有的数据和新加的数据添加到数组当中
	*/
	Ding.changeToArray = function(params,key,value){
		Ding.isArray(params[key]) ? (
			params[key].push(value)
		) : (
			tmpParam = params[key],
			params[key] = new Array(),
			params[key].push(tmpParam),
			params[key].push(value)
		)
	},
	Ding.getQueryParameterByName = function(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		return r!=null ? unescape(r[2]): null;
	},
	Ding.randomId = function(len){
		len = len || 32;
		var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';   
		var maxPos = chars.length;
		var pwd = '';
		for (i = 0; i < len; i++) {
			pwd += chars.charAt(Math.floor(Math.random() * maxPos));
	    }
	    return pwd;
	},
	Ding.fileSubfixName = function(filename){
		var pos = filename.lastIndexOf('.')
	    var suffix = ''
	    if (pos != -1) {
	        suffix = filename.substring(pos)
	    }
	    return suffix;
	},
	Ding.trim = function(str){
		return str.replace(/(^\s*)|(\s*$)/g,"");
	},
	/**ajax请求,使用数组参数主要便于扩展
	 * @param config	ajax默认配置参数
	 * 	url				:	ajax请求路径
	 * 	params			:	参数
	 *	paramsType		: 	参数类型，默认是json
	 * 	async			:	请求方式,默认:true(异步)
	 * 	method			:	提交方式,默认:get
	 * 	dataType		:	数据格式,默认:json
	 * 	successCallback	:	成功请求回调函数
	 *	failCallback	:	失败请求回调函数
	 * 	errorCallback	:	网络错误请求回调函数
	 * 	showLoadingMask	:	是否显示loading浮层,默认:false
	 * 	isNeedAlert		:	是否弹出提示文本框,默认:false
	 * 	msgName			:	返回数据格式的提示信息的key,默认:msg	 
	*/
	Ding.ajax = function(config){
		var result = null;
		config = Ding.ajax.preConfig(config);
		var loadingMask;
		if(config.showLoadingMask&&typeof(whir)!="undefined"){
			whir.loading.add();
			// loadingMask = new Ding.LoadingMask();
		}
		//准备参数
		var params = "";
		if(config.paramsType=="json"){
			for(var i in config.params)
	    		params += i+"="+encodeURIComponent(config.params[i])+"&";
		}
	    else{
	    	params = config.params;
	    }
	    //当请求为get的时候，拼接参数
	    if(config.method.toUpperCase()=="GET"){
	    	if(config.url.indexOf('?')==-1){//不存在?
	    		if(!Ding.isEmpty(params)){
	    			config.url+="?"+params;
	    		}
	    	}
	    	else{
	    		config.url+="&"+params;
	    	}
	    }

		//1.创建对象
	   	var oAjax = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	    //2.连接服务器  
	    oAjax.open(config.method, config.url, config.async);   //open(方法, url, 是否异步)
	    oAjax.setRequestHeader("X-Requested-With","XMLHttpRequest");
	    oAjax.setRequestHeader("xfsw-session",Ding.getCookie("xfsw-session"));
	    if(config.method.toUpperCase()=="POST")
	    	oAjax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	    // 3.接收返回
	    oAjax.onreadystatechange = function(){  //OnReadyStateChange事件
	        if(oAjax.readyState == 4){  //4为完成
	            if(oAjax.status == 200){    //200为成功
	            	if(config.showLoadingMask&&typeof(whir)!="undefined"){
	            		whir.loading.remove();
	            		// loadingMask.close();
	            	}
	            	var f = null;
	            	if(config.dataType=="json"){
	            		var json = eval("("+oAjax.responseText+")");
	            		// console.log(oAjax.responseText);
	            		// var json  = oAjax.responseText.parseJSON();
	            		// var json = JSON.parse(oAjax.responseText);
	            		if(!Ding.isEmpty(Ding.ajaxComplete)){//页面可自定义ajax完成处理
	            			Ding.ajaxComplete(json);
	            		}
	            		//TODO:不需要做校验，result是每个项目个性化的内容，应该在每个项目当中自己单独处理
	            		//Ding组件，默认处理两个状态码，剩下的状态码默认提示错误--2016-10-09-lxp
	            		if(json.code == 200){
							config.successCallback ? 
							result = Ding.isFunction(config.successCallback) ? config.successCallback(json) : (f = eval(config.successCallback),f(json)) : "";
						}
						else if(json.code == 1004){
							window.location.href = "/login.html?returnUrl="+window.location.href;
						}
						else{
							config.failCallback ? 
							result = Ding.isFunction(config.failCallback) ? config.failCallback(json) : (f = eval(config.failCallback),f(json)) : ""
						}
	            	}
	            	else if(config.dataType=="file"){
	            		var json = eval("("+oAjax.responseText+")");
	            		config.successCallback ? result = Ding.isFunction(config.successCallback) ? config.successCallback(json) : (f = eval(config.successCallback),f(json)) : ""
	            	}
	                else
	                	result = Ding.isFunction(config.successCallback) ? config.successCallback(oAjax.responseText) : (f = eval(config.successCallback),f(oAjax.responseText));
	            }
	            else{
	                if(config.errorCallback){
	                	var f = null;
	                    Ding.isFunction(config.errorCallback) ? config.errorCallback() : (f = eval(config.errorCallback),f());
	                }
	            }
	        }
	    };
	    //4.发送请求  
	    if(config.method.toUpperCase()=="POST"){
	    	oAjax.send(params);
	    }
		else
			oAjax.send(null);
	    
	    return result;
	},
	//ajax默认配置参数预处理
	Ding.ajax.preConfig = function(config){
		if (Ding.isEmpty(config.method)) {
			config.method = "get";
		}
		if (Ding.isEmpty(config.paramsType)) {
			config.paramsType = "json";
		}
		if (Ding.isEmpty(config.async)) {
			config.async = true;
		}
		if (Ding.isEmpty(config.dataType)) {
			config.dataType = "json";
		}
		if (Ding.isEmpty(config.cache)) {
			config.cache = true;
		}
		if (Ding.isEmpty(config.isNeedAlert)) {
			config.isNeedAlert = false;
		} else {
			if (config.isNeedAlert && Ding.isEmpty(config.msgName)) {// 如果需要提示信息,并且返回数据的提示信息key为空的时候,默认配置为msg
				config.msgName = 'msg';
			}
		}
		if (Ding.isEmpty(config.showLoadingMask)) {
			config.showLoadingMask = true;
		}
		return config;
	},
	//检查参数是否是undefined
	Ding.isUndefined = function(obj){
		return (typeof obj=="undefined");
	},
	//检查参数是否是null
	Ding.isNull = function(obj){
		return (typeof obj=="object" && !obj);//
	},
	//检查对象和内容不为空
	Ding.isEmpty = function(obj){
		return Ding.isUndefined(obj)||Ding.isNull(obj)||(typeof(obj)=="string"&&obj.trim()=="");
	},
	//检查参数是否是RegExp对象
	Ding.isRegex = function(obj){
	    return (typeof obj=="object" && obj.constructor==RegExp);
	},
	//检查参数是否是函数对象
	Ding.isFunction = function(obj){
	    return (typeof obj=="function");
	},
	//检查参数是否是数组
	Ding.isArray = function(obj){
	    return obj instanceof Array;
	},
	Ding.isDOMElement = function(obj){
		 return !!(obj && typeof window !== 'undefined' && (obj === window || obj.nodeType));
	},
	Ding.windowHeight = function(){
		return document.body.clientHeight;
	},
	Ding.windowWidth = function(){
		return document.body.clientWidth;
	},
	Ding.width = function(domer,val){
		if(!Ding.isEmpty(val))
			val.toString().indexOf('px') !=-1 ? (domer.style.width = val) : (domer.style.width = val + 'px')
		else{
			return Ding.isEmpty(domer.style.width)? domer.offsetWidth : (domer.style.width.toString().indexOf('px') !=-1? domer.style.width.toString().substring(0,domer.style.width.toString().length-2):domer.style.width);
		}
	},
	Ding.height = function(domer,val){
		if(!Ding.isEmpty(val))
			val.toString().indexOf('px') !=-1 ? (domer.style.height = val) : (domer.style.height = val + 'px')
		else
			return Ding.isEmpty(domer.style.height)? domer.offsetHeight : (domer.style.height.toString().indexOf('px') !=-1? domer.style.height.toString().substring(0,domer.style.height.toString().length-2):domer.style.height);
	},
	Ding.center = function(domer){
		// if(Ding.isEmpty(domer.style.width)){
		// 	Ding.width(domer,document.body.clientWidth*0.9);
		// }
		// if(Ding.isEmpty(domer.style.height))
		// 	Ding.height(domer,document.body.clientHeight*0.9);
		domer.style.top = (document.body.clientHeight - Ding.height(domer))/2 + "px";
		domer.style.left = (document.body.clientWidth - Ding.width(domer))/2 + "px";
	},
	Ding.getUID = function(){
		return DingUniqueId++;
	},
	Ding.tips = function(txt){
		var errorDiv=document.createElement("div");
		errorDiv.className = "ding-validation-result";
		var errorDivChild = document.createElement("div");
		errorDivChild.innerHTML = txt;
		errorDiv.appendChild(errorDivChild);
		document.body.appendChild(errorDiv);
		setTimeout(function(){
			document.body.removeChild(errorDiv);
		},2500);
	},
	Ding.confirm = function(msg,trueCallback,falseCallback){
		var popupDiv = document.createElement('div');
		popupDiv.className = "ding-popup";

		var popupMaskDiv = document.createElement('div');
		popupMaskDiv.className = "ding-popup-mask";
		popupDiv.appendChild(popupMaskDiv);

		var popupBoxDiv = document.createElement('div');
		popupBoxDiv.className = "ding-popup-box";
		popupBoxDiv.style.width = "300px";
		var popupBoxContentDiv = document.createElement('div');
		popupBoxContentDiv.className = "ding-popup-box-content";
		popupBoxContentDiv.innerHTML = msg;
		popupBoxDiv.appendChild(popupBoxContentDiv);

		var popupBoxConfirmBtnDiv = document.createElement('div');
		popupBoxConfirmBtnDiv.className = "ding-popup-box-confirm-btn";
		var confirmBtn = document.createElement("a");
		confirmBtn.innerHTML = "确定";
		confirmBtn.addEventListener("click",function(){
			document.body.removeChild(popupDiv);
			trueCallback();
		});
		var cancelBtn = document.createElement("a");
		cancelBtn.innerHTML = "取消";
		cancelBtn.addEventListener("click",function(){
			document.body.removeChild(popupDiv);
			falseCallback();
		});

		popupBoxConfirmBtnDiv.appendChild(confirmBtn);
		popupBoxConfirmBtnDiv.appendChild(cancelBtn);
		popupBoxDiv.appendChild(popupBoxConfirmBtnDiv);

		Ding.center(popupBoxDiv);
		popupDiv.appendChild(popupBoxDiv);
		
		document.body.appendChild(popupDiv);
	},
	Ding.formatDate = function(date, fmt) {
		if(Ding.isEmpty(fmt)){
			fmt = "%Y-%M-%d %H:%m";
		}
	    function pad(value) {
	        return (value.toString().length < 2) ? '0' + value : value;
	    }
	    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
	        //1927-12-31 00:0:52（-1325664000000）后就没问题
	        if (date.getTime() < -1325664000000) {
	            date = new Date(date.getTime() + (1325664352000 - 1325664000000));
	        };
	        switch (fmtCode) {
	         case 'Y':
	             return date.getFullYear();
	         case 'M':
	             return pad(date.getMonth() + 1);
	         case 'd':
	             return pad(date.getDate());
	         case 'H':
	             return pad(date.getHours());
	         case 'm':
	             return pad(date.getMinutes());
	         case 's':
	             return pad(date.getSeconds());
	         default:
	         	console.log("日期格式不支持！");
	        }
	    });
	},
	Ding.getCookie = function(name){
		var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
		if(arr=document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	},
	Ding.bubbleUp = function(arr){
		for(var i=0;i<arr.length-1;i++){
			for(var j=0;j<arr.length-i-1;j++){
				if(arr[j]>arr[j+1]){
					var swap=arr[j];
					arr[j]=arr[j+1];
					arr[j+1]=swap;
				}
			}
		}
		return arr;
	},
	//date:日期格式，days天数
	Ding.caculateDate = function(date,days){
		var newDate = date.valueOf() + days * 24 * 60 * 60 * 1000;
		return new Date(newDate);
	},
	//date:日期格式
	Ding.caculateDay = function(date){
		var weekday=new Array(7);
		weekday[0]="<font color='red'>周日</font>";
		weekday[1]="周一";
		weekday[2]="周二";
		weekday[3]="周三";
		weekday[4]="周四";
		weekday[5]="周五";
		weekday[6]="<font color='red'>周六</font>";
		return weekday[date.getDay()];
	}
})(document);

/**
*	属性说明
*	url 			请求链接
*	autoRequest		是否自动请求
*	requestMethod
*		properties		
*		renders		
*		renderTypes	
*		renderFunctions
*/
Ding.Datagrid = function(selector){
	Ding.call(this,selector);
	this.url = Ding.isEmpty(this[0].getAttribute("url"))?(
		console.log("Datagrid请求链接为空!")
	):this[0].getAttribute("url");
	this.autoRequest = Ding.isEmpty(this[0].getAttribute("autoRequest"))?true:this[0].getAttribute("autoRequest");
	this.requestMethod = Ding.isEmpty(this[0].getAttribute("requestMethod"))?"GET":this[0].getAttribute("requestMethod");
	this.defaultPage = Ding.isEmpty(this[0].getAttribute("defaultPage"))?true:this[0].getAttribute("defaultPage");//默认分页参数，默认为true
	this.currentIndex = Ding.isEmpty(this[0].getAttribute("currentIndex"))?1:this[0].getAttribute("currentIndex");//当前页数索引，默认为1
	this.pageSize = Ding.isEmpty(this[0].getAttribute("pageSize"))?200:this[0].getAttribute("pageSize");//当前每页数量，默认为20
	this.successCallback = this[0].getAttribute("successCallback");
	this.tdLength = 0;
	this.properties = [];
	this.renderTypes = [];
	this.renders = [];
	this.allCheck = Ding.isEmpty(this[0].getAttribute("allCheck"))?false:true;//全选操作
	if(this.allCheck==true){
		this.allCheckBox = document.createElement("input");
		this.allCheckBox.type = "checkbox";
		this.checkboxes = [];
		this.allCheckBox.addEventListener("change",function(){
			for(var i=0;i<_this.checkboxes.length;i++){
				if(this.checked==true)
					_this.checkboxes[i].checked = true;
				else
					_this.checkboxes[i].checked = false;
			}
		})
	}
	var tdList = this[0].children[0].children[0].children;
	this.tdLength = tdList.length;
	//请求服务获取数据
	this.params = {};
	for(var i=0,len = tdList.length;i<len;i++){
		var td = tdList[i];
		this.properties.push(td.getAttribute("property"));
		this.renderTypes.push(td.getAttribute("renderType"));
		this.renders.push(td.getAttribute("render"));
		if(this.allCheck==true&&i==0){//表格携带全选功能
			td.innerHTML = "";
			td.appendChild(this.allCheckBox);
		}
	}
	//渲染分页效果
	if(this.defaultPage==true){
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.colSpan = this.tdLength;
		td.style = "text-align:left;height:40px;line-height:40px;vertical-align: middle;";
		var firstSpan = document.createElement("span");
		firstSpan.className = "page_btn first_btn";
		td.appendChild(firstSpan);
		var _this = this;
		firstSpan.addEventListener("click",function(){
			_this.firstSpanHandler();
		},false);

		var preSpan = document.createElement("span");
		preSpan.className = "page_btn pre_btn";
		td.appendChild(preSpan);
		preSpan.addEventListener("click",function(){
			_this.preSpanHandler();
		},false);

		var pageInput = document.createElement("input");
		pageInput.type = "text";
		pageInput.style.width = "30px";
		pageInput.style.cursor = "auto";
		pageInput.style.textAlign = "center";
		pageInput.className = "page_btn";
		pageInput.value = 0;
		pageInput.addEventListener("change",function(){
			if(this.value>_this.sumPageCount){
				this.value = _this.sumPageCount;
			}
			_this.currentIndex = this.value;
			_this.skip(_this.currentIndex);
		});
		td.appendChild(pageInput);

		var splitCount = document.createElement("span");
		splitCount.style = "vertical-align: middle;line-height: 40px;margin:0 0 0 5px;width:auto;cursor:auto;";
		splitCount.className = "page_btn";	
		splitCount.innerHTML = "/";	
		td.appendChild(splitCount);

		var pageCount = document.createElement("span");
		pageCount.style = "vertical-align: middle;line-height: 40px;margin:0 5px 0 5px;width:auto;cursor:auto;";
		pageCount.className = "page_btn";	
		pageCount.innerHTML = "0";	
		td.appendChild(pageCount);

		var nextSpan = document.createElement("span");
		nextSpan.className = "page_btn next_btn";		
		td.appendChild(nextSpan);
		nextSpan.addEventListener("click",function(){
			_this.nextSpanHandler();
		},false);

		var lastSpan = document.createElement("span");
		lastSpan.className = "page_btn last_btn";		
		td.appendChild(lastSpan);
		lastSpan.addEventListener("click",function(){
			_this.lastSpanHandler();
		},false);

		var pageSizeSpan = document.createElement("span");
		pageSizeSpan.className = "page_btn";	
		//pageSizeSpan.style.borderLeft = "1px solid #ddd";
		pageSizeSpan.style.paddingLeft = "15px";
		pageSizeSpan.style.width = "150px";

		var pageB1 = document.createElement("b");
		pageB1.innerHTML = "每页";
		pageSizeSpan.appendChild(pageB1);

		var pageSelector = document.createElement("select");
		pageSelector.style.width = "60px";
		pageSelector.style.minWidth = "60px";
		pageSelector.style.margin = "0 8px";
		var option50 = document.createElement("option");
		option50.value = 50;
		option50.innerHTML = 50;
		var option100 = document.createElement("option");
		option100.value = 100;
		option100.innerHTML = 100;
		var option200 = document.createElement("option");
		option200.value = 200;
		option200.innerHTML = 200;
		option200.selected = "selected";
		var option500 = document.createElement("option");
		option500.value = 500;
		option500.innerHTML = 500;
		var option1000 = document.createElement("option");
		option1000.value = 1000;
		option1000.innerHTML = 1000;
		pageSelector.appendChild(option50);
		pageSelector.appendChild(option100);
		pageSelector.appendChild(option200);
		pageSelector.appendChild(option500);
		pageSelector.appendChild(option1000);
		pageSizeSpan.appendChild(pageSelector);
		pageSelector.addEventListener("change",function(){
			_this.pageChangeHandler(this.value);
		});

		var pageB2 = document.createElement("b");
		pageB2.innerHTML = "条";

		pageSizeSpan.appendChild(pageB2);

		td.appendChild(pageSizeSpan);
		
		tr.appendChild(td);
		this[0].appendChild(tr);

		this.pageTr = tr;//配置分页的tr为datagrid的一个属性，方便获取
		this.pageCountSpan = pageCount;
		this.firstSpan = firstSpan;
		this.preSpan = preSpan;
		this.nextSpan = nextSpan;
		this.lastSpan = lastSpan;
		this.pageInput = pageInput;

		if(this.currentIndex==1){
			Ding.addClass(this.firstSpan,"disable_btn");
			Ding.addClass(this.preSpan,"disable_btn");
		}
	}
	
	if(this.autoRequest==true) this.request(this.params);
};
//_reset:分页数据仍然使用原有的分页数据,true重新分页，false或者空，使用目前的分页数据
Ding.Datagrid.prototype.request = function(_params,_reset){
	var trChildren = this[0].children;
	if(this.defaultPage==true){
		for(var i=trChildren.length-1;i>1;i--){//表头和表尾不删除
			this[0].removeChild(trChildren[i-1]);
		}
	}
	else{
		for(var i=trChildren.length;i>1;i--){//表头和表尾不删除
			this[0].removeChild(trChildren[i-1]);
		}
	}
	if(Ding.isEmpty(this.url)){
		return;
	}
	var _this = this;
	if(!Ding.isEmpty(_reset)&&_reset==true){//分页信息重置
		this.currentIndex = 1;
		this.params.currentIndex = 1;
		this.params.pageSize = this.pageSize;
	}
	else{
		this.params.currentIndex = this.currentIndex;
		this.params.pageSize = this.pageSize;
	}
	for(var i in _params){//参数覆盖
		this.params[i] = _params[i];
	}
	if(this.allCheck==true){
		this.allCheckBox.checked = false;
	}
	Ding.ajax({
		'url':this.url,
		'method':this.requestMethod,
		'params':this.params,
		successCallback:function(result){
			var dataList = result.data;
			_this.dataList = dataList;
			if(_this.allCheck==true){//存在复选框功能
				_this.checkboxes = [];
			}
			for(var index in dataList){
				var data = dataList[index];
				var tr = document.createElement('tr');
				for(var i=0;i<_this.tdLength;i++){
					var td = document.createElement('td');
					//以下代码拼接datagrid中的数据td
					if(_this.renderTypes[i]=="button"){//td渲染类型为button
						td.className = "remove_btn";
						var renderBtnArray = _this.renders[i].split(";");
						for(var j=0,len=renderBtnArray.length;j<len;j++){
							if(!Ding.isEmpty(renderBtnArray[j])){
								var btnInfos = renderBtnArray[j].split(":");
								var a = document.createElement("a");//创建按钮元素
								a.innerHTML = btnInfos[0];
								if(btnInfos[1].indexOf(".shtml")!=-1){
									a.href = btnInfos[1];
								}
								else{
									try{
										eval(btnInfos[1]);//此处的方法的类型是string,js无法直接执行，借用eval执行，如果无此方法直接抛出异常被catch捕获然后提示，如果有此方法继续往下执行代码
										a.addEventListener("click",function(event){//绑定click事件
											var tr = this.parentNode.parentNode;//获取当前数据行在总数据当中的下标索引
											var trIndex = Ding.index(tr)-1;
											var jIndex = Ding.index(this);//获取当前的按钮在父节点中的下标索引
											var buttonInfos = renderBtnArray[jIndex].split(":");//获取renders中对应的下表索引的内容，进行:分割
											var f = eval(buttonInfos[1]);//借用eval执行，创建一个function
											f(dataList[trIndex],tr);//将参数代入到方法当中，调用页面上配置的按钮方法
										},false);
									}
									catch(e){
										console.log("页面datagrid按钮click方法："+btnInfos[1]+"不存在!");
									}
								}
								td.appendChild(a);//td拼接按钮元素
							}
						}
					}
					else if(_this.renderTypes[i]=="define"){
						try{
							var f = eval(_this.renders[i]);
							var result1 = f(data,td);
							if(!Ding.isEmpty(result1)){
								if(Ding.isDOMElement(result1)){
									td.appendChild(result1);
								}
								else{
									td.innerHTML = result1;
								}
							}
						}
						catch(e){
							console.log(e);
							console.log("页面td渲染方法："+_this.renders[i]+"不存在!");
						}
					}
					else if(_this.renderTypes[i]=="datetime"){
						if(Ding.isEmpty(data[_this.properties[i]])) 
							td.innerHTML = "";
						else{
							try{
								td.innerHTML = Ding.formatDate(new Date(data[_this.properties[i]]),"%Y-%M-%d %H:%m:%s");
							}
							catch(e){
								console.log("页面td渲染方法："+_this.renders[i]+"不存在!");
							}
						}
					}
					else{//td无渲染类型，直接使用数据填充td内容
						if(_this.allCheck==true&&i==0){
							var checkbox = document.createElement("input");
							checkbox.type = "checkbox";
							_this.checkboxes.push(checkbox);
							td.appendChild(checkbox);
						}
						else{
							td.innerHTML = data[_this.properties[i]];
						}
					}
					tr.appendChild(td);
				}
				_this[0].insertBefore(tr,_this.pageTr);
			}
			
			if(_this.defaultPage==true){
				var count = result.count;//数据总数
				_this.sumPageCount = Math.ceil(count/_this.pageSize);//总页数
				_this.pageCountSpan.innerHTML = _this.sumPageCount;
				_this.pageInput.value = _this.currentIndex;
				
				if(_this.currentIndex!=1){
					Ding.removeClass(_this.firstSpan,"disable_btn");
					Ding.removeClass(_this.preSpan,"disable_btn");
				}
				else{
					Ding.addClass(_this.firstSpan,"disable_btn");
					Ding.addClass(_this.preSpan,"disable_btn");
				}

				if(_this.currentIndex==_this.sumPageCount){
					Ding.addClass(_this.nextSpan,"disable_btn");
					Ding.addClass(_this.lastSpan,"disable_btn");
				}
				else{
					Ding.removeClass(_this.nextSpan,"disable_btn");
					Ding.removeClass(_this.lastSpan,"disable_btn");
				}
			}
			if(!Ding.isEmpty(_this.successCallback)){
				Ding.isFunction(_this.successCallback) ? _this.successCallback(json) : (f = eval(_this.successCallback),f());
			}
		}
	});
};
Ding.Datagrid.prototype.skip = function(skipIndex){
	//请求服务获取数据
	this.params.currentIndex = skipIndex;
	this.params.pageSize = this.pageSize;
	this.request();
};
Ding.Datagrid.prototype.firstSpanHandler = function(){
	if(this.currentIndex==1) return;
	this.currentIndex=1;
	this.skip(1);
};
Ding.Datagrid.prototype.preSpanHandler = function(){
	if(this.currentIndex==1) return;
	this.currentIndex-=1;
	this.skip(this.currentIndex);
};
Ding.Datagrid.prototype.nextSpanHandler = function(){
	if(this.currentIndex==this.sumPageCount) return;
	this.currentIndex+=1;
	this.skip(this.currentIndex);
};
Ding.Datagrid.prototype.lastSpanHandler = function(){
	if(this.currentIndex==this.sumPageCount) return;
	this.currentIndex=this.sumPageCount;
	this.skip(this.sumPageCount);
};
Ding.Datagrid.prototype.pageChangeHandler = function(_pageSize){
	this.currentIndex=1;
	this.pageSize = _pageSize;
	this.skip(1);
};



//Ding-Form表单组件
/**
*	属性说明
*	validateResult
*	action
*	method
*	successCallback
*	errorCallback
*	failCallback
*	submitType
*	submitBtn
*	showLoadingMask
*	validationChildren
*	keyDownValid
*	allowConfirm
*	方法说明
*	disableSubmit
*	submit
*/
Ding.Form = function(selector){
	Ding.call(this,selector);
	var _this = this;
	this.validateResult = true;//新建form表单对象，校验默认值为true，允许表单提交
	this.action = Ding.isEmpty(this[0].getAttribute("action"))?(
		console.log('Form表单链接不能为空！')
	):this[0].getAttribute("action");
	this.method = Ding.isEmpty(this[0].getAttribute("method"))?"POST":this[0].getAttribute("method");//默认是post提交
	this.successCallback = function(result){
		_this.enableSubmit();//开启添加按钮
		if(!Ding.isEmpty(_this[0].getAttribute("successCallback"))){
			var f = eval(_this[0].getAttribute("successCallback"));
			f(result);
		}
	};
	this.errorCallback = function(result){
		_this.enableSubmit();//开启添加按钮
		if(!Ding.isEmpty(_this[0].getAttribute("errorCallback"))){
			var f = eval(_this[0].getAttribute("errorCallback"));
			f(result);
		}
	};
	this.failCallback = function(result){
		_this.enableSubmit();//开启添加按钮
		if(!Ding.isEmpty(_this[0].getAttribute("failCallback"))){
			var f = eval(_this[0].getAttribute("failCallback"));
			f(result);
		}
	};
	this.submitType = Ding.isEmpty(this[0].getAttribute("submitType")) ? "ajax" : this[0].getAttribute("submitType");
	this.submitBtn = Ding.getClass("ding-submit","a",this[0]);
	if(Ding.isEmpty(this.submitBtn)) console.log("Form表单中不存在ding-submit样式的提交按钮！");
	this.showLoadingMask = Ding.isEmpty(this[0].getAttribute("showLoadingMask")) ? true : this[0].getAttribute("showLoadingMask");
	this.validationChildren = Ding.find("validations",this[0]);
	this.keyDownValid = Ding.isEmpty(this[0].getAttribute("keyDownValid"))?false:this[0].getAttribute("keyDownValid");
	this.allowConfirm = Ding.isEmpty(this[0].getAttribute("allowConfirm"))?false:this[0].getAttribute("allowConfirm");//是否弹出确定提交提示框
	this.submitValidation = this[0].getAttribute("submitValidation");//表单提交的校验事件
	this.submitParams = {};//表单ajax需要额外提交的参数
	//=============私有属性
	this.allowSubmit = true;
	if(!Ding.isEmpty(this.keyDownValid)){
		this.submitHandler = function(){
			if(_this.allowConfirm){
				Ding.confirm("是否确定操作？",function(){
					_this.submit();
				},function(){

				});
			}
			else{
				_this.submit();
			}
		}
		if(!Ding.isEmpty(this.submitBtn[0])){
			this.submitBtn[0].addEventListener("click",_this.submitHandler,false);
			if(this.keyDownValid){
				document.onkeydown = function(event){
					if(event.which == "13"){
						_this.submit();
					}
				}
			}
		}
		// for(var i=0;i<this.validationChildren.length;i++){
		// 	var component = this.validationChildren[i];
		// 	component.addEventListener("blur",function(){
		// 		if(!Ding.validationDistributor(this)){
		// 			_this.validateResult = false;
		// 		}
		// 	},false);
		// }
	}
};
Ding.Form.prototype.disableSubmit = function(){
	if(!Ding.isEmpty(this.submitBtn[0])){
		Ding.addClass(this.submitBtn[0],"ding-disbale-btn");
		this.allowSubmit = false;
	}
};
Ding.Form.prototype.enableSubmit = function(){
	if(!Ding.isEmpty(this.submitBtn[0])){
		Ding.removeClass(this.submitBtn[0],"ding-disbale-btn");
		this.allowSubmit = true;
	}
};
Ding.Form.prototype.submit = function(){
	if(!Ding.isEmpty(this.submitValidation)){
		var result = eval(this.submitValidation+"()");
		if(!result) return false;//表单提交校验事件不通过
	}
	if(!this.allowSubmit) return false;
	// // 表单校验，待完善
	// for(var i=0;i<this.validationChildren.length;i++){
	// 	if(!Ding.validationDistributor(this.validationChildren[i])){
	// 		this.validateResult=false;
	// 		break;
	// 	}
	// 	else
	// 		this.validateResult=true;
	// }
	this.validateResult = $(this[0]).validate();

	if(this.validateResult){
		this.disableSubmit();
		if(this.submitType=="ajax"){
			var p = Ding.serialize(this[0]);
			for(var i in this.submitParams){
				p[i] = this.submitParams[i];
			}
			Ding.ajax({
				url : this.action,
				method : this.method,
				params : p,
				showLoadingMask : this.showLoadingMask,
				successCallback : this.successCallback,
				errorCallback : this.errorCallback,
				failCallback : this.failCallback
			});
		}
		else{//表单提交
			this[0].submit();
		}
		return true;
	}
	else{
		return this.validateResult;
	}
};
/**
* 此组件需要服务端配合使用，服务端返回后需要能够唤起回调事件
*	上传按钮必须为Ding-ImgUploader的第二个元素
*	defaultValue	默认值
*	hiddenName		隐藏域表单提交的name
*/
Ding.ImgUploader = function(selector){
	Ding.call(this,selector);
	var _this = this;
	this.uid = Ding.getUID();
	this.name = this[0].getAttribute("name");
	this.id = this[0].getAttribute("id");
	this.uploadFileName = "";
	this.uploadUrl = Ding.isEmpty(this[0].getAttribute("uploadUrl")) ? (
			console.log("图片上传路径不能为空！")
		) : this[0].getAttribute("uploadUrl");
	this.hiddenName = Ding.isEmpty(this[0].getAttribute("hiddenName")) ? (
			console.log("注意：图片选择器如需提交表单，hiddenName属性不能为空！")
		) : this[0].getAttribute("hiddenName");
	this.uploaderValidations = this[0].getAttribute("uploaderValidations");
	this.uploaderValidationTips = this[0].getAttribute("uploaderValidationTips");

	this.uploadFrame = document.createElement("frame");
	this.uploadFrame.style.display = "none";
	this.uploadFrame.name = "uploadFrame-"+this.name+"-"+this.uid;
	document.body.appendChild(this.uploadFrame);

	this.uploadForm = document.createElement("form");
	this.uploadForm.name = "img_upload_form"+this.uid;
	this.uploadForm.method = "POST";
	this.uploadForm.style.display = "none";
	this.uploadForm.action = this.uploadUrl;
	this.uploadForm.target = this.uploadFrame.name;
	this.uploadForm.enctype = "multipart/form-data";
	document.body.appendChild(this.uploadForm);

	this.hiddenUploaderInput = document.createElement("input");
	this.hiddenUploaderInput.type = "hidden";
	this.hiddenUploaderInput.name = "uploaderId";
	this.hiddenUploaderInput.value = this.id;
	this.uploadForm.appendChild(this.hiddenUploaderInput);

	this.uploadFile = document.createElement("input");
	this.uploadFile.type = "file";
	this.uploadFile.name = "file";
	this.uploadForm.appendChild(this.uploadFile);
	this.uploadFile.addEventListener("change",function(){
		if(!Ding.isEmpty(this.value)){
			_this.uploadFileName = this.value.substring(this.value.lastIndexOf('\\')+1);//获取上传文件的名称
			_this.uploadForm.submit();
		}
	},false);

	this.hiddenFilePathInput = document.createElement("input");//创建隐藏项,form表单上传的时候同时将已经上传好的文件服务器路径一起提交
	this.hiddenFilePathInput.type = "hidden";
	this.hiddenFilePathInput.name = this.hiddenName;
	var img = document.createElement("img");
	this[0].appendChild(img);
	//默认显示的图片
	if(!Ding.isEmpty(this[0].getAttribute("defaultDisplay"))){
		// this[0].style.backgroundImage = 'url('+this[0].getAttribute("defaultDisplay")+')';
		img.src = this[0].getAttribute("defaultDisplay");
		this.hiddenFilePathInput.value = this[0].getAttribute("defaultDisplay");
	}
	//默认显示的图片的name
	if(!Ding.isEmpty(this[0].getAttribute("defaultName"))){
		// this[0].style.backgroundImage = 'url('+this[0].getAttribute("defaultName")+')';
		img.name = this[0].getAttribute("defaultName");
	}
	//图片上传器默认值
	if(!Ding.isEmpty(this[0].getAttribute("defaultValue"))){
		this.hiddenFilePathInput.value = this[0].getAttribute("defaultValue");
	}
	if(!Ding.isEmpty(this.uploaderValidations)){
		this.hiddenFilePathInput.setAttribute("validations",this.uploaderValidations);
		this.hiddenFilePathInput.setAttribute("validationtips",this.uploaderValidationTips);
	}
	this.after(this.hiddenFilePathInput);

	this[0].addEventListener("click",function(){
		_this.uploadFile.click();
	},false);
};
Ding.ImgUploader.prototype.uploadCallback = function(filePath,fileUrl){
	var _this = this;
	this.hiddenFilePathInput.value = filePath;
	// this[0].style.backgroundImage = 'url('+fileUrl+')';
	var img = this[0].children[0];
	img.src = fileUrl;
	this[0].appendChild(img);
};
Ding.ImgUploader.extend(Ding);

Ding.InputSelector = function(selector){
	Ding.call(this,selector);
	var _this = this;
	this.id = this[0].getAttribute("id");
	this.textInputId = this[0].getAttribute("textInputId");
	this.url = this[0].getAttribute("url");
	this.valueProperty = this[0].getAttribute("valueProperty");
	this.htmlProperty = this[0].getAttribute("htmlProperty");
	this.textInputName = this[0].getAttribute("textInputName");
	this.inputName = this[0].getAttribute("inputName");
	this.forceInput = Ding.isEmpty(this[0].getAttribute("forceInput")) ? false : true;//允许文本输入选择器输入，true：强制，false：不强制；默认是不强制
	this.changeEvent = this[0].getAttribute("changeEvent");//文本框内容改变事件
	this.hiddenValue = this[0].getAttribute("hiddenValue");
	this.textInputValue = this[0].getAttribute("textInputValue");
	this.textInputWidth = Ding.isEmpty(this[0].getAttribute("textInputWidth")) ? 200 : this[0].getAttribute("textInputWidth");
	this.textInputHeight = Ding.isEmpty(this[0].getAttribute("textInputHeight")) ? 34 : this[0].getAttribute("textInputHeight");
	this.showLoadingMask = Ding.isEmpty(this[0].getAttribute("showLoadingMask")) ? false : this[0].getAttribute("showLoadingMask");
	this.placeholder = Ding.isEmpty(this[0].getAttribute("placeholder"))?"":this[0].getAttribute("placeholder");
	this.i_validations = Ding.isEmpty(this[0].getAttribute("i_validations"))?"":this[0].getAttribute("i_validations");
	this.i_validationTips = Ding.isEmpty(this[0].getAttribute("i_validationTips"))?"":this[0].getAttribute("i_validationTips");

	this.input = document.createElement("input");
	this.input.type = "text";
	if(!Ding.isEmpty(this.textInputName)){
		this.input.setAttribute("name",this.textInputName);
	}
	if(!Ding.isEmpty(this.textInputId)){
		this.input.setAttribute("id",this.textInputId);
	}
	if(!Ding.isEmpty(this.textInputValue)){
		this.input.value = this.textInputValue;
	}
	if(!Ding.isEmpty(this.placeholder)){
		this.input.placeholder = this.placeholder;
	}
	this[0].appendChild(this.input);
	if(!Ding.isEmpty(this.i_validations)){
		this.input.setAttribute("validations",this.i_validations);
		this.input.setAttribute("validationTips",this.i_validationTips);
	}
	this.input.onfocus=function(){
		_this.request(this.value);
	}
	this.input.onkeyup=function(){
		_this.hiddenInput.value="";//清空隐藏文本区域的值
		_this.request(this.value);
	}
	this.input.onblur=function(){
		var ddChildren = _this.selector.children;
		if(_this.forceInput){
			if(ddChildren.length==0){
				alert("输入的信息找不到匹配的信息，请重新输入！");
				_this.input.value = "";
			}
		}
		if(ddChildren.length>0){//有可选项长度大于0
			if(ddChildren.length==1){
				var dd = ddChildren[0];
				if(_this.input.value==dd.innerHTML){
					_this.input.value = dd.innerHTML;
					_this.hiddenInput.value = dd.getAttribute("value");
				}			
			}
			else{
				for(var i=0;i<ddChildren.length;i++){
					if(ddChildren[i].innerHTML==this.value){
						var dd = ddChildren[i];
						_this.input.value = dd.innerHTML;
						_this.hiddenInput.value = dd.getAttribute("value");
					}
				}
			}
		}
		
		window.setTimeout(function(){
			_this.selector.style.display = "none";
		},100);
	}
	if(!Ding.isEmpty(this.changeEvent)){
		this.input.onchange=function(){
			var functionStr = _this.changeEvent+"('"+_this.id+"')";
			eval(functionStr);
		}
	}

	this.hiddenInput = document.createElement("input");
	this.hiddenInput.type = "hidden";
	this.hiddenInput.name = this.inputName;
	if(!Ding.isEmpty(this.hiddenValue)){
		this.hiddenInput.value = this.hiddenValue;
	}
	this[0].appendChild(this.hiddenInput);

	this.selector = document.createElement("dt");
	this.selector.style.width = this.textInputWidth+"px";
	this.selector.style.top = this.textInputHeight+"px";
	this[0].appendChild(this.selector);
};
Ding.InputSelector.prototype.request = function(val){
	if(!Ding.isEmpty(this.url)){
		if(!Ding.isEmpty(Ding.trim(val))){
			var _this = this;
			Ding.ajax({
				'url':this.url,
				'showLoadingMask':this.showLoadingMask,
				'params':{
					'name':Ding.trim(val)
				},
				'successCallback':function(result){
					_this.selector.innerHTML = "";//清空下拉列表
					_this.selector.style.display = "block";
					var dataList = result.data;
					for(var i=0;i<dataList.length;i++){
						var dd = document.createElement("dd");
						dd.setAttribute("value",dataList[i][_this.valueProperty])
						dd.innerHTML = dataList[i][_this.htmlProperty];
						_this.selector.appendChild(dd);
						dd.onclick = function(){
							_this.input.value = this.innerHTML;
							_this.hiddenInput.value = this.getAttribute("value");
							if(!Ding.isEmpty(_this.changeEvent)){//触发文本框值改变事件
								var functionStr = _this.changeEvent+"('"+_this.id+"')";
								eval(functionStr);
							}
						}
					}
				}
			});
		}
		else{
			this.selector.innerHTML = "";//清空下拉列表
		}
	}
};
Ding.InputSelector.prototype.setValue = function(options){
	this.hiddenValue = options.hiddenValue;
	this.textInputValue = options.textInputValue;
	this.input.value = this.textInputValue;
	this.hiddenInput.value = this.hiddenValue;
}
Ding.InputSelector.extend(Ding);

Ding.LoadingMask = function(selector){
	var popupMaskDiv = document.createElement('div');
	popupMaskDiv.className = "ding-popup-mask";
	document.body.appendChild(popupMaskDiv);
	this[0] = popupMaskDiv;
};
Ding.LoadingMask.prototype.close = function(){
	document.body.removeChild(this[0]);
};
/**
* 此组件需要服务端配合使用，服务端返回后需要能够唤起回调事件
*	上传按钮必须为Ding-Uploader的第二个元素
*	defaultValue	默认值
*/
Ding.Uploader = function(selector){
	Ding.call(this,selector);
	var _this = this;
	this.uid = Ding.getUID();
	this.name = this[0].getAttribute("name");
	this.id = this[0].getAttribute("id");
	this.uploadFileName = "";
	this.uploadUrl = Ding.isEmpty(this[0].getAttribute("uploadUrl")) ? (
			console.log("图片上传路径不能为空！")
		) : this[0].getAttribute("uploadUrl");
	this.uploaderValidations = this[0].getAttribute("uploaderValidations");
	this.uploaderValidationTips = this[0].getAttribute("uploaderValidationTips");

	this.uploadFrame = document.createElement("frame");
	this.uploadFrame.style.display = "none";
	this.uploadFrame.name = "uploadFrame-"+this.name+"-"+this.uid;
	document.body.appendChild(this.uploadFrame);

	this.uploadForm = document.createElement("form");
	this.uploadForm.name = "img_upload_form"+this.uid;
	this.uploadForm.method = "POST";
	this.uploadForm.style.display = "none";
	this.uploadForm.action = this.uploadUrl;
	this.uploadForm.target = this.uploadFrame.name;
	this.uploadForm.enctype = "multipart/form-data";
	document.body.appendChild(this.uploadForm);

	this.hiddenUploaderInput = document.createElement("input");
	this.hiddenUploaderInput.type = "hidden";
	this.hiddenUploaderInput.name = "uploaderId";
	this.hiddenUploaderInput.value = this.id;
	this.uploadForm.appendChild(this.hiddenUploaderInput);

	this.uploadFile = document.createElement("input");
	this.uploadFile.type = "file";
	this.uploadFile.name = "file";
	this.uploadForm.appendChild(this.uploadFile);
	this.uploadFile.addEventListener("change",function(){
		_this.uploadFileName = this.value.substring(this.value.lastIndexOf('\\')+1);//获取上传文件的名称
		_this.uploadForm.submit();
	},false);

	this.hiddenFilePathInput = document.createElement("input");//创建隐藏项,form表单上传的时候同时将已经上传好的文件服务器路径一起提交
	this.hiddenFilePathInput.type = "hidden";
	this.hiddenFilePathInput.name = this.name;
	if(!Ding.isEmpty(this[0].getAttribute("defaultValue"))){
		this.hiddenFilePathInput.value = this[0].getAttribute("defaultValue");
	}
	if(!Ding.isEmpty(this.uploaderValidations)){
		this.hiddenFilePathInput.setAttribute("validations",this.uploaderValidations);
		this.hiddenFilePathInput.setAttribute("validationtips",this.uploaderValidationTips);
	}
	this.after(this.hiddenFilePathInput);

	this.uploadBtn = this[0].children[1];//获取上传按钮，配置click事件
	this.uploadBtn.addEventListener("click",function(){
		_this.uploadFile.click();
	},false);
};
Ding.Uploader.prototype.uploadCallback = function(filePath,fileUrl){
	var _this = this;
	this[0].children[0].innerHTML = fileUrl;
	this.hiddenFilePathInput.value = filePath;
	var a = document.createElement("a");
	this[0].children[0].appendChild(a);
	a.addEventListener("click",function(){
		_this[0].children[0].innerHTML = "";
		_this.hiddenFilePathInput.value = "";
	},false);
};
Ding.Uploader.extend(Ding);


/**
*	url 	
*	requestMethod	
*	valueProperty
*	htmlProperty
*	selectedValue
*	defaultOptionValue
*	defaultOptionHtml
*/
Ding.Selector = function(selector){
	Ding.call(this,selector);
	this.url = Ding.isEmpty(this[0].getAttribute("url"))?(
			console.log("Warn：Selector组件属性url不能为空！")
		):this[0].getAttribute("url");
	this.requestMethod = Ding.isEmpty(this[0].getAttribute("requestMethod"))?"GET":this[0].getAttribute("requestMethod");
	this.valueProperty = Ding.isEmpty(this[0].getAttribute("valueProperty"))?(
			console.log("Warn：Selector组件属性valueProperty不能为空！")
		):this[0].getAttribute("valueProperty");
	this.htmlProperty = Ding.isEmpty(this[0].getAttribute("htmlProperty"))?(
			console.log("Warn：Selector组件属性htmlProperty不能为空！")
		):this[0].getAttribute("htmlProperty");
	this.otherField = this[0].getAttribute("otherField");
	this.selectedValue = this[0].getAttribute("selectedValue");
	this.autoRequest = Ding.isEmpty(this[0].getAttribute("autoRequest"))?true:this[0].getAttribute("autoRequest");
	this.defaultOptionHtml = Ding.isEmpty(this[0].getAttribute("defaultOptionHtml"))?'':this[0].getAttribute("defaultOptionHtml");
	this.defaultOptionValue = Ding.isEmpty(this[0].getAttribute("defaultOptionValue"))?'':this[0].getAttribute("defaultOptionValue");
	if(!Ding.isEmpty(this.defaultOptionValue)||!Ding.isEmpty(this.defaultOptionHtml)){//默认值或者默认选项不为空的时候，显示默认值或者默认选项
		var defaultOption = document.createElement("option");
		defaultOption.innerHTML = this.defaultOptionHtml;
		defaultOption.value = this.defaultOptionValue;
		this[0].appendChild(defaultOption);
	}
	if(this.autoRequest==true)
		this.request();
};
Ding.Selector.prototype.request = function(){
	if(Ding.isEmpty(this.url)) throw "Selector请求链接为空!";
	//清空select的下拉选项
	var options = this[0].children;
	for(var i=options.length;i>1;i--){
		this[0].removeChild(options[i-1]);
	}
	var _this = this;
	Ding.ajax({
		'url':this.url,
		'async':false,
		'method':this.requestMethod,
		'successCallback':function(result){
			var dataList = result.data;
			if(Ding.isEmpty(dataList)) return;
			for(var i=0,len=dataList.length;i<len;i++){
				var data = dataList[i];
				var option = document.createElement("option");
				option.value = data[_this.valueProperty];
				option.innerHTML = data[_this.htmlProperty];
				if(!Ding.isEmpty(_this.otherField)){
					option.setAttribute(_this.otherField,data[_this.otherField]);
				}
				if(data[_this.valueProperty]==_this.selectedValue){
					option.setAttribute("selected","selected");
				}
				_this[0].appendChild(option);
			}
		}
	});
};
Ding.Selector.prototype.loadData = function(dataList){
	//清空select的下拉选项
	var options = this[0].children;
	for(var i=options.length;i>1;i--){
		this[0].removeChild(options[i-1]);
	}

	if(Ding.isEmpty(dataList)) return;
	for(var i=0,len=dataList.length;i<len;i++){
		var data = dataList[i];
		var option = document.createElement("option");
		option.value = data[this.valueProperty];
		option.innerHTML = data[this.htmlProperty];
		if(!Ding.isEmpty(this.otherField)){
			option.setAttribute(this.otherField,data[this.otherField]);
		}
		if(data[this.valueProperty]==this.selectedValue){
			option.setAttribute("selected","selected");
		}
		this[0].appendChild(option);
	}
};
Ding.Selector.prototype.reset = function(){
	var defaultOption = this[0].children;
	for(var i=0,len=this[0].children.length;i<this[0].children.length;i++){
		if(i==0)
			this[0].children[i].selected = true;
		else
			this[0].children[i].selected = false;
	}
};
Ding.Selector.prototype.setValue = function(val){
	var options = this[0].options;
	for(var i=0;i<options.length;i++){
		if(options[i].value==val){
			options[i].selected = true;
			break;
		}
	}
};
Ding.Selector.val = function(){
	var index = this[0].selectedIndex;
	return this[0].options[index].value;
};

Ding.Selector.prototype.clear = function(){
	this[0].options.length = 0;   
};
Ding.Selector.extend(Ding);//继承Ding.prototype的方法

Ding.SelectorInput = function(selector){
	Ding.call(this,selector);
	if(Ding.isEmpty(this.url)) throw "SelectorInput请求链接为空!";
}

//全屏区域左右滑动组件
Ding.SlideBox = function(selector){
	Ding.call(this,selector);
	this.childrenLength = this[0].children.length;//滑动组件的下层div的节点数量
	this.width(Ding.windowWidth()*this.childrenLength);//设置滑动区域的宽度
	//滑动区域中每个div宽度填充屏幕
	for(var i=0;i<this.childrenLength;i++){
		Ding.width(this[0].children[i],Ding.windowWidth());
	}
	var _this = this;
	var startPosition = { x : 0 , y : 0} ,  a = 0 , b = 0 , angle = 0 ;//记录起始坐标、a、b、角度
	var lastPosition = { x : 0 , y : 0};//
	var slideX = 0;//x轴拖拽的距离
	var slideY = 0;
	var slideDirection = 1;//滑动方向0向左，1向右
	var currentIndex = 0;//当前滑动的索引
//	var startSlide = false;//是否允许左右滑动
	var starTime;
//	this[0].addEventListener('touchstart',function(event){
//		startPosition.x = event.touches[0].pageX,
//		startPosition.y = event.touches[0].pageY,
//		lastPosition.x = event.touches[0].pageX,
//		lastPosition.y = event.touches[0].pageY;
//		starTime=new Date()*1;
//		
//		
//	});
	//此处的this是当前组件自己
//	this[0].addEventListener('touchmove',function(event){
//		b = Math.abs(event.touches[0].pageX - lastPosition.x);//x轴变化
//		a = Math.abs(event.touches[0].pageY - lastPosition.y);//y轴变化
//		if(a!=0){
//			angle = Math.atan(a/b)*180/Math.PI;
//			angle > 30 ? (''
//				// slideY += (event.touches[0].pageY - lastPosition.y),
//				// this.style.webkitTransform = 'translate(0px,'+slideY+'px)'
//			) : (
//				event.preventDefault(),
//				startSlide = true,
//				slideX += (event.touches[0].pageX - lastPosition.x),
//				this.style.webkitTransform = 'translate('+slideX+'px,0px)'
//			);
//			lastPosition.x = event.touches[0].pageX;
//			lastPosition.y = event.touches[0].pageY;
//		}
//	});
//	this[0].addEventListener('touchend',function(event){
//		var endTime=new Date()*1-starTime;
//		_this[0].removeEventListener('touchmove'),
//		_this[0].removeEventListener('touchend');
//		if(endTime>200){
//			Math.abs(slideX)>50?(
//				lastPosition.x < startPosition.x ? (
//					currentIndex++
//				):(
//					currentIndex--
//				),
//				currentIndex<0 ? currentIndex = 0 : '',
//				currentIndex>_this.childrenLength-1 ? currentIndex = _this.childrenLength-1 : ''
//			):'',
//			slideX = -currentIndex*Ding.windowWidth(),
//			this.style.transition="-webkit-transform 200ms ease-out",
//			this.style.webkitTransform = 'translate('+slideX+'px,0px)';
//		}
//	});
};
Ding.SlideBox.extend(Ding);
//============================================Ding校验器（静态方法）===========================================
(function(){
	Ding.validationDistributor = function(domer){
		var validationStr=domer.getAttribute("validations");
		var validationtips=domer.getAttribute("validationtips");
		//校验form中的validation 元素的 validations与validationtips是否存在空值,若一个存在,另外一个不存在,则throw 异常
		if(!Ding.isEmpty(validationStr)&&!Ding.isEmpty(validationtips)){
			//分割校验内容项
			var validations=validationStr.split("&&");
    		var validationTips=validationtips.split("&&");
    		//校验form中的validation 元素的 validations与validationtips长度是否对称
    		if(validations.length==validationTips.length){
    			var result = true;
    			for(var i=0;i<validations.length;i++){
    				var validationItems=validations[i].split("=");
					var validationItemKey=validationItems[0];//校验项方法名
					var validationItemValue=validationItems[1];//校验项比较值
					//校验非法字符
					// if(!Ding.validationItem['vSpecialSymbol']({'validationValue':validationItemValue,'component':domer})){//不通过
					// 	result = false;
					// 	Ding.tips("存在非法字符");
					// 	break;
					// }
					//validations逐一校验
					if(!Ding.validationItem[validationItemKey]({'validationValue':validationItemValue,'component':domer})){//不通过
						result = false;
						if(!Ding.isEmpty(validationTips[i]))
							Ding.tips(validationTips[i]);
						break;
					}
    			}
    			return result;
    		}
    		else{
    			console.log(domer);
    			throw "Error ! 表单中的校验项与校验提示必须一致!";
    		}
		}
		else{
			console.log(domer);
			throw "Error ! 表单中的校验项与校验提示必须同时存在!";
		}
	};
	Ding.validationItem = {
		/**
		 * 非空校验器
		 * @param event
		 */
		required:function(params){
			switch(params.component.getAttribute("type")){
				case 'checkbox':{
					return params.component.checked;
					break;
				}
				default :{
					return !Ding.isEmpty(params.component.value) ? true : false;
					break;
				}
			}
		},
		
		/**
		 * 校验手机号码
		 * @param componentValue
		 * @returns
		 */
		vPhone:function(params){
			if(Ding.isEmpty(params.component.value)) return true;
			var reg = /^1[3|4|5|7|8]\d{9}$/;
			return reg.test(params.component.value);
		},
		
		vEmail:function(params){
			if(Ding.isEmpty(params.component.value)) return true;
			var reg = /^([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
			return reg.test(params.component.value);
		},
		
		/**
		 * 校验字符串最大长度，不区分中英文
		 * @param params
		 * @returns {Boolean}
		 */
		vMaxLength:function(params){
			if(params.component.value.length<=params.validationValue){
				return true;
			}
			else{
				return false;
			}
		},
		/**
		 * 校验最长字节长度，英文：1字节，中文：2字节
		 * @param params
		 */
		vComplexMaxLength:function(params){
			var validationValue=params.validationValue;
			var i=0;
			var sum=0;
			while(i<params.component.value.length){
		        if(params.component.value.charCodeAt(i)>0||params.component.value.charCodeAt(i)<255){
		            sum++;
		        }
		        else{
		            sum+=2;
		        }
		        i++;
		    }
			if(sum<=validationValue){
				return true;
			}
			else{
				return false;
			}
		},
		/*固定长度校验*/
		vFixedLength : function(params){
			return params.component.value.length==params.validationValue;
		},
		/*长度区间校验，如6,18*/
		vRegionLength:function(params){
			var region=params.validationValue.split(",");
			var component = params.component;
			var min=region[0];
			var max=region[1];
			
			var validationValue=params.validationValue;
			var i=0;
			var sum=0;
			while(i<component.value.length){
		        if(component.value.charCodeAt(i)>0||component.value.charCodeAt(i)<255){
		            sum++;
		        }
		        else{
		            sum+=2;
		        }
		        i++;
		    }
			if(sum<min||sum>max){
				return false;
			}
			else{
				return true;
			}
		},
		vUserDefineCheck:function(params){
			return eval(params.validationValue+"('"+params.component.value+"')");
		},
		vUserDefineCheckComponent:function(params){
			var validationValue=params.validationValue;
			var component=params.component;
			return window[validationValue](component);
		},
		//正整数校验
		vPositiveInteger:function(params){
			var reg =  /^[1-9]\d*$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
			return false;
		},
		//整数校验
		vInteger:function(params){
			var reg =  /^[+-]?[1-9]?[0-9]*\.[0-9]*$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
			return false;
		},
		//字符串（排除数字，name用）
		vCharacter:function(params){
			var reg =  /^[a-zA-z\u4E00-\u9FA5]*$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
			return false;
		},
		//特殊字符串（nickname用）
		vSpecialCharacter:function(params){
			var reg =  /^[^`~!@#$%^&*()+=|\\\][\]\{\}:;'\,.<>/?]{1}[^`~!@$%^&()+=|\\\][\]\{\}:;'\,.<>?]{0,19}$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
			return false;
		},
		//0和正整数校验
		v0PositiveInteger:function(params){
			var reg =  /^[0-9]\d*$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
			return false;
		},
		/**
		 * 组件地址选择器校验
		 */
		vAddressSelectorNotNull:function(params){
			var component=params.component;
			//判断省与市不能为空
			var selectors=component.children("select");
			var province=selectors[0];
			var city=selectors[1];
			if($(province).val()==0||$(city).val()==0){
				return false;
			}
			else{
				return true;
			}
		},
		vNumber:function(params){
			var reg=/^[0-9]*$/;
			return reg.test(params.component.value);
		},
		vDecimalNumber:function(params){//验证数字（包括小数）
			var reg = /^[0-9]+(.[0-9]{1,15})?$/;
			if(!Ding.isUndefined(params.component)){
				return reg.test(params.component.value);
			}
			if(!Ding.isEmpty(params.value)){
				return reg.test(params.value);
			}
		},
		/**
		 * 身份证校验
		 */
		vIdNumber:function(params){
			var reg=/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
			return reg.test(params.component.value);
		},
		vSpecialSymbol:function(params){
			return !Ding.validationRegex.specialSymbolRegex.test(params.component.value);
		}
	};
	Ding.validationRegex = {
		specialSymbolRegex : new RegExp("[`~!#$^&*()=|{}':;',\\[\\]<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]")
	}
})();

//============================================Ding算法===========================================
(function(){
	//组合排序	start:从谁开始 end:全排列组合数长度 combinateCount:组合位数 comArray:存储的数组
	Ding.combinationSort = function(buf,start,end,comArray,combinateCount){
		if (start == end) {// 当只要求对数组中一个字母进行全排列时，只要就按该数组输出即可（特殊情况）
			var tempBuf = [];
			for (var i = 0; i < combinateCount; i++) {
				tempBuf.push(buf[i]);
			}
			comArray.push(tempBuf);
		} else {// 多个字母全排列（普遍情况）
			for (var i = start; i <= end; i++) {// （让指针start分别指向每一个数）
				var temp = buf[start];// 交换数组第一个元素与后续的元素
				buf[start] = buf[i];
				buf[i] = temp;

				Ding.combinationSort(buf, start + 1, end , comArray,combinateCount);// 后续元素递归全排列

				temp = buf[start];// 将交换后的数组还原
				buf[start] = buf[i];
				buf[i] = temp;
			}
		}
	};

	
})();
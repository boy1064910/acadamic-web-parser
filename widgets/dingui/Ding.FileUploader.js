//阿里云OSS直传，获取签名信息
var DingUploaderManager = {
	'signResult' : false,//获取oss签名结果，true：获取成功，false：获取失败
	'dir':'',
	'host' : '',
	'expire' : '',
	'uploadParams':{
		'key' : '',
        'policy': '',
        'OSSAccessKeyId': '', 
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : '',
        'signature': '',
	},
	'uploaderCache' : {},//此页面所有的uploader对象缓存
	'loadSign' : function(func){//获取oss签名结果
		Ding.ajax({
			'url':'/xfsw-web-business/business/oss/list.shtml',
			'successCallback':function(result){//获取oss签名结果成功
				var data = result.data;
				DingUploaderManager.uploadParams.OSSAccessKeyId = data.accessid;
				DingUploaderManager.uploadParams.policy = data.policy;
				DingUploaderManager.uploadParams.signature = data.signature;
				DingUploaderManager.uploadParams.callback = data.callback;

				DingUploaderManager.dir = data.dir;
				DingUploaderManager.host = data.host;
				DingUploaderManager.expire = data.expire;

				DingUploaderManager.signResult = true;
				console.log("获取OSS签名结果结束，初始化完毕!");
				if(!Ding.isEmpty(func))
					func();
			},
			'failCallback':function(result){//获取oss签名结果失败，系统异常
				alert('获取OSS签名结果失败，请联系系统管理员！');
			}
		});
	},
	checkExpire : function(){
		var time = new Date().getTime();
		if(time>DingUploaderManager.expire*1000){
			DingUploaderManager.loadSign();//重新获取签名
			// return false;
		}
		// return true;
	}
}

//图片预览
function previewImage(file,callback,domer,deletable){//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
    if(!file || !/image\//.test(file.type)) return; //确保文件是图片
    if(file.type=='image/gif'){//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader();
        fr.onload = function(){
            callback(fr.result,domer,deletable);
            fr.destroy();
            fr = null;
        }
        fr.readAsDataURL(file.getSource());
    }else{
        var preloader = new mOxie.Image();
        preloader.onload = function() {
            preloader.downsize( 300, 300 );//先压缩一下要预览的图片,宽300，高300
            var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg',80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc,domer,deletable); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load( file.getSource() );
    }    
}

//获取图片数据然后回调
function imgDataSourceCallback(file,jdomer,callback){//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
    if(!file || !/image\//.test(file.type)) return; //确保文件是图片
    if(file.type=='image/gif'){//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
        var fr = new mOxie.FileReader();
        fr.onload = function(){
            callback(fr.result,jdomer);
            fr.destroy();
            fr = null;
        }
        fr.readAsDataURL(file.getSource());
    }else{
        var preloader = new mOxie.Image();
        preloader.onload = function() {
            preloader.downsize( 300, 300 );//先压缩一下要预览的图片,宽300，高300
            var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg',80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
            callback && callback(imgsrc,jdomer); //callback传入的参数为预览图片的url
            preloader.destroy();
            preloader = null;
        };
        preloader.load( file.getSource() );
    }    
}




Ding.FileUploader = function(config){
	if(Ding.isEmpty(config.id)){
		console.log("页面初始化FileUplader,id不能为空！");
		return ;
	}
	//阿里云上传组件配置项
	this.multiSelection = Ding.isEmpty(config.multiSelection) ? false : config.multiSelection;//true：多选，false：单选，默认为单选
	this.limitType = Ding.isEmpty(config.limitType) ? '' : config.limitType;//限制类型
	this.maxFileSize = Ding.isEmpty(config.maxFileSize) ? '2m' : config.maxFileSize;//上传文件大小限制
	this.preventDuplicate = Ding.isEmpty(config.preventDuplicate) ? true : config.preventDuplicate;//true：不允许重复，false：允许重复，默认为不允许重复

	//Ding上传组件配置项
	this.id  = config.id;//页面元素ID，同时也作为上传器的ID，不允许两个上传器使用同一个ID
	this.selectorTitle = Ding.isEmpty(config.selectorTitle) ? '请选择文件' : config.selectorTitle;//上传按钮文字内容
	this.fileRename = Ding.isEmpty(config.fileRename) ? true : config.fileRename;//true：上传文件重命名，false：不重命名，默认重命名
	this.previewWidth = Ding.isEmpty(config.previewWidth)?"200px":config.previewWidth;//预览小图宽度，默认200px
	this.previewHeight = Ding.isEmpty(config.previewHeight)?"200px":config.previewHeight;//预览小图高度，默认200px
	this.needPreview = Ding.isEmpty(config.needPreview)?true:config.needPreview;//是否使用图片预览，默认“是”
	// this.maxFileLength = Ding.isEmpty(config.maxFileLength) ? '10' : config.maxFileLength;//上传文件数量限制，默认10个
	// this.successCallback = Ding.isEmpty(config.successCallback) ? null : config.successCallback;//文件上传完成回调函数
	this.completed = false;
	this.completeCallback = Ding.isEmpty(config.completeCallback) ? null : config.completeCallback;//全部文件上传完成回调函数
	this.addedCallback = Ding.isEmpty(config.addedCallback) ? null : config.addedCallback;//全部文件添加完成回调函数

	//Ding上传组件内部定义
	this.jdom = $("#"+this.id);
	this.jdom.addClass("ding-file-uploader");

	this.jselector = $('<button class="btn btn-default"><i class="fa fa-search-plus"></i> '+this.selectorTitle+'</button>');
	this.jselector.attr("id",Ding.randomId());
	this.jdom.append(this.jselector);

	this.jcontainer = $('<div class="container-div"></div>');
	this.jdom.append(this.jcontainer);

	this.uploaderStatus = true;
	
	var _this = this;
	//API文档：http://www.phpin.net/tools/plupload/
	this.uploader = new plupload.Uploader({
		browse_button : _this.jselector.attr("id"), 
		url : 'http://oss.aliyuncs.com',
		filters: {
	        mime_types : [
	        	{ title : _this.selectorTitle, extensions : _this.limitType }
	        ],
	        max_file_size : _this.maxFileSize,
	        prevent_duplicates : _this.preventDuplicate
	    },
		drop_element : _this.id,
		multi_selection : _this.multiSelection,
		runtimes : 'html5,flash,silverlight,html4',
		container : _this.id,
		flash_swf_url : '/widgets/plupload-2.1.2/js/Moxie.swf',
		silverlight_xap_url : '/widgets/plupload-2.1.2/js/Moxie.xap',
	    init: {
	    	PostInit: function() {
	    		_this.uploader.setOption({
					'url':DingUploaderManager.host,
					'multipart_params':DingUploaderManager.uploadParams
				});
			},
	    	FileFiltered : function(up,files){
				DingUploaderManager.checkExpire();
				if(!_this.multiSelection&&up.files.length>1){
					//清空预览区域和uploader的文件
					_this.jcontainer.empty();
					for(var f in up.files){
						if(files.id!=up.files[f].id)
							up.removeFile(up.files[f]);
					}
				}
	    	},
			FilesAdded: function(up, files) {
				if(!DingUploaderManager.signResult){
					alert('页面初始化签名信息未完成，请检查签名信息！');
					for(var f in files){
						up.removeFile(files[f]);
					}
					return;
				}
				if(!Ding.isEmpty(_this.addedCallback)){
					_this.addedCallback(up,files,_this);
				}
				else{
					for(var f in files){
						var jpreviewDiv = $('<div class="preview-div"></div>');
						var jprocessDiv = $('<div class="progress" id="progress'+files[f].id+'"></div>');
						var jprocessBar = $('<div class="progress-bar" id="progressBar'+files[f].id+'"></div>');

						jprocessDiv.append(jprocessBar);
						jpreviewDiv.append(jprocessDiv);

						var jinfoDiv = $('<div class="preview-info-div"></div>');
						var jinfoPercentSpan = $('<span id="percentSpan'+files[f].id+'">0%</span>');
						jinfoDiv.append(jinfoPercentSpan).append(files[f].name);
						jpreviewDiv.append(jinfoDiv);
						
						if(_this.needPreview){
							if(files[f] || !/image\//.test(files[f].type)){//属于图片文件，进行预览展示
								var jpreivewImgDiv = $('<div class="img-preview-div"></div>');
								jpreviewDiv.append(jpreivewImgDiv);
								imgDataSourceCallback(files[f],jpreivewImgDiv,function(imgSrc,jdomer){
									jdomer.css('background-image','url('+imgSrc+')');//回调渲染预览图片效果
								});
							}
							
						}
						_this.jcontainer.append(jpreviewDiv);
					}
				}
				up.start();
			},
			BeforeUpload: function(up, file) {
				_this.completed = false;
				var key = '';
				var subfixName = Ding.fileSubfixName(file.name);
				key = DingUploaderManager.dir + Ding.randomId() + subfixName;
				file.uploadPath = key;
				DingUploaderManager.uploadParams.key = key;
	        },
	        UploadProgress: function(up, file) {
	        	var width = $("#progress"+file.id).width();
	        	var nwidth = parseInt(file.percent)/100*parseInt(width);
	        	$("#progressBar"+file.id).css('width',nwidth);
	        	$("#percentSpan"+file.id).html(file.percent+"%");
			},     
			FileUploaded: function(up, file, info) {
				_this.jcontainer.scrollTop( _this.jcontainer[0].scrollHeight );
			},
			UploadComplete:function(up,files){
				_this.completed = true;
				if(!Ding.isEmpty(_this.completeCallback)){
					_this.completeCallback(up,files,_this);
				}
			},
			Error: function(up, err) {
				var name = err.file.name;
				var toremove = '';
				for(var i in this.files){
		         	if(this.files[i].name == name){
			            toremove = i;
				    }
				}
				if (err.code == -600) {
					this.files.splice(toremove, 1);	
					alert("文件大小不能超过"+_this.maxFileSize);
				}
				else if (err.code == -601) {
					this.files.splice(toremove, 1);	
					alert("选择的文件格式不对");
				}
				else if (err.code == -602) {
				   	alert(this.files[toremove].name+" 这个文件已经上传过一遍了");
				}
				else{
					this.files.splice(toremove, 1);	
					alert(this.files[toremove].name+" 文件上传失败，请重新上传" );
				}
			}
		}
	});
	this.uploader.init();
};

Ding.FileUploader.prototype.reset = function(){
	this.jcontainer.empty();
	this.uploader.refresh();
}
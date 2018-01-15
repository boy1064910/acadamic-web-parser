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
			'url':projectName+'/manager/data/post/policy/list.shtml',
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
			return false;
		}
		return true;
	}
}


Ding.FileUploader = function(config){
	if(Ding.isEmpty(config.id)){
		console.log("页面初始化FileUplader,id不能为空！");
		return ;
	}
	this.id  = config.id;
	this.completed = null;
	this.moreSelection = Ding.isEmpty(config.moreSelection) ? false : config.moreSelection;//true：多选，false：单选，默认为单选
	this.manualUpload = Ding.isEmpty(config.manualUpload) ? true : config.manualUpload;//true：手动上传，false：自动上传，默认为手动上传
	this.limitType = Ding.isEmpty(config.limitType) ? '' : config.limitType;//限制类型
	this.selectorTitle = Ding.isEmpty(config.selectorTitle) ? '请选择文件' : config.selectorTitle;//上传组件标题
	this.preventDuplicate = Ding.isEmpty(config.preventDuplicate) ? true : config.preventDuplicate;//true：不允许重复，false：允许重复，默认为不允许重复
	this.maxFileSize = Ding.isEmpty(config.maxFileSize) ? '10m' : config.maxFileSize;//上传文件大小限制
	this.fileRename = Ding.isEmpty(config.fileRename) ? true : config.fileRename;//true：上传文件重命名，false：不重命名，默认重命名
	this.exsitImgUrl = config.exsitImgUrl;//回显的图片url  
	this.allImgUrls = [];//上传组件中所有的图片链接
	this.delImgUrls = [];//已经存在的图片，删除后此处会记录
	this.uploadPaths = {};//此处的数据只有新上传的图片路径
	this.width = config.width;
	this.height = config.height;
	this.maxFileLength = Ding.isEmpty(config.maxFileLength) ? '10' : config.maxFileLength;//上传文件数量限制
	this.deletable = Ding.isEmpty(config.deletable) ? true : config.deletable;//是否允许删除 true：允许，false：不允许，默认允许删除
	this.showName = Ding.isEmpty(config.showName) ? false : config.showName;//是否显示文件名称 false：不显示，true：显示
	this.addedCallback = Ding.isEmpty(config.addedCallback) ? null : config.addedCallback;//添加完文件回调函数
	this.dom = document.getElementById(this.id);

	if(Ding.isEmpty(this.dom)){
		console.log("页面初始化失败，找不到id："+this.id+"元素！");
		return ;
	}
	this.dom.className = "ding-file-uploader";

	// if(Ding.isEmpty(DingUploaderManager.uploaderCache[this.id])){
	// 	DingUploaderManager.uploaderCache[this.id] = this;
	// }
	// else{
	// 	console.log("页面初始化两次FileUplader,id:"+this.id);
	// }

	this.container = document.createElement("div");
	this.container.className = 'ding-file-uploader-container';
	this.dom.appendChild(this.container);

	//添加选择按钮
	this.selector = document.createElement("button");
	this.selector.innerHTML = "<i class='fa fa-search-plus'></i> " + this.selectorTitle;
	this.selector.className = "btn btn-default";
	this.selector.id = Ding.randomId();
	this.container.appendChild(this.selector);
	//添加上传按钮
	this.uploaderBtn = null;
	if(this.manualUpload){
		this.uploaderBtn = document.createElement("a");
		this.uploaderBtn.innerHTML = "上传";
		this.uploaderBtn.id = Ding.randomId();
		this.container.appendChild(this.uploaderBtn);
	}

	this.infoContainer = document.createElement("div");
	this.infoContainer.className = "ding-file-uploader-info-container";
	this.container.appendChild(this.infoContainer);	

	var _this = this;
	//挨个文件上传，检测是否需要重命名
	this.startUpload = function(file){
		
	};
	this.uploader = new plupload.Uploader({
		runtimes : 'html5,flash,silverlight,html4',
		browse_button : _this.selector.id, 
	    multi_selection : _this.moreSelection,
		// container: _this.container,//展现上传文件列表的容器
		flash_swf_url : '/widgets/plupload-2.1.2/js/Moxie.swf',
		silverlight_xap_url : '/widgets/plupload-2.1.2/js/Moxie.xap',
		url : 'http://oss.aliyuncs.com',

	    filters: {
	        mime_types : [
	        	{ title : _this.selectorTitle, extensions : _this.limitType }
	        ],
	        max_file_size : _this.maxFileSize,
	        prevent_duplicates : _this.preventDuplicate
	    },
	    init: {
	    	PostInit: function() {
	    		var resize = {};
	    		if(!Ding.isEmpty(_this.width)){
	    			resize.width = 100;
	    		}
				if(!Ding.isEmpty(_this.height)){
	    			resize.height = 133;
	    		}
	    		_this.uploader.setOption({
					'url':DingUploaderManager.host,
					'multipart_params':DingUploaderManager.uploadParams,
					'resize':resize
				});
	    		if(_this.manualUpload){//手动点击上传
	    			_this.uploaderBtn.onclick = function(){
	    				if(_this.uploader.files.length == 0){
	    					alert("请选择上传文件！");
	    					return false;
	    				}
	    				else{
	    					_this.uploader.start();
	    				}
	    			}
	    		}
			},
			FilesAdded: function(up, files) {
				if(!DingUploaderManager.signResult){
					alert('页面初始化签名信息未完成，请检查签名信息！');
					return false;
				}
				if(!DingUploaderManager.checkExpire()){
					DingUploaderManager.loadSign();
				}

				var result = true;
				var fileName = '';
				if(_this.moreSelection){
					if(Ding.isArray(_this.exsitImgUrl)&&_this.exsitImgUrl.length>0){
						for(var i=0;i<files.length;i++){
							for(var j=0;j<_this.exsitImgUrl.length;j++){
								if(_this.exsitImgUrl[j].indexOf(files[i].name)!=-1){
									fileName = files[i].name;
									result = false;
									break;
								}
							}
						}
					}
				}
				else{
					if(!Ding.isEmpty(_this.exsitImgUrl)&&_this.exsitImgUrl.indexOf(files[0].name)!=-1){
						result = false;
						fileName = files[i].name;
					}
				}
				
				if(!result){
					alert(fileName+" 这个文件已经上传过一遍了");
					for(var i in files){
						up.removeFile(files[i].id);
					}
					return false;
				}

				
				if(!Ding.isEmpty(_this.maxFileLength)){
					var len = up.files.length;
					if(Ding.isArray(_this.exsitImgUrl)){
						len += _this.exsitImgUrl.length;
					}
					if(len>_this.maxFileLength){
						for(var i in files){
							up.removeFile(files[i].id);
						}
						alert('上传文件数量不能超过'+_this.maxFileLength+"个！");
						return false;
					}
				}
				if(!_this.moreSelection){//单选
					if(up.files.length>1){
						var d = _this.infoContainer.children[0];
						d.parentNode.removeChild(d);//移除页面元素
						if(up.files.length>1)//移除队列文件
							up.files.shift();
					}

					var file = files[0];
					var info = document.createElement('div');
					info.className = "ding-file-uploader-info";
					info.id = file.id;
					_this.infoContainer.appendChild(info);
					//添加进度条
					var processer = document.createElement("div");
					processer.className = "progress";
					if(!Ding.isEmpty(_this.width)){
						processer.style.width = (_this.width)+"px";
					}
					var processBar = document.createElement("div");
					processBar.className = "progress-bar";
					processer.appendChild(processBar);
					info.appendChild(processer);
									
					if(_this.showName){
						var title = document.createElement('p');
						var percentB = document.createElement('b');
						percentB.innerHTML = '0%';
						var infoSpan = document.createElement('span');
						infoSpan.style.display = "block";
						infoSpan.style.whiteSpace = 'nowrap';
						infoSpan.style.overflow = 'hidden';
						infoSpan.style.width = '130px';
						infoSpan.style.textAlign = 'left';
						infoSpan.innerHTML = file.name;
						title.appendChild(percentB);
						title.appendChild(infoSpan);
						info.appendChild(title);
					}

					previewImage(file,function(imgsrc,_info,_deletable){
						var img = document.createElement('img');
						img.src = imgsrc;
						_info.appendChild(img);
		            },info,_this.deletable);
				}
				else{//多选
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						var info = document.createElement('div');
						info.className = "ding-file-uploader-info";
						info.id = file.id;
						_this.infoContainer.appendChild(info);
						//添加进度条
						var processer = document.createElement("div");
						processer.className = "progress";
						if(!Ding.isEmpty(_this.width)){
							processer.style.width = (_this.width)+"px";
						}
						var processBar = document.createElement("div");
						processBar.className = "progress-bar";
						processer.appendChild(processBar);
						info.appendChild(processer);
						
						if(_this.showName){
							var title = document.createElement('p');
							var percentB = document.createElement('b');
							percentB.innerHTML = '0%';
							var infoSpan = document.createElement('span');
							infoSpan.style.display = "block";
							infoSpan.style.whiteSpace = 'nowrap';
							infoSpan.style.overflow = 'hidden';
							infoSpan.style.width = '130px';
							infoSpan.style.textAlign = 'left';
							infoSpan.innerHTML = file.name;
							title.appendChild(percentB);
							title.appendChild(infoSpan);
							info.appendChild(title);
						}

						previewImage(file,function(imgsrc,_info,_deletable){
							var imgDiv = document.createElement('div');
							imgDiv.className = "ding-file-uploader-img-div";
							var img = document.createElement('img');
							img.src = imgsrc;
							if(!Ding.isEmpty(_this.width)){
								img.style.width = _this.width+"px";
							}
							if(!Ding.isEmpty(_this.height)){
								img.style.height = _this.height+"px";
							}
							imgDiv.appendChild(img);
							_info.appendChild(imgDiv);

							var btnDiv = document.createElement('div');
							btnDiv.className = "ding-file-uploader-btn-div";

							var leftBtn = document.createElement('button');
							leftBtn.className = "o-btn";
							leftBtn.type="button";
							var leftI = document.createElement("i");
							leftI.className = "fa fa-caret-square-o-left";
							leftBtn.appendChild(leftI);
							$(leftBtn).on("click",function(){
								if(this.completed!=null&&!_this.completed){
									alert("请等待图片上传完成再移动！");
									return;
								}
								var u = $(this).parent().parent().parent();
								if(u.index()==0) return;
								var tempUrl = _this.allImgUrls[u.index()];
								var prevUrl = _this.allImgUrls[u.index()-1];
								_this.allImgUrls[u.index()-1] = tempUrl;
								_this.allImgUrls[u.index()] = prevUrl;
								var prev = u.prev();
								prev.before(u);
							});

							var rightBtn = document.createElement('button');
							rightBtn.className = "o-btn";
							rightBtn.type = "button";
							var rightI = document.createElement("i");
							rightI.className = "fa fa-caret-square-o-right";
							rightBtn.appendChild(rightI);
							$(rightBtn).on("click",function(){
								if(this.completed!=null&&!_this.completed){
									alert("请等待图片上传完成再移动！");
									return;
								}
								var u = $(this).parent().parent().parent();
								if(u.index()==$(this).parent().parent().parent().parent().children().length) return;
								var tempUrl = _this.allImgUrls[u.index()];
								var prevUrl = _this.allImgUrls[u.index()+1];
								_this.allImgUrls[u.index()+1] = tempUrl;
								_this.allImgUrls[u.index()] = prevUrl;
								var prev = u.next();
								prev.after(u);
							});

							btnDiv.appendChild(leftBtn);
							btnDiv.appendChild(rightBtn);

							if(_deletable){
								var minusI = document.createElement("i");
								minusI.className = "fa fa-trash-o";
								var delButton = document.createElement("button");
								delButton.className = "o-btn";
								delButton.type = "button";
								delButton.title="删除";
								delButton.appendChild(minusI);
								delButton.onclick = function(){
									_info.parentNode.removeChild(_info);
									_this.uploader.removeFile(_info.getAttribute("id"));
									var _allImgUrls = [];
									var deletePath = _this.uploadPaths[this.parentNode.parentNode.getAttribute("id")];
									for(var i=0;i<_this.allImgUrls.length;i++){
										if(_this.allImgUrls[i].indexOf(deletePath)==-1){
											_allImgUrls.push(_this.allImgUrls[i]);
										}
									}
									_this.allImgUrls = _allImgUrls;
									delete _this.uploadPaths[this.parentNode.parentNode.getAttribute("id")];
								}
								btnDiv.appendChild(delButton);
							}
							
							imgDiv.appendChild(btnDiv);
							if(!Ding.isEmpty(_this.addedCallback)){
								_this.addedCallback(imgDiv);
							}
			            },info,_this.deletable);
					};
				}
				if(!_this.manualUpload){
					_this.uploader.start();
				}
			},
			
			//当队列中的某一个文件正要开始上传前触发
			BeforeUpload: function(up, file) {
				_this.completed = false;
				var key = '';
				if(_this.fileRename){
					var subfixName = Ding.fileSubfixName(file.name);
					key = DingUploaderManager.dir + Ding.randomId() + subfixName;
				}
				else{
					key = DingUploaderManager.dir + file.name;
				}
				file.uploadPath = key;
				DingUploaderManager.uploadParams.key = key;
	        },
	        //会在文件上传过程中不断触发，可以用此事件来显示上传进度
	        UploadProgress: function(up, file) {
	        	var d = document.getElementById(file.id);
	        	var processBar = d.children[0].children[0];
	        	processBar.style.width= 2*file.percent+'px';
	        	processBar.setAttribute('aria-valuenow', file.percent);
	        	if(_this.showName){
		        	var percent = d.children[1].children[0];
		        	percent.innerHTML = file.percent+"%";
	        	}
			},
			//当队列中的某一个文件上传完成后触发         
			FileUploaded: function(up, file, info) {
				// $("#"+file.id).children(".progress").after("<div>上传完成</div>");
				var len = 0;
				for(var i in _this.uploadPaths){
					len++;
				}
				if(!_this.moreSelection&&len>=1){//单选
					_this.uploadPaths = {};//重置
				}
				_this.uploadPaths[file.id] = DingUploaderManager.host + '/' + file.uploadPath;
				_this.allImgUrls.push(DingUploaderManager.host + '/' + file.uploadPath);
			},
			UploadComplete:function(up,files){
				console.log(files);
				_this.completed = true;
			},
			//当发生错误时触发,上传失败
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
					alert("选择的文件太大了");
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
	
	if(!Ding.isEmpty(this.exsitImgUrl)){
		if(Ding.isArray(this.exsitImgUrl)){
			var _this = this;
			for (var i = 0; i < this.exsitImgUrl.length; i++) {
				this.allImgUrls.push(this.exsitImgUrl[i]);//回显图片加入到所有图片队列中
				var info = document.createElement('div');
				info.className = "ding-file-uploader-info";

				var imgDiv = document.createElement('div');
				imgDiv.className = "ding-file-uploader-img-div";
				imgDiv.style.marginTop = "24px";
				var img = document.createElement('img');
				img.src = this.exsitImgUrl[i];
				if(!Ding.isEmpty(this.width)){
					img.style.width = this.width+"px";
				}
				if(!Ding.isEmpty(this.height)){
					img.style.height = this.height+"px";
				}
				imgDiv.appendChild(img);

				img.addEventListener("click",viewImg);

				var btnDiv = document.createElement('div');
				btnDiv.className = "ding-file-uploader-btn-div";

				var leftBtn = document.createElement('button');
				leftBtn.className = "o-btn";
				leftBtn.type="button";
				var leftI = document.createElement("i");
				leftI.className = "fa fa-caret-square-o-left";
				leftBtn.appendChild(leftI);
				$(leftBtn).on("click",function(){
					if(this.completed!=null&&!_this.completed){
						alert("请等待图片上传完成再移动！");
						return;
					}
					var u = $(this).parent().parent().parent();
					if(u.index()==0) return;
					var tempUrl = _this.allImgUrls[u.index()];
					var prevUrl = _this.allImgUrls[u.index()-1];
					_this.allImgUrls[u.index()-1] = tempUrl;
					_this.allImgUrls[u.index()] = prevUrl;
					var prev = u.prev();
					prev.before(u);
				});


				var rightBtn = document.createElement('button');
				rightBtn.className = "o-btn";
				rightBtn.type = "button";
				var rightI = document.createElement("i");
				rightI.className = "fa fa-caret-square-o-right";
				rightBtn.appendChild(rightI);
				$(rightBtn).on("click",function(){
					if(this.completed!=null&&!_this.completed){
						alert("请等待图片上传完成再移动！");
						return;
					}
					var u = $(this).parent().parent().parent();
					if(u.index()==$(this).parent().parent().parent().parent().children().length) return;
					var tempUrl = _this.allImgUrls[u.index()];
					var prevUrl = _this.allImgUrls[u.index()+1];
					_this.allImgUrls[u.index()+1] = tempUrl;
					_this.allImgUrls[u.index()] = prevUrl;
					var prev = u.next();
					prev.after(u);
				});

				btnDiv.appendChild(leftBtn);
				btnDiv.appendChild(rightBtn);

				if(this.deletable){
					var minusI = document.createElement("i");
					minusI.className = "fa fa-trash-o";
					var delButton = document.createElement("button");
					delButton.className = "o-btn";
					delButton.type="button";
					delButton.title="删除";
					delButton.appendChild(minusI);
					delButton.onclick = function(){
						var _info = $(this).parent().parent().parent();
						var _thisImgUrl = $(this).parent().prev().attr("src");
						//从界面删除和所有图片数组中删除，已上传的数组中没有这些数据
						var _allImgUrls = [];
						var _exsitImgs = [];
						for(var i=0;i<_this.allImgUrls.length;i++){
							if(_this.allImgUrls[i].indexOf(_thisImgUrl)==-1){
								_allImgUrls.push(_this.allImgUrls[i]);
							}
						}
						for(var i=0;i<_this.exsitImgUrl.length;i++){
							if(_this.exsitImgUrl[i].indexOf(_thisImgUrl)==-1){
								_exsitImgs.push(_this.exsitImgUrl[i]);
							}
						}
						_this.allImgUrls = _allImgUrls;
						_this.exsitImgUrl = _exsitImgs;
						_info.remove();
					}
					btnDiv.appendChild(delButton);
				}
				imgDiv.appendChild(btnDiv);


				info.appendChild(imgDiv);
				this.infoContainer.appendChild(info);

				var id = Ding.randomId(10);
				info.setAttribute("id",id);
				if(this.deletable){
					var delDiv = document.createElement("a");
					delDiv.className = 'del_btn';
					delDiv.onclick = function(){
						var imgUrl = this.parentNode.children[0].getAttribute("src");
						var newArray = [];
						for(var i =0;i<_this.exsitImgUrl.length;i++){
							if(_this.exsitImgUrl[i].indexOf(imgUrl)==-1){
								newArray.push(_this.exsitImgUrl[i]);
							}
							else{
								_this.delImgUrls.push(_this.exsitImgUrl[i]);
							}
						}
						_this.exsitImgUrl = newArray;
						//重置所有图片链接数组
						var _allImgUrls = [];
						for(var i=0;i<_this.allImgUrls.length;i++){
							if(_this.allImgUrls[i].indexOf(imgUrl)==-1){
								_allImgUrls.push(_this.allImgUrls[i]);
							}
						}
						_this.allImgUrls = _allImgUrls;
						_this.uploader.removeFile(this.parentNode.parentNode.getAttribute("id"));
						this.parentNode.parentNode.removeChild(this.parentNode);					
					}
					imgDiv.appendChild(delDiv);
				}

				// if(!Ding.isEmpty(_this.addedCallback)){
				// 	_this.addedCallback(imgDiv);
				// }
			}
		}
		else{
			var info = document.createElement('div');
			info.className = "ding-file-uploader-info";

			var img = document.createElement('img');
			img.src = this.exsitImgUrl;
			info.appendChild(img);
			this.infoContainer.appendChild(info);
			this.uploader.files[0] = {};
			this.uploader.files[0].uploadPath = this.exsitImgUrl;
			var id = Ding.randomId(10);
			info.setAttribute("id",id);
			this.uploader.files[0].id = id;
			this.allImgUrls[0] = this.exsitImgUrl;

			img.addEventListener("click",viewImg);
		}
	}

	this.uploader.init();
};



function viewImg(){
	$(".ding-file-uploader-view").remove();

	var view = document.createElement("div");
	view.className = "ding-file-uploader-view";
	document.body.appendChild(view);

	var curtain = document.createElement("div");
	curtain.className = "curtain";
	$(curtain).css('background-image','url("'+this.src+'")');
	view.appendChild(curtain);

	var masker = document.createElement("div");
	masker.className = "masker";
	view.appendChild(masker);

	view.addEventListener("click",closeViewImg);
}

function closeViewImg(){
	$(this).remove();
}
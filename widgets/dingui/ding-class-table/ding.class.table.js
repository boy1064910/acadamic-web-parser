Ding.ClassTable = function(config){
	// //计算第一天和最后一天的日期
	this.currentDate = new Date(Ding.formatDate(new Date())+" 00:00:00");
	if($.isEmpty(config.firstDate)){
		this.firstDate = Ding.caculateDate(this.currentDate,1);
		this.lastDate = Ding.caculateDate(this.firstDate,6);
	}
	else{
		this.firstDate = config.firstDate;
		this.lastDate = Ding.caculateDate(this.firstDate,6);
	}

	var year=this.firstDate.getFullYear(); 
	var month=this.firstDate.getMonth()+1;
	var currentDay = this.firstDate.getDay();
	
	this.id = config.id;
	this.rowData = config.rowData;
	this.lumpClickCallback = config.lumpClickCallback;//时间块点击回调事件，结合底下初始化时间块的点击事件使用
	this.dateChangedCallback = config.dateChangedCallback;
	
	this.init();

	var _this = this;
	this.lDateLump.on("click",function(){
		_this.firstDate = Ding.caculateDate(_this.firstDate,-7);
		_this.lastDate = Ding.caculateDate(_this.lastDate,-7);
		_this.renderDate();
		if(!$.isEmpty(_this.dateChangedCallback)){
			var config = {
				'firstDate' : _this.firstDate
			};
			_this.dateChangedCallback(config);
		}
	});

	this.rDateLump.on("click",function(){
		_this.firstDate = Ding.caculateDate(_this.firstDate,7);
		_this.lastDate = Ding.caculateDate(_this.lastDate,7);
		_this.renderDate();
		if(!$.isEmpty(_this.dateChangedCallback)){
			var config = {
				'firstDate' : _this.firstDate
			};
			_this.dateChangedCallback(config);
		}
	});

	this.mDateLump.datetimepicker({
		'minView': 2,
		'autoclose': true
	});
	this.mDateLump.datetimepicker().on("changeDate",function(e){
		_this.firstDate = e.date;
		_this.lastDate = Ding.caculateDate(_this.firstDate,6);
		_this.renderDate();
		if(!$.isEmpty(_this.dateChangedCallback)){
			var config = {
				'firstDate' : _this.firstDate
			};
			_this.dateChangedCallback(config);
		}
	});
}

Ding.ClassTable.prototype.init = function(){
	var container = $('#'+this.id);
	
	//初始化日期范围栏目
	var header = $('<div class="ding-class-table-header"></div>');
	this.lDateLump = $('<span><</span>');
	this.rDateLump = $('<span>></span>');
	this.mDateLump = $('<span></span>');
	header.append(this.lDateLump).append(this.mDateLump).append(this.rDateLump);
	container.append(header);

	//初始化日期和星期栏目
	var sHeader = $('<div class="ding-class-table-second-header"></div>');
	var sHeader_l = $('<div class="ding-class-table-second-header-l"></div>');
	this.sHeader_r = $('<div class="ding-class-table-second-header-r"></div>');
	sHeader.append(sHeader_l).append(this.sHeader_r);
	container.append(sHeader);
	this.width_r = sHeader.width()-150;
	this.width_r_hour = this.width_r/(7*15);
	this.sHeader_r.width(this.width_r);//为右侧配置宽度

	//初始化内容栏目左侧列
	var body = $('<div class="ding-class-table-body"></div>');
	this.body_l = $('<div class="ding-class-table-body-l"></div>');
	this.body_r = $('<div class="ding-class-table-body-r"></div>');
	body.append(this.body_l).append(this.body_r);
	container.append(body);

	//初始化内容栏目左侧列内容
	for(var i=0;i<this.rowData.length;i++){
		this.body_l.append('<div data-id="'+this.rowData[i].id+'" title="'+this.rowData[i].name+'">'+this.rowData[i].name+'</div>');
	}

	var _this = this;
	//初始化内容右侧
	for(var i=0;i<this.rowData.length;i++){
		var body_r_line = $('<div class="ding-class-table-body-r-line"></div>');
		for(var j=0;j<7;j++){
			var body_r_line_date = $('<div class="ding-class-table-body-r-date"></div>');
			body_r_line_date.width(this.width_r/7);
			body_r_line.append(body_r_line_date);
			if(!$.isEmpty(this.lumpClickCallback)){
				body_r_line_date.on("click",function(){//时间块点击事件
					var colIndex = $(this).index();
					var rowIndex = $(this).parent().index();
					var selectedDate = Ding.formatDate(Ding.caculateDate(_this.firstDate,colIndex));
					if(new Date(selectedDate+" 00:00:00").getTime()<=_this.currentDate.getTime()){//补齐日期，当小于等于当前日期，无点击操作
						return;
					}
					var classRoomId = $(_this.body_l.children().get(rowIndex)).attr("data-id");
					var classRoomName = $(_this.body_l.children().get(rowIndex)).html();
					_this.lumpClickCallback({
						'selectedDate' : selectedDate,
						'rowIndex' : rowIndex,
						'colIndex' : colIndex,
						'classRoomId' : classRoomId,
						'classRoomName' : classRoomName
					});
				})
			}
		}
		this.body_r.append(body_r_line);
	}
	
	this.renderDate();
}

Ding.ClassTable.prototype.renderDate = function(){
	this.mDateLump.html(Ding.formatDate(this.firstDate,"%Y-%M-%d")+' ~ '+Ding.formatDate(this.lastDate,"%Y-%M-%d"));

	this.sHeader_r.empty();
	//初始化日期和星期栏目内容数据
	for(var i=0;i<7;i++){
		var div = $('<div></div>');
		div.width(this.width_r/7);
		var date = Ding.caculateDate(this.firstDate,i);
		div.append('<div class="ding-class-table-second-header-title-date">'+Ding.formatDate(date)+'</div>');
		div.append('<div class="ding-class-table-second-header-title-day">'+Ding.caculateDay(date)+'</div>');
		div.attr("data-date",Ding.formatDate(date));
		this.sHeader_r.append(div);
	}

	//计算当前日期栏小于或者等于今天的列索引
	var days = this.currentDate.getTime() - this.lastDate.getTime(); 
　　var day = parseInt(days / (1000 * 60 * 60 * 24)); 
	var unableIndex = 6 + day;
	if(unableIndex>0){
		var rowChildren = this.body_r.children();
		for(var i=0;i<rowChildren.length;i++){
			var colChildren = $(rowChildren[i]).children();
			for(var j=0;j<colChildren.length;j++){
				if(j<=unableIndex){
					$(colChildren[j]).css('background-color','#eee');
				}
				else{
					$(colChildren[j]).css('background-color','#fff');
				}
			}
		}
	}
	else{
		$(".ding-class-table-body-r-date").css('background-color','#fff');
	}
}

/**
*	rowIndex: "行下标索引", 
*	colIndex: 列下标索引, 
*	startTime: 开始时间,
*	times: 小时数量, 
*	text: 显示文字,
*	type: 字符串，对应样式，success\primary\danger
*/
Ding.ClassTable.prototype.fillTable = function(config) {
	var startTimes = config.startTime.split(":");
	var hour = startTimes[0];
	var minute = startTimes[1];
	var left = (parseInt(hour) - 7 + parseInt(minute)/60) * this.width_r_hour ;
	var row = this.body_r.children().get(config.rowIndex);
	var lump = $(row).children().get(config.colIndex);
	var timesLump = $('<div class="ding-class-table-body-r-time-lump"></div>');
	timesLump.width(this.width_r_hour*config.times);
	timesLump.css("left",left);
	timesLump.html(config.text);
	timesLump.addClass("ding-class-table-body-r-time-lump-"+config.type);
	$(lump).append(timesLump);

	timesLump.attr("title",config.titler);
	timesLump.attr("data-toggle","tooltip");
	timesLump.tooltip({'html':true});

	timesLump.attr('data-id',config.dataId);
}

Ding.ClassTable.prototype.clearTable = function() {
	this.body_r.find(".ding-class-table-body-r-time-lump").remove();
}

Ding.ClassTable.prototype.removeLumpByDataId = function(dataId){
	this.body_r.find('.ding-class-table-body-r-time-lump[data-id="'+dataId+'"]').remove();
}

//date 日期格式
Ding.ClassTable.prototype.getColIndex = function(date) {
	var dateStr = Ding.formatDate(date);
	return this.sHeader_r.children('[data-date="'+dateStr+'"]').index();
}

Ding.ClassTable.prototype.getRowIndex = function(classRoomId) {
	return this.body_l.children('[data-id="'+classRoomId+'"]').index();
}
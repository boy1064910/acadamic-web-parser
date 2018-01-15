Ding.Calendar = function(config){
	var date = new Date(formatDate(new Date(),"%Y-%M-%d")+" 00:00");//获取当前时间，转换为凌晨零点
	var year=date.getFullYear(); 
	var month=date.getMonth()+1;
	var currentDay = date.getDay();
	//计算第一天和最后一天的日期
	this.firstDate = caculateDate(date,-currentDay+1);
	this.lastDate = caculateDate(date,14-currentDay);
	
	this.id = config.id;
	this.tableWidth = $.isEmpty(config.tableWidth) ? $("#"+this.id).parent().width() : config.tableWidth;
	this.tdWidth = (this.tableWidth - 50)/14;
	this.tdHeight = 30;
	this.tdClickCallback = config.tdClickCallback;
	this.renderDateCallback = config.renderDateCallback;

	this.header = $('<div class="ding-calendar-header"></div>');
	this.mDateLump = $('<span></span>');
	
	this.init();

	var _this = this;
	this.lDateLump.on("click",function(){
		_this.firstDate = caculateDate(_this.firstDate,-14);
		_this.lastDate = caculateDate(_this.lastDate,-14);
		_this.renderDate();
		$(".course-div").remove();
		if(!$.isEmpty(_this.renderDateCallback)){
			_this.renderDateCallback();
		}
	});

	this.rDateLump.on("click",function(){
		_this.firstDate = caculateDate(_this.firstDate,14);
		_this.lastDate = caculateDate(_this.lastDate,14);
		_this.renderDate();
		$(".course-div").remove();
		if(!$.isEmpty(_this.renderDateCallback)){
			_this.renderDateCallback();
		}
	});

	this.todayBtn.on("click",function(){
		_this.firstDate = caculateDate(date,-currentDay+1);
		_this.lastDate = caculateDate(date,14-currentDay);
		_this.renderDate();
		$(".course-div").remove();
		if(!$.isEmpty(_this.renderDateCallback)){
			_this.renderDateCallback();
		}
	});
}

Ding.Calendar.prototype.init = function(){
	var _this = this;
	var container = $('#'+this.id);
	container.addClass("ding-calendar");
	
	this.lDateLump = $('<span><</span>');
	this.rDateLump = $('<span>></span>');
	this.header.append(this.lDateLump).append(this.mDateLump).append(this.rDateLump);
	this.todayBtn = $('<span class="today-btn">返回今天</span>');
	this.header.append(this.todayBtn);
	container.append(this.header);

	this.tabler = $('<table class="ding-calendar-table"></table>');
	this.tabler.width(this.tableWidth);
	var weekTr = $('<tr></tr>');
	
	weekTr.append('<th></th>');
	for(var i=0;i<=1;i++){
		var mondayer = $('<th>周一</th>');
		var tuesdayer = $('<th>周二</th>');
		var wednesdayer = $('<th>周三</th>');
		var thursdayer = $('<th>周四</th>');
		var fridayer = $('<th>周五</th>');
		var saturdayer = $('<th>周六</th>');
		var sundayer = $('<th>周日</th>');
		mondayer.width(this.tdWidth),
		tuesdayer.width(this.tdWidth),
		wednesdayer.width(this.tdWidth),
		thursdayer.width(this.tdWidth),
		fridayer.width(this.tdWidth),
		saturdayer.width(this.tdWidth),
		sundayer.width(this.tdWidth);
		weekTr.append(mondayer).append(tuesdayer).append(wednesdayer).append(thursdayer).append(fridayer).append(saturdayer).append(sundayer);
	}
	this.tabler.append(weekTr);

	this.dateTr = $('<tr></tr>');
	this.dateTr.append('<td></td>');
	for(var i=0;i<14;i++){
		this.dateTr.append('<th></th>');
	}
	this.tabler.append(this.dateTr);
	
	this.renderDate(new Date);
	
	var tdArray = [];
	for(var i=7;i<=21;i++){
		var tr = $('<tr></tr>');
		var timeStr = "";
		if(i<10){
			timeStr += "0";
		}
		timeStr+=i+":00";
		var timeTd = $('<td>'+timeStr+'</td>');
		tr.append(timeTd);
		for(var j=0;j<14;j++){
			var td = $('<td></td>');
			tr.append(td);
			tdArray.push(td);

			td.on("click",function(event){
				//计算点击位置的日期和时间
				var calendarMouseX = event.pageX - $("#"+_this.id).offset().left;
				var calendarMouseY = event.pageY - $("#"+_this.id).offset().top;

				var rowIndex = parseInt((calendarMouseY-98)/30);
				var colIndex = parseInt((calendarMouseX-50)/_this.tdWidth);
				var chooseHours = rowIndex+7;
			    if(chooseHours<10){
			    	chooseHours = "0"+chooseHours;
			    }
			    var chooseDate = formatDate(caculateDate(_this.firstDate,colIndex),"%Y-%M-%d");
				_this.tdClickCallback(chooseDate,chooseHours,$(this).attr("teacher-id"));
			});
		}
		this.tabler.append(tr);
	}
	container.append(this.tabler);
}

Ding.Calendar.prototype.renderDate = function(){
	this.mDateLump.html(formatDate(this.firstDate,"%Y-%M-%d")+' ~ '+formatDate(this.lastDate,"%Y-%M-%d"));
	var nextDate = this.firstDate.getDate();
	var currentMonthLastDate = getLastDay(this.firstDate.getFullYear(),this.firstDate.getMonth()+1);
	var tdList = this.dateTr.children();
	for(var i=1;i<=14;i++){
		if(nextDate>currentMonthLastDate){
			nextDate = 1;
		}
		$(tdList[i]).html(nextDate);
		nextDate++;
	}
}

//datetime为日期格式
Ding.Calendar.prototype.arrange = function(datetime,times,htmler,titler,teacherId,courseDetailId){
	if(datetime.getTime()<this.firstDate.getTime()||datetime.getTime()>this.lastDate.getTime()){
		return;
	}
	var hours = datetime.getHours();
	var minutes = datetime.getMinutes();
	var rowIndex = hours - 7 + 2;
	var colIndex = datetime.getDay();
	if(colIndex==0){
		colIndex=7;
	}
	if(dateDiff(datetime,this.firstDate)>=7){
		colIndex += 7;
	}

	var tr = this.tabler.find("tr")[rowIndex];
	var td = $(tr).find("td")[colIndex];
	//获取当前td的课程列表
	var list = $(td).children();
	//计算td中的position-top
	var top = $(td).position().top + this.tdHeight*(datetime.getMinutes()/60);
	//计算td中的heigith
	var height = this.tdHeight*times;

	//计算获取时间上冲突的课程块
	var courseDivList = this.tabler.find(".course-div");
	var currentColDivList = [];
	for(var i=0;i<courseDivList.length;i++){
		if($(courseDivList[i]).parent().index()==colIndex){
			currentColDivList.push(courseDivList[i]);
		}
	}
	//计算td中的width
	var width = currentColDivList.length==0? this.tdWidth : this.tdWidth/(currentColDivList.length+1);
	//计算td中的position-left
	var left = $(td).position().left + (currentColDivList.length==0? 0 : width * currentColDivList.length);

	var cDiv = $('<div class="course-div"></div>');
	cDiv.attr("continue-times",times);
	cDiv.css({
		'top' : top,
		'left' : left,
		'width' : width-1,
		'height' : height
	});
	cDiv.attr("course-detail-div-id",courseDetailId);
	cDiv.html(htmler);
	cDiv.attr("title",titler);
	cDiv.attr("data-toggle","tooltip");
	cDiv.tooltip({'html':true});
	$(td).append(cDiv);

	//在td上保存teacher-id，为了判断同个老师不能在同一个时间段安排两个或两个以上的课程
	var teacherIds = $(td).attr("teacher-id");
	if($.isEmpty(teacherIds)){
		teacherIds = "";
	}
	teacherIds+= teacherId + ",";
	$(td).attr("teacher-id",teacherIds);

	//改变同列时间阶段同时的课程块样式
	for(var i=0;i<currentColDivList.length;i++){
		$(currentColDivList[i]).css({
			'width' : width,
			'left' : $(td).position().left + (i * width)
		});
	}
}

//datetime 为日期格式
Ding.Calendar.prototype.clear = function(datetime,courseDetailId){
	var hours = datetime.getHours();
	var minutes = datetime.getMinutes();
	var rowIndex = hours - 7 + 2;
	var colIndex = datetime.getDay();
	if(colIndex==0){
		colIndex=7;
	}
	if(dateDiff(datetime,this.firstDate)>=7){
		colIndex += 7;
	}

	var tr = this.tabler.find("tr")[rowIndex];
	var td = $(tr).find("td")[colIndex];

	//计算获取时间上冲突的课程块
	var courseDivList = this.tabler.find(".course-div");
	var currentColDivList = [];
	for(var i=0;i<courseDivList.length;i++){
		if($(courseDivList[i]).parent().index()==colIndex){
			if($(courseDivList[i]).attr("course-detail-div-id")==courseDetailId){
				$(courseDivList[i]).remove();
			}
			else{
				currentColDivList.push(courseDivList[i]);
			}
		}
	}
	//计算td中的width
	var width = currentColDivList.length==0? this.tdWidth : this.tdWidth/(currentColDivList.length);
	//计算td中的position-left
	var left = $(td).position().left + (currentColDivList.length==0? 0 : width * currentColDivList.length);
	//改变同列时间阶段同时的课程块样式
	for(var i=0;i<currentColDivList.length;i++){
		$(currentColDivList[i]).css({
			'width' : width,
			'left' : $(td).position().left + (i * width)
		});
	}
}


function getLastDay(year,month)
{
	var new_year = year;  //取当前的年份
	var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
	if(month>12)      //如果当前大于12月，则年份转到下一年
	{
		new_month -=12;    //月份减
		new_year++;      //年份增
	}
	var new_date = new Date(new_year,new_month,1);//取当年当月中的第一天
	return (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期
}

//date:日期，days天数
function caculateDate(date,days){
	var newDate = date.valueOf() + days * 24 * 60 * 60 * 1000;
	return new Date(newDate);
}

//fd为日期，sd为日期
function dateDiff(fd,sd){
	return Math.abs(fd.getTime() - sd.getTime())/(24 * 60 * 60 * 1000);
}

function formatDate(date, fmt) {
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
}
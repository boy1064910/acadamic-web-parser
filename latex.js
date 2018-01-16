//content答案map
var nextContentDiv = '<a href="javascript:;" class="weui-btn weui-btn_primary bottom_btn" onclick="nextContent(this)">继续</a>';
var nextQuestionDiv = '<a href="javascript:;" class="weui-btn weui-btn_primary bottom_btn" onclick="nextQuestion(this)">下一题</a>';
// var rightAnswerBtn = '<div class="bottom_btn right_answer_btn" onclick="showRightAnswer(this)">显示答案</div>';
var rightAnswerBtn = '<a href="javascript:;" class="weui-btn weui-btn_warn bottom_btn" onclick="showRightAnswer(this)">显示答案</a>';

//正确答案html
var rightAnswerTip = '<div class="tooltip fade bottom in"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';

//初始化绑定问题文本框答题事件
function inputBindEvent() {
    var questionList = $("#knowledge-point-list").find('input[type="text"],[type="number"]');
    for (var i = 0; i < questionList.length; i++) {
        if ($(questionList[i]).parent("annotation-xml")[0]) {
            continue;
        }
        $(questionList[i]).on("blur", checkQuestionAnswer);
    }
}

//练习题问题的答案校验
function checkQuestionAnswer() {
    var questionDiv = $(this).parents('.knowledge_point_question');
    var inputList = questionDiv.find('input[type="text"],[type="number"]');

    var allAnswerRight = true;
    var allFillAnswer = true;
    console.log(inputList.length);
    for (var i = 0; i < inputList.length; i++) {
        //不属于特殊编译产生的input
        if (Ding.isEmpty($(inputList[i]).parent('annotation-xml')[0])) {
            var val = $.trim($(inputList[i]).val());
            if(Ding.isEmpty(val)){
                allFillAnswer = false;
            }
            else{
                var rightAnswer = $(inputList[i]).attr("answer");

                if (rightAnswer == val) {
                    $(inputList[i]).addClass("right_answer");
                    $(inputList[i]).removeClass("wrong_answer");
                } else {
                    $(inputList[i]).addClass("wrong_answer");
                    $(inputList[i]).removeClass("right_answer");
                    allAnswerRight = false;
                }
            }          
        }
    }
    allFillAnswer ? (
        //全部已填写
        allAnswerRight ? (
            //答案全部正确，显示下一题or继续
            questionDiv.append(nextQuestionDiv)
        ) :(
            //答案有错，显示正确答案按钮
            showRightAnswerBtn(questionDiv)
        )
    ):(
        //未全部填写，无操作
        console.log("not all fill")
    )
}

function showRightAnswerBtn(div){
    div.append(rightAnswerBtn);
}

//显示正确答案
function showRightAnswer(btn){
    var parentDiv = $(btn).parents('.knowledge_point_question');
    var inputList = parentDiv.find('input[type="text"],[type="number"]');
    for(var i=0;i<inputList.length;i++){
        if ($(inputList[i]).parent('annotation-xml')[0]) {
            continue;
        }
        var answerTip = $(rightAnswerTip);
        answerTip.attr("id","answer-"+$(inputList[i]).attr("name"));
        $(document.body).append(answerTip);
        
        var rightAnswer = $(inputList[i]).attr("answer");
        if(Ding.isEmpty(rightAnswer)){
            rightAnswer = '尚未上传答案';
        }
        answerTip.find(".tooltip-inner").html(rightAnswer);
        answerTip.show();

        var height = $(inputList[i]).outerHeight(true);
        var width = ($(inputList[i]).outerWidth(true) - answerTip.outerWidth(true))/2;
        answerTip.offset({
            'top':$(inputList[i]).offset().top + height,
            'left':$(inputList[i]).offset().left + width
        });
    }

    //移除显示正确答案按钮
    $(btn).remove();
    //判断是否存在下一题
    if(parentDiv.next('.knowledge_point_question')[0]){
        parentDiv.append(nextQuestionDiv);
    }
    else{
        parentDiv.append(nextContentDiv);
    }
}




Ding.ready(function() {
    var sessionId = Ding.getQueryParameterByName("sessionId");
    var knowledgeId = Ding.getQueryParameterByName("knowledgeId");
    $.ajax({
        'url': '/acadamic-web-api/course/chapter/knowledge/info.shtml',
        'headers': {
            'xfsw-session': sessionId
        },
        'data': {
            'knowledgeId': knowledgeId
        },
        'success': function(res) {
            var data = res.data;
            var knowledgePointList = data.knowledgePointList;

            for (var i = 0; i < knowledgePointList.length; i++) {
                var contentList = knowledgePointList[i].contentList;
                if (Ding.isEmpty(contentList)) {
                    continue;
                }

                var pointDiv = $('<section></section>');
                $("#knowledge-point-list").append(pointDiv);

                for (var j = 0; j < contentList.length; j++) {
                    var contentDiv = $('<div class="knowledge_point_content"></div>');
                    pointDiv.append(contentDiv);

                    var content = contentList[j];
                    var questionList = contentList[j].questionList;
                    for (var k = 0; k < questionList.length; k++) {
                        var questionDiv = $('<div class="knowledge_point_question"></div>');
                        contentDiv.append(questionDiv);

                        questionDiv.append(questionList[k].content);
                        //整理答案进入答案集合
                        if (!Ding.isEmpty(questionList[k].answerList)) {
                            for (var m = 0; m < questionList[k].answerList.length; m++) {
                                var answer = questionList[k].answerList[m];
                                questionDiv.find('input[code="'+answer.code+'"]').attr("answer",answer.rightAnswer);
                            }
                        }
                    }
                    
                }
                
            }

            $($("#knowledge-point-list>section:first")).show();
            $($("#knowledge-point-list>section:first>.knowledge_point_content:first")).show();
            $($("#knowledge-point-list>section:first>.knowledge_point_content:first>.knowledge_point_question:first")).show();

            MathJax.Hub.Configured();
        }
    })
});

function nextContent(question) {
    //移除所有正确答案
    $(".tooltip").remove();
    //隐藏当前问题区域
    var currentQuestion = $(question).parents('.knowledge_point_question');
    currentQuestion.hide();

    //隐藏当前问题点内容
    var currentContent = $(question).parents('.knowledge_point_content');
    currentContent.hide();
    
    //TODO 判断是否存在下一问题
    var nextContent = currentContent.next();
    //显示下一问题点内容
    nextContent.show();
    //显示下一内容点第一个题目
    $(nextContent.children()[0]).show();
}

function nextQuestion(question) {
    //移除所有正确答案
    $(".tooltip").remove();
    //隐藏当前问题区域
    var currentQuestion = $(question).parents('.knowledge_point_question');
    currentQuestion.hide();
    //显示下个问题区域
    currentQuestion.next().show();  
}
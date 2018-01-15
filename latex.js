$('body').on('touchmove', function (event) {event.preventDefault();});

//content答案map
var contentAnswerMap = {};

var nextContentDiv = '<div class="bottom_btn next_content" onclick="nextContent(this)">继续</div>';
var nextQuestionDiv = '<div class="bottom_btn next_content" onclick="nextQuestion(this)">下一题</div>';
var rightAnswerBtn = '<div class="bottom_btn right_answer_btn" onclick="showRightAnswer(this)">显示答案</div>';

//正确答案html
var rightAnswerTip = '<div class="right_answer_tip"></div>';

//初始化绑定问题文本框答题事件
function inputBindEvent() {
    var questionList = $("#knowledge-point-list").find('input[type="text"]');
    for (var i = 0; i < questionList.length; i++) {
        if (Ding.isEmpty($(questionList[i]).parents('.knowledge_point_question')[0])) {
            $(questionList[i]).on("blur", checkPointAnswer);
        } else {
            if (Ding.isEmpty($(questionList[i]).parent("annotation-xml")[0])) {
                console.log($(questionList[i]));
                $(questionList[i]).on("blur", checkQuestionAnswer);
            }
        }
    }
}

//知识块问题的答案校验
function checkPointAnswer() {
    var contentid = $(this).attr("contentid");
    var code = $(this).attr("name");
    var val = $.trim($(this).val());

    var rightAnswer = contentAnswerMap[contentid + "-" + code];
    if (!Ding.isEmpty(val)) {
        if (rightAnswer == val) {
            $(this).addClass("right_answer");
            $(this).removeClass("wrong_answer");
        } else {
            $(this).addClass("wrong_answer");
            $(this).removeClass("right_answer");
            $(this).tooltip({
                'title': rightAnswer,
                'placement': 'right'
            });
            $(this).tooltip('show');
        }
    }

}

//练习题问题的答案校验
function checkQuestionAnswer() {
    var questionDiv = $(this).parents('.knowledge_point_question');
    var inputList = questionDiv.find('input[type="text"]');

    var allAnswerRight = true;
    var allFillAnswer = true;
    for (var i = 0; i < inputList.length; i++) {
        //不属于特殊编译产生的input
        if (Ding.isEmpty($(inputList[i]).parent('annotation-xml')[0])) {
            var val = $.trim($(inputList[i]).val());
            if(Ding.isEmpty(val)){
                allFillAnswer = false;
            }
            else{
                var contentid = $(inputList[i]).attr("contentid");
                var code = $(inputList[i]).attr("name ");
                var rightAnswer = contentAnswerMap[contentid + "-" + code];

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
        console.log("fill all"),
        allAnswerRight ? (
            //答案全部正确，显示下一题or继续
            questionDiv.append(nextQuestionDiv)
        ) :(
            //答案有错，显示正确答案按钮
            // showRightAnswer(tipInputList)
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
    var inputList = parentDiv.find('input[type="text"]');
    for(var i=0;i<inputList.length;i++){
        if ($(inputList[i]).parent('annotation-xml')[0]) {
            continue;
        }
        var answerTip = $("#answer-"+$(inputList[i]).attr("name"));
        if(answerTip){
            answerTip = $(rightAnswerTip);
            answerTip.attr("id","answer-"+$(inputList[i]).attr("name"));
            $(document.body).append(answerTip);
        }
        
        var contentid = $(inputList[i]).attr("contentid");
        var code = $(inputList[i]).attr("name");
        var rightAnswer = contentAnswerMap[contentid + "-" + code];
        
        answerTip.html(rightAnswer);
        answerTip.show();
        var height = $(inputList[i]).outerHeight(true);
        answerTip.offset({
            'top':$(inputList[i]).offset().top + height,
            'left':$(inputList[i]).offset().left
        });
    }

    //移除显示正确答案按钮
    $(btn).remove();
    //移除所有正确答案
    $(".right_answer_tip").remove();
    //判断是否存在下一题
    parentDiv.append(nextQuestionDiv);
}

// //检查答案是否全部正确
// var allAnswerRight = true;
// for (var i = 0; i < inputList.length; i++) {
//     //不属于特殊编译产生的input
//     if (Ding.isEmpty($(inputList[i]).parent('annotation-xml')[0]) {
//             var contentid = $(inputList[i]).attr("contentid");
//             // var contentid = $(inputList[i]).attr("contentid");
//             // var code = $(inputList[i]).attr("name");
//             // var val = $.trim($(inputList[i]).val());
//             // var rightAnswer = contentAnswerMap[contentid + "-" + code];

//         }

//         var result = true; //是否已经全部填写答案
//         var needCheckInputList = [];
//         for (var i = 0; i < inputList.length; i++) {
//             if (Ding.isEmpty($(inputList[i]).parent("annotation-xml")[0]) && Ding.isEmpty($(inputList[i]).val())) {
//                 result = false;
//                 break;
//             }
//         }

//         if (result) { //已全部填写答案
//             var nextQuestionResult = true;
//             //已全部填写完毕，开始校验答案
//             for (var i = 0; i < inputList.length; i++) {
//                 var contentid = $(inputList[i]).attr("contentid");
//                 var code = $(inputList[i]).attr("name");
//                 var val = $.trim($(inputList[i]).val());
//                 var rightAnswer = contentAnswerMap[contentid + "-" + code];
//                 console.log(rightAnswer + "--" + val);
//                 if (rightAnswer == val) {
//                     $(inputList[i]).addClass("right_answer");
//                     $(inputList[i]).removeClass("wrong_answer");
//                 } else {

//                     $(inputList[i]).addClass("wrong_answer");
//                     $(inputList[i]).removeClass("right_answer");
//                     nextQuestionResult = false;
//                 }
//             }
//             console.log(nextQuestionResult);
//             // if (nextQuestionResult) {
//             //     questionDiv.hide();
//             //     questionDiv.next().show();
//             // } else {

//             // }
//             questionDiv.append(nextQuestionDiv);

//             //检查答案是否全部正确
//             var allAnswerRight = true;

//         }

//     }
// }
// }




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
            console.log(data);
            var knowledgePointList = data.knowledgePointList;

            for (var i = 0; i < knowledgePointList.length; i++) {
                var contentList = knowledgePointList[i].contentList;
                if (Ding.isEmpty(contentList)) {
                    continue;
                }

                var pointDiv = $('<div class="knowledge_point"></div>');

                for (var j = 0; j < contentList.length; j++) {
                    var contentDiv = $('<div class="knowledge_point_content"></div>');
                    var content = contentList[j];
                    switch (content.type) {
                        case "EXPLORE":
                            {
                                contentDiv.append(content.content);
                                contentDiv.append(nextContentDiv);

                                //整理答案进入答案集合
                                if (!Ding.isEmpty(content.contentAnswerList)) {
                                    for (var m = 0; m < content.contentAnswerList.length; m++) {
                                        var answer = content.contentAnswerList[m];
                                        contentAnswerMap[answer.knowledgePointContentId + "-" + answer.code] = answer.rightAnswer;
                                    }
                                }
                                break;
                            }
                        case "GAME":
                            {
                                var questionList = contentList[j].questionList;
                                for (var k = 0; k < questionList.length; k++) {
                                    var questionDiv = $('<div class="knowledge_point_question"></div>');
                                    questionDiv.append(questionList[k].content);
                                    contentDiv.append(questionDiv);

                                    //整理答案进入答案集合
                                    if (!Ding.isEmpty(questionList[k].answerList)) {
                                        for (var m = 0; m < questionList[k].answerList.length; m++) {
                                            var answer = questionList[k].answerList[m];
                                            contentAnswerMap[questionList[k].knowledgePointContentId + "-" + answer.code] = answer.rightAnswer;
                                        }
                                    }
                                }
                                break;
                            }
                    }

                    pointDiv.append(contentDiv);


                }

                $("#knowledge-point-list").append(pointDiv);
            }

            $($("#knowledge-point-list>.knowledge_point:first")).show();
            $($("#knowledge-point-list>.knowledge_point:first>.knowledge_point_content:first")).show();

            console.log(contentAnswerMap);

            MathJax.Hub.Configured();
        }
    })
});

function nextContent(content) {
    var currentContent = $(content).parent();
    currentContent.hide();
    currentContent.next().show();

    if (currentContent.next().children(".knowledge_point_question").length != 0) {
        currentContent.next().children(".knowledge_point_question:first").show();
        console.log(currentContent.next().children(".knowledge_point_question:first"));
    }
}

function nextQuestion(question) {
    var currentQuestion = $(question).parents('.knowledge_point_question');
    currentQuestion.hide();
    currentQuestion.next().show();
}
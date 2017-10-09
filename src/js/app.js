// import {isArray} from 'lodash';
import '../scss/index.scss';
var nameArray = {
    1: '鼠',
    2: '牛',
    3: '虎',
    4: '兔',
    5: '龙',
    6: '蛇',
    7: '马',
    8: '羊',
    9: '猴',
    10: '鸡',
    11: '狗',
    12: '猪',
    13: '金',
    14: '木',
    15: '水',
    16: '火',
    17: '土',
    18: '天',
    19: '地'
};

var toastTimer = null;
/**
 * toast
 * @param {*} str 
 * @param {*} callback 
 * @param {*} time 
 */
function Toast(str, callback, time) {
    var elemToast = $('#js-page-toast');
    elemToast.html(str).addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        elemToast.html('').removeClass('show');
        callback && callback();
    }, time || 2000);
}

FastClick.attach(document.body);
/**
 * 报错问题
 */
$.ajaxSettings = $.extend($.ajaxSettings, {
    timeout: 10000,
    error: function () {
        Toast('网络不给力~');
        $('.js-loading').hide();

        setTimeout(function () {
            // location.reload();
        }, 2000);
    }
});

function App(opts) {
    if (!(this instanceof App)) {
        return new App(opts);
    }
    var defaults = {};
    this.config = $.extend(defaults, opts);
    this.countTime = 10; //倒计时时间
    this.currentBettingJb = 100; // 每次下注的金额
    this.bettingState = 0; // 下注状态
    this.openState = 0; // 是否在开奖
    this.myTotalJb = 0; // 我的金币
    this.myTotalZs = 0; // 我的钻石
    this.issue = 0; // 期数
    this.init();
}

App.prototype.init = function () {
    // var self = this;
    var imgLength = $('#js-img-wrap').find('img').length;
    var imgIndex = 0;
    // this.countFn();
    this.renderTabTwo();
    this.renderTabThree();
    this.getCurrentIssue();

    $('#js-loading-block').show();
    $('#js-img-wrap').find('img').each(function () {
        var thisSrc = $(this).attr('src');
        var img = new Image();
        img.src = thisSrc;
        img.onload = function () {
            imgIndex += 1;
            // console.log(imgIndex);
            if (imgIndex >= imgLength) {
                $('#js-loading-block').hide();

            }
        }
    })
    this.eventInit();
}

App.prototype.eventInit = function () {
    var self = this;
    var elemBettingItems = $('#js-betting-all');
    
    // 生肖
    $(document).on('click', '.js-lottery-item-1', function (e) {
        var $this = $(this);
        var offset = $this.offset();
        var angle = self.calculateAngle(offset, e);
        var item = self.calculateAnimal(angle);
        self.ajaxBetting(elemBettingItems.find('[data-type="' + item + '"]'));
    });
    //五行
    $(document).on('click', '.js-lottery-item-2', function (e) {
        var $this = $(this);
        var offset = $this.offset();
        var angle = self.calculateAngle(offset, e);
        var item = self.calculateWuxin(angle);
        self.ajaxBetting(elemBettingItems.find('[data-type="' + item + '"]'));

    });
    //其他下注
    $('.js-lottery-item').on('click', function () {
        var $this = $(this);
        var item = $this.attr('data-type');
        self.ajaxBetting(elemBettingItems.find('[data-type="' + item + '"]'));
    });
    //取消
    $('.js-butn-cancel').on('click', function () {
        self.cancelBetting($(this));
    });

    //切换选择
    $('.js-tab-title').on('click', 'a', function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('#js-page-main').find('.tab-panel').eq($(this).index()).addClass('active')
            .siblings('.tab-panel').removeClass('active');
    });
    // 2选 3选
    $(document).on('click', '.js-tab2-item', function () {
        var $this = $(this);
        self.ajaxBetting($this);

    });
    //关闭弹窗
    $('.js-butn-close').on('click', function () {
        $(this).parents('.dialog-default').removeClass('active');
    });

    // 打开弹窗
    $('.js-butn-menu, .prev-betting').on('click', function () {
        // $('.js-dialog-records').addClass('active');
        self.getPrevIssueInfo();
    });

    $('.js-butn-help').on('click', function () {
        $('.js-dialog-rule').addClass('active');
    });

    //切换金额
    $('.js-betting-num').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        self.currentBettingJb = $(this).data('num');
    })
}
/**
 * 计算生肖
 */
App.prototype.calculateAnimal = function (angle) {
    var item = -1;
    if (angle < -165) {
        item = 10;
    } else if (angle < -135) {
        item = 9;
    } else if (angle < -105) {
        item = 8;
    } else if (angle < -75) {
        item = 7;
    } else if (angle < -45) {
        item = 6;
    } else if (angle < -15) {
        item = 5;
    } else if (angle < 15) { //
        item = 4;
    } else if (angle < 45) { //
        item = 3;
    } else if (angle < 75) { //
        item = 2;
    } else if (angle < 105) { //
        item = 1;
    } else if (angle < 135) { //
        item = 12;
    } else if (angle < 165) { //
        item = 11;
    } else { //
        item = 10;
    }

    return item;
}
/**
 * 计算五行
 */
App.prototype.calculateWuxin = function (angle) {
    var item = -1;
    if (angle <= -162) {
        item = 17;
    } else if (angle <= -90) {
        item = 16;
    } else if (angle <= -18) {
        item = 15;
    } else if (angle <= 56) {
        item = 14;
    } else if (angle <= 128) {
        item = 13;
    } else if (angle <= 180) {
        item = 17;
    }
    return item;
}
/**
 * 计算角度
 */
App.prototype.calculateAngle = function (offset, e) {
    var centerX = offset.left + offset.width / 2;
    var centerY = offset.top + offset.height / 2;
    var x = e.pageX - centerX;
    var y = e.pageY - centerY;
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var cos = x / z;
    var radina = Math.acos(cos); //用反三角函数求弧度
    var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度
    return e.pageY - centerY < 0 ? angle : -angle;
}

/**
 * 取消 下注
 */
App.prototype.cancelBetting = function (elem) {
    var self = this;
    if (elem.hasClass('disabled') || this.bettingState == 1) {
        return;
    }
    elem.addClass('disabled');
    var startTime = +new Date();
    console.log(startTime, 'startTime');

    function renderUnpay(res) {
        $('#js-loading-block').hide();

        elem.removeClass('disabled');

        self.myTotalJb = Math.ceil(res.data.JB * 100);
        self.myTotalZs = Math.ceil(res.data.ZS* 100);

        // $('#js-betting-all').find('.current').removeClass('current').find('span').html(0);
        $('.js-my-total').html(self.myTotalJb);
        $('.js-my-zs').html(self.myTotalZs);
        self.clearAllBetting();
    }
    $('#js-loading-block').show();
    $.ajax({
        type: "post",
        url: "/api/sesx/unPay",
        data: {
            _token: window._token,
            issue: self.issue
        },
        dataType: 'json',
        success: function (res) {
            var endTime = +new Date();

            if (res.code == 0) {
                if (endTime - startTime > 1000) {
                    renderUnpay(res);
                } else {
                    setTimeout(function () {
                        renderUnpay(res);
                    }, 1000 - (endTime - startTime))
                }

            } else {
                $('#js-loading-block').hide();

                elem.removeClass('disabled');
                Toast(res.msg);
            }
        }
    });


};
/**
 * 下注
 */
App.prototype.ajaxBetting = function (elem) {
    var self = this;
    var type = '';
    if (this.bettingState == 1 || this.openState == 1) {
        return;
    }
    var reqData = elem.data();
    var startTime = +new Date();
    console.log(startTime, 'startTime');

    this.bettingState = 1;
    $('#js-loading-block').show();
    if (reqData.other) {
        type = reqData.sx + ',' + reqData.other;
    } else if (reqData.td) {
        type = reqData.sx + ',' + reqData.wx + ',' + reqData.td;
    } else {
        type = reqData.type;
    }

    $.ajax({
        type: 'post',
        url: '/api/sesx/doPay',
        data: {
            _token: window._token,
            issue: self.issue,
            gold: self.currentBettingJb / 100,
            type: type
        },
        dataType: 'json',
        success: function (res) {
            var endTime = +new Date();

            if (res.code == 0) {
                self.myTotalJb = Math.ceil(res.data.JB * 100);
                self.myTotalZs = Math.ceil(res.data.ZS * 100);
                if (endTime - startTime >= 1000) {
                    self.bettinMoney(elem);
                } else {
                    setTimeout(function () {
                        self.bettinMoney(elem);
                    }, 1000 - (endTime - startTime))
                }
            } else {
                self.bettingState = 0;

                $('#js-loading-block').hide();

                Toast(res.msg);
            }
        }
    });
    // self.jbAnimation($('.user-wrap').find('li').eq(2), elem);
}
/**
 * 下注成功后 将金币 飞到对应位置
 */
App.prototype.bettinMoney = function (elem) {
    var self = this;
    self.bettingState = 0;
    console.log((+new Date()), 'ok');
    $('#js-loading-block').hide();
    if (elem.data('sx')) {
        var lotteryNumElem = elem.find('.lottery-money');
        lotteryNumElem.html(parseInt(lotteryNumElem.html(), 10) + self.currentBettingJb);
    } else {
        elem.find('i').html(parseInt(elem.find('i').html(), 10) + self.currentBettingJb);
        elem.find('span').html(parseInt(elem.find('span').html(), 10) + self.currentBettingJb);
        $('.js-my-total').html(self.myTotalJb);
    }
    elem.addClass('active');

    $('.js-my-total').html(self.myTotalJb);
    $('.js-my-zs').html(self.myTotalZs);

}
/**
 * 倒计时
 */
App.prototype.countFn = function () {
    var self = this;
    var timer = setInterval(function () {
        self.countTime -= 1;
        if (self.countTime <= 0) {
            clearInterval(timer);
            $('.js-dialog-jishi').addClass('active');
            self.openResult();
        }
        $('.js-count-time').html(self.countTime < 0 ? 0 : self.countTime);

    }, 1000)
}
/**
 * 开奖成功后
 */
App.prototype.getResultAfter = function (data) {
    var self = this;
    var list = data.winType.split(',');
    var sxUl = $('.js-list-sx');
    var wxUl = $('.js-list-wx');
    var tdUl = $('.js-list-td');
    var liHeight = 0;
    var sxPrevLength = sxUl.find('[data-type="' + list[2] + '"]').eq(1).index();
    var wxPrevLength = wxUl.find('[data-type="' + list[1] + '"]').eq(1).index();
    var tdPrevLength = tdUl.find('[data-type="' + list[0] + '"]').eq(6).index();

    $('.js-dialog-jishi').removeClass('active');
    $('.js-dialog-open').addClass('active');
    liHeight = sxUl.parent()[0].clientHeight;
    sxUl.css({
        marginTop: 0
    });
    wxUl.css({
        marginTop: 0
    });
    tdUl.css({
        marginTop: 0
    });
    //生肖动画
    sxUl.velocity({
        marginTop: -liHeight * sxPrevLength
    }, {
        duration: 600
    });
    // 五行动画
    wxUl.velocity({
        marginTop: -liHeight * wxPrevLength
    }, {
        duration: 800
    });

    tdUl.velocity({
        marginTop: -liHeight * tdPrevLength
    }, {
        duration: 900
    });

    setTimeout(function () {
        self.openState = 0;
        $('.js-dialog-open').removeClass('active');
        self.issue = data.currentIssueId;
        self.countTime = data.openAfter - 3 > 0 ? data.openAfter - 3 : 0;
        self.clearAllBetting();
        if (data.winGold > 0) {
            $('.js-dialog-award').addClass('active')
                .find('.js-jb-geted').html(parseInt(data.winGold * 100));
            $('.js-my-total').html(self.myTotalJb);
            $('.js-my-zs').html(self.myTotalZs);
            createjs.Sound.play(soundID);
            setTimeout(function () {

                $('.js-dialog-award').removeClass('active');
            }, 5000);
        } 
        self.getCurrentIssue();
    }, 7000);

}

/**
 * 删除 所有的下注
 */
App.prototype.clearAllBetting = function () {
    var firstBettingWrap = $('#js-betting-all');

    firstBettingWrap.children().each(function () {
        $(this).removeClass('active')
            .find('span').html(0);
    })

    $('.js-tab2-item').each(function () {
        $(this).removeClass('active')
            .find('.lottery-money').html(0);
    });
}

/**
 *  开奖
 */
App.prototype.openResult = function () {
    var self = this;
    this.openState = 1;
    // setTimeout(function () {
    //     self.getResultAfter();
    // }, 3000)

    $.ajax({
        type: 'post',
        url: '/api/sesx/getIssueOpenResult',
        data: {
            _token: window._token,
            issue: self.issue
        },
        dataType: "json",
        success: function (res) {
            if (res.code == 0) {
                self.getResultAfter(res.data);
            } else {
                setTimeout(function () {
                    self.openResult();
                }, 1000)
            }
        }
    });
}
/**
 * 获取本期奖品
 */
App.prototype.getCurrentIssue = function () {
    var self = this;
    $.ajax({
        type: 'get',
        url: '/api/sesx/getRunningIssue',
        data: {
            _token: window._token
        },
        dataType: 'json',
        success: function (res) {
            if (res.code == 0) {
                // var text ='';
                var winTypeArray = res.data.lastWinType.split(',');
                self.issue = res.data.currentIssueId;
                self.countTime = res.data.openAfter - 3 < 0 ? 0 : res.data.openAfter - 3;
                self.myTotalJb = Math.ceil(res.data.userPayInfo[0].JB * 100);
                self.myTotalZs = Math.ceil(res.data.userPayInfo[0].ZS * 100);
                $('.js-count-time').html(self.countTime);
                //上一期
                $('.js-prev').children().each(function () {
                    $(this).html(nameArray[winTypeArray[$(this).index()]]);
                })
                $('.js-my-total').html(self.myTotalJb);
                $('.js-my-zs').html(self.myTotalZs);
                self.renderBettingHtml(res.data.userPayInfo[0].paySumInfo);
                self.countFn();
            } else {
                Toast(res.msg);
            }
        }
    });
}
/**
 * 渲染 下注情况
 */
App.prototype.renderBettingHtml = function (data) {
    var firstWrap = $('#js-betting-all');
    // return 1;
    function rendFirst(value, key) {
        var target = firstWrap.find('[data-type="' + key + '"]');
        target.addClass('active').find('span').html(value * 100)
    }

    function renderOther(valeu, keyArray) {
        var elems = $('.js-tab2-item');
        var nowValue = 0;
        elems.each(function () {
            var elemThis = $(this);
            var sxOk = false;
            if (keyArray.length == 2) {
                var otherOk = false;
                for (var i = 0; i < keyArray.length; i++) {
                    nowValue = keyArray[i];
                    if (nowValue < 13) {
                        sxOk = elemThis.data('sx') == nowValue ? true : false;
                    }
                    if (nowValue > 12) {
                        otherOk = elemThis.data('other') == nowValue ? true : false;
                    }
                }
                if (sxOk && otherOk) {
                    elemThis.addClass('active').find('.lottery-money').html(valeu * 100);
                }
            } else {
                var wxOk = false;
                var tdOk = false;
                for (var j = 0, len = keyArray.length; j < len; j++) {
                    nowValue = keyArray[j];
                    if (nowValue < 13) {
                        sxOk = elemThis.data('sx') == nowValue ? true : false;
                    }
                    if (nowValue < 18 && nowValue > 12) {
                        wxOk = elemThis.data('wx') == nowValue ? true : false;
                    }
                    if (nowValue > 17) {
                        tdOk = elemThis.data('td') == nowValue ? true : false;
                    }
                }

                if (sxOk && wxOk && tdOk) {
                    elemThis.addClass('active').find('.lottery-money').html(valeu * 100);
                }
            }
        })

    }
    for (var key in data) {
        var nowValue = data[key];
        if (nowValue > 0) {
            // console.log(key);
            var nowKeyArray = key.split(',');
            console.log(nowKeyArray);
            switch (nowKeyArray.length) {
                case 1:
                    rendFirst(nowValue, key);
                    break;
                default:
                    renderOther(nowValue, nowKeyArray);
            }
        }

    }
}
/**
 * 渲染 选择两个的 tab
 */
App.prototype.renderTabTwo = function () {
    var shenxiao = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var wuxing = [13, 14, 15, 16, 17, 18, 19];
    var tmp = [];
    // var targetArray =[];
    var html = '';
    // var html ='';
    for (var i = 0; i < 12; i++) {
        for (var j = 0; j < 7; j++) {
            tmp.push({
                sx: shenxiao[i],
                other: wuxing[j]
            });
        }
    }
    while (tmp.length) {
        var shenxiaoType = Math.ceil(Math.random() * tmp.length);
        var now = tmp.splice(shenxiaoType - 1, 1)[0];
        html += `<li data-sx="${now.sx}" data-other="${now.other}" class="js-tab2-item">
                    <span>${nameArray[now.other]}</span>
                    <span>/</span>
                    <span>${nameArray[now.sx]}</span>
                    <div class="lottery-money">0</div>
                </li>`
    }
    $('.js-tab-2').find('ul').html(html);
}
/**
 * 渲染 选择两个的 tab
 */
App.prototype.renderTabThree = function () {
    var shenxiao = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var wuxing = [13, 14, 15, 16, 17];
    var tianDi = [18, 19];
    var tmp = [];
    var html = '';
    for (var x = 0; x < 12; x++) {
        for (var y = 0; y < 5; y++) {
            for (var z = 0; z < 2; z++) {
                tmp.push({
                    sx: shenxiao[x],
                    wx: wuxing[y],
                    td: tianDi[z]
                })
            }
        }
    }
    while (tmp.length) {
        var shenxiaoType = Math.ceil(Math.random() * tmp.length);
        var now = tmp.splice(shenxiaoType - 1, 1)[0];
        html += `<li data-sx="${now.sx}" data-wx="${now.wx}" data-td="${now.td}" class="js-tab2-item">
                    <span>${nameArray[now.wx]}</span>
                    <span>/</span>
                    <span>${nameArray[now.sx]}</span>
                    <strong>${nameArray[now.td]}</strong>      
                    <div class="lottery-money">0</div>
                </li>`
    }
    $('.js-tab-3').find('ul').html(html);

}
/**
 * 渲染现在的下注情况
 */
App.prototype.renderCurrentBetting = function (list) {
    var html = '';
    var total = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,
        18: 0,
        19: 0,
        20: 0,
        21: 0
    };
    var myTotla = {};
    for (var i = 0; i < 5; i++) {
        var tmp = list[i].paySumInfo;
        if (i == 0) {
            myTotla = tmp;
        }
        for (var key in tmp) {
            total[key] += tmp[key];
        }
    }
    for (var k in total) {
        html += `<div class="betting-items ${total[k] > 0 ? 'active':''} ${myTotla[k] > 0 ? 'current':''} " data-type="${k}"><i>${total[k]*100}</i> <span>${myTotla[k]*100}</span></div>`;
    }

    return html;
}

App.prototype.getPrevIssueInfo = function () {
    // var self = this;
    $('#js-loading-block').show();
    $.ajax({
        type: 'get',
        url: '/api/sesx/getLatestWinInfo',
        data: {
            _token: window._token,
            size: 10
        },
        dataType: 'json',
        success: function (res) {
            $('#js-loading-block').hide();

            if (res.code == 0) {

                var html = `<li>
                        <span>吉时</span>
                        <span>天</span>
                        <span>地</span>
                        <span>金</span>
                        <span>木</span>
                        <span>水</span>
                        <span>火</span>
                        <span>土</span>
                        <span>生肖</span>
                    </li>`;
                $.each(res.data, function (index, v) {
                    // console.log(v);
                    var typeValue = v.winType.split(',');
                    html += `<li>
                            <span>${v.id}</span>
                            <span class="${typeValue[0] == 18 ? 'active': ''}"></span>
                            <span class="${typeValue[0] == 19 ? 'active': ''}"></span>
                            <span class="${typeValue[1] == 13 ? 'active': ''}"></span>
                            <span class="${typeValue[1] == 14 ? 'active': ''}"></span>
                            <span class="${typeValue[1] == 15 ? 'active': ''}"></span>
                            <span class="${typeValue[1] == 16 ? 'active': ''}"></span>
                            <span class="${typeValue[1] == 17 ? 'active': ''}"></span>
                            <span>${nameArray[typeValue[2]]}</span>
                        </li>`
                })
                $('.js-dialog-records').addClass('active').find('ul').html(html);

            } else {
                Toast(res.msg);
            }
        }
    });
}
App();
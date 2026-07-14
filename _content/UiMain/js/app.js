var verAppJs = "1.0"; // версия этого файла

var counter = 0;
var counter2 = 0;
var counter3 = 0; // сколько прошло времени с последнего обновления
var intervalID;
var rndLeft=0;
var rndCounter=0;
var timeUpdated=false;
var period = 5000; // интервал времени (в сек.) для обновления в отображении обратного отсчёта
var reqDif = 0; // продолжительность выполнения запроса при получении времени с сервера
var onDebugTimeleft = false;

var dataload = {};
var nowDate = new Date();
var selYear = nowDate.getFullYear(), selMonth = nowDate.getMonth() + 1;
var isLoadEj2 = false;
var timeleft = -1;
var srchClickTime = new Date();
var timeLeftSrv = null;
var ajaxDataSrv = null;
var querystr = '';
var searchSrv = null;

$(document).ready(function () {

    //websocket_proc();
    
    // вывод диалогового окна сообщений
    if ($.trim($('#msgtext').html()) !== "") {
        $('#message').modal('show');
    }

	var max = 300;
	var min = 0;
	rndCounter = Math.floor(Math.random() * (max - min + 1)) + min;
    if (onDebugTimeleft) console.log('rndCounter = ' + rndCounter);

    // включаем таймер для обратного отсчёта
    if (timeleft === -1) $("#timeleft").addClass('hidden');


    var queryarr = this.location.href.split('?');
    querystr = queryarr.length > 1 ? ("?" + queryarr[1]) : '';


    /** получаем данные из кэш-файла */
    try {
        $.get('_content/UiMain/AjaxData/data.json')
            .success(function (response) {

                // сброс кэша браузера у пользователя
                if (response.clearCache !== null && response.clearCache !== undefined) {
                    if (window.localStorage.getItem('clearCache') === undefined || window.localStorage.getItem('clearCache') !== response.clearCache) {

                        window.localStorage.setItem('clearCache', response.clearCache);

                        /*addMetaTag("pragma", "no-cache");
                        addMetaTag("expires", "0");
                        addMetaTag("cache-control", "no-cache");

                        //alert('Перезагрузка...');
                        document.location.reload();*/

                        var src = '_content/UiMain/js/app.js';
                        reload_js(src);
                        console.log('Загружен "' + src + '" с сервера (не из кэша)');
                        console.log(verAppJs);
                    }
                }

                /** динамическая загрузка меню */
                var menuBlock = response.menuBlock;
                if (menuBlock !== null && menuBlock !== undefined) document.getElementById('menublock').innerHTML = menuBlock;

                /* создание списка годов для выбора в календаре */
                var minYear_ = response.minYear;
                if (minYear_ !== null) {
                    minyear = minYear_;

                    document.getElementById("year").options.length = 0; // удаляем текущий список (т.к. в кэше может быть уже не актуальный)

                    var select = document.getElementById('year');
                    var curYear = (new Date()).getFullYear(); //ВНИМАНИЕ!!! curYear необходимо получать не по текущему году, а по последнему Посланию/Катрену

                    option = document.createElement('option');
                    option.value = -1;
                    option.text = 'года...';
                    select.add(option);

                    for (i = minyear - 2004; i <= curYear - 2004; i += 1) {
                        option = document.createElement('option');
                        option.value = i;
                        option.text = 2004 + i;
                        select.add(option);
                    }
                }

                /** динамическая настройка списка альтернативных ajax-серверов */
                searchSrv = response.searchSrv;
                if (searchSrv !== null && searchSrv !== undefined && searchSrv !== '') {
                    var oldAction = $('#searchForm').attr('action');
                    var a = $('<a>', { href: oldAction });
                    var newAction = searchSrv + a.prop('pathname') + a.prop('search');
                    $('#searchForm').attr('action', newAction);
                }
                timeLeftSrv = response.timeLeftSrv;
                ajaxDataSrv = response.ajaxDataSrv;

            }, 'json')
            .error(function () { })
            .complete(function () {
                //MainAjaxData();
                //TimeLeft(); // обратный отсчёт
            });
    } catch (err) {
        console.log('ошибка Ajax');
    }

    /** загружаем основные динамические данные */
    /*$.ajax({
        type: "GET",
        url: "/AjaxData" + this.location.pathname + querystr,
        success: function (response) {
            var unreadBlock = response.unreadBlock;

            if (unreadBlock !== undefined) {
                document.getElementById('unreadBlock').innerHTML = unreadBlock;
                var htmlMobile = unreadBlock.replace('hidden-xs', 'hidden-lg hidden-md hidden-sm').replace('collapseOne', 'collapseTwo').replace('collapseOne', 'collapseTwo');
                var blockMobile = document.getElementById('unreadBlockMobile');
                blockMobile.innerHTML = htmlMobile;
            }

            var quoteBlock = response.quoteBlock;
            if (quoteBlock !== undefined) document.getElementById('quoteBlock').innerHTML = quoteBlock;

            var onlineData = response.onlineData;
            if (onlineData !== undefined) document.getElementById('online').innerHTML = onlineData;

            var memtotData = response.memtotData;
            if (memtotData !== undefined) document.getElementById('memtot').innerHTML = memtotData;

            var memvalData = response.memvalData;
            if (memvalData !== undefined) document.getElementById('memval').innerHTML = memvalData;

            var comemData = response.comemData;
            if (comemData !== undefined) document.getElementById('comem').innerHTML = comemData;

            //var menuBlock = response.menuBlock;
            //if (menuBlock !== null && menuBlock !== undefined) document.getElementById('menublock').innerHTML = menuBlock;

            var authEnable = response.authEnable;
            var isAuth = response.isAuth;
            if (authEnable == true && isAuth !== null) {
                if (isAuth == true) {
                    document.getElementById('authLink').hidden = false;
                    document.getElementById('account').hidden = false;

                    var userData = response.userData;
                    if (userData !== null) {
                        document.getElementById('userName').innerHTML = userData.userName;
                        document.getElementById('dateCreate').innerHTML = userData.dateCreate;
                        document.getElementById('dateVisit').innerHTML = userData.dateVisit;
                    }
                }
                else document.getElementById('noAuthLink').hidden = false;
            }

        },
        failure: function (response) {
            alert(response);
        }
    });*/


    /** обратный отсчёт (перемещён) */


    /** получаем данные календаря
    try {
        $.get('_content/UiMain/AjaxData/'+fileCalendar+'.json')
            .success(function (response) {
                // данные для календаря
                if (response.calendarData !== undefined && response.calendarData !== null) {
                    dataload = response.calendarData;
                    year = selYear = response.year;
                    month = selMonth = response.month;
                    $('#datepicker').datepicker('update', new Date(selYear, selMonth - 1, 1));
                    $('#dmy').html(monthA[selMonth - 1] + ' ' + selYear);
                }
            }, 'json')
            .error(function () { });
    } catch (err) {
        console.log('ошибка Ajax');
    } */

    var isAdvSearch = getCookie('isAdvSearch');
    if (isAdvSearch !== undefined && isAdvSearch !== null && isAdvSearch.toLowerCase() == 'true') {
        document.getElementById('advSearch').hidden = false;
    }

    OnOffStarsBg(); // вкл/откл. звёздное небо

    // запрет на очень частые поисковые запросы - более 1 раза в сек. поиск выполнять нельзя
    $('#s2').click(function () {
        if ($('#SearchString').val() == "") {
            alert("Поисковая фраза не может быть пустой!");
            return false;
        }
        if (srchClickTime.setSeconds(srchClickTime.getSeconds() + 1) >= new Date()) {
            //alert("Слишком частые поисковые запросы или дважды нажали на кнопку поиска!");
            return false;
        }
        srchClickTime = new Date();
    });

    beforeSearch = function (event) {
        var qsearch = '';

        if (isAdvSearch !== undefined && isAdvSearch !== null && isAdvSearch.toLowerCase() == 'true') qsearch = $("#searchForm").serialize();
        else qsearch = $("#SearchString, input[name=FirstQuery], #Where").serialize();

        window.history.pushState('state', 'title', '/search/?' + qsearch);
        return true;
    }

    successChangePage = function (el) {
        window.scroll(0, 0);
        renewUrl();
        var url = el.getAttribute("data-ajax-url");
        window.history.pushState('state', 'title', url + '&FirstQuery=true');
    }

    successSearch = function (data, status, xhr) {
        // если поиск осуществляется на внешнем сервере, то надо переопределить некоторые ссылки на этот внешний сервер
        if (searchSrv !== null && searchSrv !== undefined && searchSrv !== '') {
            var oldAction = $('#chart-link').attr('data-ajax-url');
            var a = $('<a>', { href: oldAction });
            var newAction = searchSrv + a.prop('pathname') + a.prop('search');
            $('#chart-link').attr('data-ajax-url', newAction);

            //newDomain = searchSrv;
            /*$('#pages a').each(function (index, element) {
                var oldAction = $(element).attr('data-ajax-url');
                var a = $('<a>', { href: oldAction });
                var newAction = searchSrv + a.prop('pathname') + a.prop('search');
                $(element).attr('data-ajax-url', newAction);
            });*/
        }
        renewUrl();
        /*$('#pages a').each(function (index, element) {
            var oldAction = $(element).attr('data-ajax-url');
            var a = $('<a>', { href: oldAction });
            var qarr = a.prop('search').split('&');
            var qsearch = '';
            for (var i = 0; i < qarr.length; i++) {
                var item = qarr[i];
                if (item.startsWith('X-Requested-With') || item.startsWith('_=')) continue;
                if ((isAdvSearch === undefined || isAdvSearch === null || isAdvSearch.toLowerCase() == 'false') && (item.startsWith('IsFullWord') || item.startsWith('IsExactStart'))) continue;
                qsearch += item + '&';
            }

            var newAction = newDomain + a.prop('pathname') + qsearch;
            $(element).attr('data-ajax-url', newAction);
        });*/
    };

    renewUrl = function (el) {
        var newDomain = '';
        $('#pages a').each(function (index, element) {
            var oldAction = $(element).attr('data-ajax-url');
            var a = $('<a>', { href: oldAction });
            var qarr = a.prop('search').split('&');
            var qsearch = '';
            for (var i = 0; i < qarr.length; i++) {
                var item = qarr[i];
                if (item.startsWith('X-Requested-With') || item.startsWith('_=')) continue;
                if ((isAdvSearch === undefined || isAdvSearch === null || isAdvSearch.toLowerCase() == 'false') && (item.startsWith('IsFullWord') || item.startsWith('IsExactStart'))) continue;
                qsearch += item + (item === '?' || i === qarr.length-1 ? '' : '&');
            }

            if (searchSrv !== null && searchSrv !== undefined && searchSrv !== '') newDomain = searchSrv;
            var newAction = newDomain + a.prop('pathname') + qsearch;
            $(element).attr('data-ajax-url', newAction);
        });
    }

    failedSearch = function (xhr) {
        alert("Произошла ошибка при поиске. Повторите поиск позже."); // "Status: "+xhr.status+", Status Text: "+xhr.statusText
    };
});


/** загружаем основные динамические данные */
function MainAjaxData() {

    var ajaxDataHost = (ajaxDataSrv !== null && ajaxDataSrv !== undefined) ? ajaxDataSrv : (ajaxHost !== null && ajaxHost !== undefined ? ajaxHost : '');

    $.ajax({
        type: "GET",
        url: ajaxDataHost + "/AjaxData" + this.location.pathname + querystr,
        success: function (response) {
            var unreadBlock = response.unreadBlock;

            if (unreadBlock !== undefined) {
                document.getElementById('unreadBlock').innerHTML = unreadBlock;
                var htmlMobile = unreadBlock.replace('hidden-xs', 'hidden-lg hidden-md hidden-sm').replace('collapseOne', 'collapseTwo').replace('collapseOne', 'collapseTwo');
                var blockMobile = document.getElementById('unreadBlockMobile');
                blockMobile.innerHTML = htmlMobile;
            }

            var quoteBlock = response.quoteBlock;
            if (quoteBlock !== undefined) document.getElementById('quoteBlock').innerHTML = quoteBlock;

            var onlineData = response.onlineData;
            if (onlineData !== undefined) document.getElementById('online').innerHTML = onlineData;

            var memtotData = response.memtotData;
            if (memtotData !== undefined) document.getElementById('memtot').innerHTML = memtotData;

            var memvalData = response.memvalData;
            if (memvalData !== undefined) document.getElementById('memval').innerHTML = memvalData;

            var comemData = response.comemData;
            if (comemData !== undefined) document.getElementById('comem').innerHTML = comemData;

            /*var menuBlock = response.menuBlock;
            if (menuBlock !== null && menuBlock !== undefined) document.getElementById('menublock').innerHTML = menuBlock;*/

            var authEnable = response.authEnable;
            var isAuth = response.isAuth;
            if (authEnable == true && isAuth !== null && isAuth !== undefined) {
                if (isAuth == true) {
                    document.getElementById('authLink').hidden = false;
                    document.getElementById('account').hidden = false;

                    var userData = response.userData;
                    if (userData !== null) {
                        document.getElementById('userName').innerHTML = userData.userName;
                        document.getElementById('dateCreate').innerHTML = userData.dateCreate;
                        document.getElementById('dateVisit').innerHTML = userData.dateVisit;
                    }
                }
                else document.getElementById('noAuthLink').hidden = false;
            }

        },
        failure: function (response) {
            alert(response);
        }
    });
}

/** обратный отсчёт */
function TimeLeft() {
    try {
        var timeLeftHost = (timeLeftSrv !== null && timeLeftSrv !== undefined) ? timeLeftSrv : (ajaxHost !== null && ajaxHost !== undefined ? ajaxHost : '');
        $.get(timeLeftHost + '/AjaxData/TimeLeft/')
            .success(function (response) {
                // обратный отсчёт
                if (response.timeLeft !== undefined) {
                    timeleft = JSON.parse(response.timeLeft);
                    var max = 300;
                    var min = 0;
                    rndCounter = Math.floor(Math.random() * (max - min + 1)) + min;
                    var servTime = new Date(response.servTime);
                    var diff = Math.abs(new Date() - servTime);
                    $(".spinner").addClass('hidden');
                    $(".spinner").html("");
                    time();
                    intervalID = setInterval(time, period);
                }
                servTime = new Date(response.servTime);
            }, 'json')
            .error(function () { /*alert("Ошибка получения оставшегося времени с сервера");*/ });
    } catch (err) {
        console.log('ошибка Ajax');
    }
}

// вкл/откл. звёздное небо
function OnOffStarsBg(isBgImage) {
    if (isBgImage !== undefined) document.cookie = "bgimage=" + isBgImage;

    var bgimage = getCookie('bgimage');
    if (bgimage !== undefined && bgimage !== null) {
        if (bgimage !== undefined && bgimage !== null && bgimage.toLowerCase() == 'false') {
            $('body').css('background-image', 'none');
            $('body').css('background-color', '#000E2B');
        }
        else {
            $('body').css('background', '#000 url("_content/UiMain/img/stars.gif") repeat fixed 0% 0%');
        }
    }
}

// вкл/откл. непрочитанное
function DisableEnableUnread(isDisableUnread) {
    if (isDisableUnread !== undefined) document.cookie = "DisableUnread=" + isDisableUnread;
    alert("Непрочитанное " + (isDisableUnread == "false" ? "включено." : "отключено. Заново включить можно на главной странице (в разделе 'Разное')."));
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

// перед загрузкой результатов графика
function chartBegin(e) {
    if (isLoadEj2 === false) {

        $('#spinner-chart').show();

        // загружаем css
        var ej2css = 'https://cdn.syncfusion.com/ej2/material.css';
        if (document.createStyleSheet) {
            document.createStyleSheet(ej2css);
        }
        else {
            $("head").append($("<link rel='stylesheet' href='" + ej2css + "' type='text/css' />"));
        }

        // загружаем js
        $.getScript("https://cdn.syncfusion.com/ej2/dist/ej2.min.js")
            .done(function (script, textStatus) {
                isLoadEj2 = true;
                ej.base.L10n.load({
                    'ru-RU': {
                        'chart': {
                            "Zoom": "Увеличить",
                            "ZoomIn": "Приблизить",
                            "ZoomOut": "Уменьшить",
                            "Pan": "Перемещение",
                            "Reset": "Сброс",
                            "ResetZoom": "Сбросить масштаб"
                        }
                    }
                });
                ej.base.setCulture('ru-RU');
                document.getElementById("chart-link").click(); // отправляем поисковый запрос
            })
            .fail(function (jqxhr, settings, exception) {
                console.log("Ошибка загрузки скрипта ej2.min.js");
            });

        return false; // отменяем отрпавку поискового запроса, поскольку на этом этапе загружаем ej2.min.js
    }
};



// обратный отсчёт до Посыла
function time() {

    if (onDebugTimeleft) console.log('Вход в обработку параметров обратного отсчёта');

	counter3 += period/1000;

    //if (timeleft >= 0) {
        var today = 0;
        var thour = timeleft <= 0 ? 0 : Math.floor(timeleft / 3600);
        var tmin = timeleft <= 0 ? 0 : Math.floor(timeleft / 60 - 60 * thour);
        var tsec = timeleft <= 0 ? 0 : timeleft % 60;

        if (timeleft !== -1) {
            timestr = (today > 0 ? '<span class="txt-gray">' + today + '</span>' + declOfNum(today, [' день ', ' дня ', ' дней ']) : '') + '<span class="txt-gray">' + thour + '</span>' + declOfNum(thour, [' час ', ' часа ', ' часов ']) + '<span class="txt-gray">' + tmin + '</span>' + declOfNum(tmin, [' минута ', ' минуты ', ' минут ']) + '<span class="txt-gray">' + tsec + '</span>' + " сек.";
            document.getElementById('t').innerHTML = timestr;
            if ($("#timeleft").hasClass('hidden')) {
                $("#timeleft").removeClass('hidden');
            }
        }
        if (timeleft >= 0) timeleft -= period/1000;
    //}

    // за ~10-5 минут до Посыла устанавливаем рандомный момент времени для синхронизации (для тех, кто больше 30 минут назад обновился)
    var max = 600;
    var min = 300;
    if (timeleft <= max+10 && timeleft >= min && !timeUpdated && rndLeft === 0 && counter3 > 1800) {
        rndLeft = Math.floor(Math.random() * (max - min + 1)) + min;
        if (onDebugTimeleft) console.log('rndLeft = ' + rndLeft);
    }

    // синхронизируем остаток с сервером в назначенное рандомное время
    if (rndLeft > 0 && timeleft <= rndLeft && timeleft > 0 && !timeUpdated) {
        timeUpdated=true;
        if (onDebugTimeleft) console.log('синхронизация за ~10 мин.');
        time_server();
    }

    if (timeleft <= 0 && counter >= (900 + rndCounter)) { // через 15+rnd минут после начала Посыла синхронизируем (получаем остаток времени до следующего Посыла)
        timeUpdated=false;
        if (onDebugTimeleft) console.log('синхронизация через ~15 мин.');
        time_server();
        counter = 0;
    }
    else if (timeleft <= 0) counter += period/1000;

    // если разница во времени между сервером и локальным компьютером больше чем эта разница была при загрузке страницы, т.е. страница сайта была долго в спящем режиме (комп. был в спящем режиме)
    if (Math.abs((new Date()) - servTime) > (diff + 30000)) {
        if (counter2 >= 60) { // через каждую минуту пытаемся синхронизировать (поскольку плохое соединение, то не сразу получится)
            if (onDebugTimeleft) console.log('разница - ' + Math.abs((new Date()) - servTime));
            counter = 0;
            counter2 = 0;
            counter3 = 0;
            timeUpdated=false;
            time_server();
        }
        else counter2 += period/1000;
    }

    /*if (counter >= 300) { // через каждые 5 минут (=300) синхронизируем остаток с сервером
        time_server();
        counter = 0;
    }
    else counter += 5;*/

    servTime.setSeconds(servTime.getSeconds() + period / 1000); // поддерживаем в актуальном состоянии время, полученное с сервера

    if (onDebugTimeleft) {
        if (onDebugTimeleft) {
            console.log('timeleft = ' + timeleft + '; rndLeft = ' + rndLeft + '; timeUpdated = ' + timeUpdated);
            console.log('Выход из обработки параметров обратного отсчёта');
        }
    }
}

// получаем оставшееся время с сервера
function time_server() {

	var reqStart = new Date();
    try {
        var timeLeftHost = (timeLeftSrv !== null && timeLeftSrv !== undefined) ? timeLeftSrv : (ajaxHost !== null && ajaxHost !== undefined ? ajaxHost : '');
        $.get(timeLeftHost + '/AjaxData/TimeLeft/')
        .success(function (response) {
            var localTime = new Date();
            reqDif = localTime - reqStart; // продолжительность запроса в милисекундах

            timeleft = response.timeLeft; // data[0];
            servTime = new Date(response.servTime); // data[1]
            counter3 = 0;
            if (onDebugTimeleft) {
                console.log('reqDif = ' + reqDif);
                console.log('timeleft = ' + timeleft);
                console.log('servTime = ' + servTime);
                console.log('localTime = ' + localTime);
            }

            reqDif = Math.round(reqDif / 1000); // продолжительность запроса в секундах
        }, 'json')
        .error(function () { /*alert("Ошибка получения оставшегося времени с сервера");*/ });
	} catch (err) {

        console.log('ошибка Ajax');

	}    
}

// склонение числительных
function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

/*function addMetaTag(name, content) {
    var meta = document.createElement('meta');
    meta.httpEquiv = name;
    meta.content = content;
    document.getElementsByTagName('head')[0].appendChild(meta);
}*/

function reload_js(src) {
    $('script[src="' + src + '"]').remove();
    //$("#" + id).remove();
    $('<script>').attr('src', src).appendTo('head');
}
var dataload;
var curDay = new Date();
var r1 = 199, r2 = 74, r3 = 199, r4 = 74, g1 = 239, g2 = 114, g3 = 239, g4 = 114, b1 = 254, b2 = 129, b3 = 254, b4 = 129, d1 = 1, d2 = -1, d3 = 1, d4 = -1, h = "0123456789abcdef";

var counter;

var monthA = 'январь,февраль,март,апрель,май,июнь,июль,август,сентябрь,октябрь,ноябрь,декабрь'.split(',');

function hex(c) { return h.charAt(c >> 4) + h.charAt(c & 15); }
function daymess() { r1 += d1; g1 += d1; b1 += d1; $(".daymsgblink").css("color", "#" + hex(r1) + hex(g1) + hex(b1)); if (b1 === 128 || b1 === 255) d1 = -d1; } // для мигания дней посылов в календаре

//Запрос и получение дат новостей за месяц соответствующего года
function requestData(month, year) {
    debugger;
    // ограничение по минимальному году
    if (year < minyear) {
        var curdate = new Date();
        year = curdate.getFullYear();
        month = curdate.getMonth() + 1;
    }

    selMonth = month;
    selYear = year;
    counter = 1;

    //$.getJSON("/AjaxData/Calendar?year=" + year + "&month=" + month,	//получаем с сервера файл с данными
    $.getJSON('/AjaxData/Calendar/'+selYear+'-'+selMonth+'.json',	//получаем с сервера файл с данными
        function (events) {
            //debugger
            //dataload = events !== undefined ? JSON.parse(events.calendarData) : undefined;
            dataload = events !== undefined ? events.calendarData : undefined;
            $('#datepicker').datepicker('update', new Date(year, month - 1, 1));

            $('#dmy').html(monthA[month - 1] + ' ' + year); // месяц год по русски
            curDay = new Date();
      });
}

// Получаем данные текущего месяца
function loadData(month, year) {
    date = new Date();
    month = month === null ? date.getMonth() + 1 : month;
    year = year === null ? date.getFullYear() : year;
    requestData(month, year);
}

$(document).ready(function () {

    var specDate = [];
    // особые даты
    specDate['specDate1'] = { 'date': new Date('2010/08/17').toISOString(), tooltip: '', enabled: true, url: '/2010/17.08.10.html' };
    specDate['specDate2'] = { 'date': new Date('2010/07/22').toISOString(), tooltip: '', enabled: true, url: '/2010/22.07.10.html' };
    specDate['specDate3'] = { 'date': new Date('2012/11/26').toISOString(), tooltip: '26 НОЯБРЯ – ВСЕЛЕНСКИЙ СОБОР', enabled: false };
    specDate['specDate4'] = { 'date': new Date('2013/07/26').toISOString(), tooltip: '26 ИЮЛЯ – ВЕЛИКОЕ ВЕЧЕ НАЧАЛА НАЧАЛ', enabled: false };
    specDate['specDate5'] = { 'date': new Date('2014/07/26').toISOString(), tooltip: '26 ИЮЛЯ – ВЕЛИКОЕ ВЕЧЕ «МЫ ГОТОВЫ»', enabled: false };
    specDate['specDate6'] = { 'date': new Date('2014/11/17').toISOString(), tooltip: '17 НОЯБРЯ – ВЕЧЕ «МЫ В ВЕЧНОСТИ»', enabled: false };
    specDate['specDate7'] = { 'date': new Date('2015/08/26').toISOString(), tooltip: '26 АВГУСТА – ВЕЧЕ “НАДЕЖДА”', enabled: true, url: '/2015/26.08.15.html' };
    specDate['specDate8'] = { 'date': new Date('2016/05/20').toISOString(), tooltip: '20 МАЯ – НАУЧНЫЙ ФОРУМ', enabled: false };


    $('#dmy').html(monthA[selMonth - 1] + ' ' + selYear); // месяц год по русски

    $(function () {
        $("#datepicker").datepicker({
            startDate: "08/26/2004",
            language: "ru",
            todayHighlight: false,
            //defaultViewDate: selDate,
            maxViewMode: 0,
            beforeShowDay: function eventsDates(date) {
                var monthName = 'ЯНВАРЯ,ФЕВРАЛЯ,МАРТА,АПРЕЛЯ,МАЯ,ИЮНЯ,ИЮЛЯ,АВГУСТА,СЕНТЯБРЯ,ОКТЯБРЯ,НОЯБРЯ,ДЕКАБРЯ'.split(',');
                if (selMonth > (date.getMonth() + 1) || selYear > date.getFullYear()) {
                    return { url: " ", enabled: false, classes: 'hideday' };
                }
                var mdy = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate());
                if (dataload !== undefined) {
                    var events_tmp = (mdy in dataload) ? dataload[mdy] : false;
                    if (Array.isArray(events_tmp)) {
                        for (var i = events_tmp.length - 1; i >= 0; i--) {
                            events = events_tmp[i];
                            if (events.link && events.link.indexOf('poems') === -1) break;
                        }
                    }
                    else events = events_tmp;

                    year = date.getFullYear();

                    // формируем ссылку для дня в календаре
                    if (Array.isArray(dataload[mdy])) {
                        link = events.link;
                    }
                    else {
                        if (dataload[mdy] !== undefined) link = dataload[mdy].link;
                        else link = ' ';
                    }
                    var myRe = /^poems\/\S+/i; // для Катренов по ссылке будем переходить на страницу с несколькими Катренами
                    var myArray = myRe.exec(link);
                    //var newsdate = (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) + "-" + (date.getMonth() + 1) + "-" + date.getFullYear(); // формат даты: 31-1-2019
                    var newsdate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2); // дата в формате 2020-08-02
                    if (myArray !== null) var newlink = "/poems/" + newsdate; // "/poems/?date="
                    else newlink = "/" + link + ".html";
                    urlmy = link !== ' ' ? newlink : ' '; // ссылка данного дня в календаре

                    styleday = {
                        url: urlmy,
                        enabled: true,
                        tooltip: events ? events.title : ' ',
                        classes: ''
                    };
                    for (var i = 1; i < 9; i++) {
                        if (date.toISOString() === specDate['specDate' + i].date) return { classes: 'specdate', tooltip: specDate['specDate' + i].tooltip, enabled: specDate['specDate' + i].enabled, url: specDate['specDate' + i].url }
                    }

                    if (events) {
                        //debugger;
                        styleday.classes = 'activeday';
                        if (Array.isArray(events_tmp)) { // в одном дне есть несколько ссылок (напр. Послание и Катрен)
                            for (var i = 0; i < events_tmp.length; i++) {
                                var curevents = events_tmp[i];
                                if (Array.isArray(curevents)) { // напр. есть несколько Катренов в один день
                                    for (var j = 0; j < events_tmp.length; j++) {
                                        var cursubevents = curevents[j];
                                        if (cursubevents.data && cursubevents.data.poemOutDict !== undefined && cursubevents.data.poemOutDict) {
                                            styleday.classes = 'dict-poem'; styleday.tooltip = 'Катрен и Послание'/*dictout[cursubevents.link]*/;
                                        }
                                    }
                                }
                                else if (curevents.data && curevents.data.poemOutDict !== undefined && curevents.data.poemOutDict) {
                                    styleday.classes = 'dict-poem'; styleday.tooltip = 'Катрен и Послание'/*dictout[curevents.link]*/;
                                }
                            }
                        }
                        if (events.link && (events.link).indexOf('poems') + 1) {
                            styleday.classes = 'katren';
                        }
                    }
                    else styleday.enabled = false;

                    if (date.getTime() > (new Date(2017, 9, 26)).getTime()) {
                        styleday.tooltip = date.getDate() + ' ' + monthName[date.getMonth()] + ' – КОЛЛЕКТИВНЫЙ ПОСЫЛ \nНА ЛЮБОВЬ И ДУХОВНОЕ ЕДИНЕНИЕ';
                    }

                    return styleday;
                }
            }
        }).on('changeMonth', function (ev) {
            month = ev.date.getMonth() + 1; selMonth = month;
            year = ev.date.getFullYear(); selYear = year;
            requestData(month, year);
        }).data('datepicker')
    }).on('changeDate', function (ev) { // сейчас не используется
    });

});


function changeMonth() {
    month = $('#month').val();
    year = $('#year').val();
    if (month !== "-1" && year !== "-1") {
        month = parseInt(month); selMonth = month;
        year = parseInt(year) + 2004; selYear = year;
        requestData(month, year);
    }


}

function changeYear() {
    month = $('#month').val();
    year = $('#year').val();
    if (month !== "-1" && year !== "-1") {
        month = parseInt(month); selMonth = month;
        year = parseInt(year) + 2004; selYear = year;
        requestData(month, year);
    }
}

// получаем дату из ссылки
function getUrlVars() {

    var vars = [], hash;

    var parts = window.location.href.replace(/([\.a-z0-9_-]+)\.html/gi, function (m, key, value) {
        vars['date'] = key;
    });

    if (vars['date'] === undefined) {

        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

        for (var i = 0; i < hashes.length; i++) {

            var myRe = /^date=(\d+)-(\d+)-(\d+)/i; // для Катренов по ссылке будем переходить на страницу с несколькими Катренами
            var myArray = myRe.exec(hashes[i]);
            if(myArray !== null) vars['date'] = myArray[1] + "." + myArray[2] + "."+myArray[3].substr(2,2);
        }
    }

    return vars;
}
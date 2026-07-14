function tooltipstering() {
    // назначаем каждому четверостишию Катерена свой всплывающий номер (https://iamceege.github.io/tooltipster/)
    if (location.pathname.indexOf("/print") !== 0) {
        let counterNumbPoem = 1;
        $(".page-main").children().each(function (indx, element) {
            if (element.className.toLowerCase() === "page-title" || element.className.toLowerCase() === "next") counterNumbPoem = 1;
            if (element.classList.contains("poem")) {
                $(element).tooltipster({
                    content: counterNumbPoem++,
                    distance: -11,
                    delay: 0,
                    timer: 300,
                    theme: ['tooltipster-default', 'tooltipster-default-customized'],
                    functionPosition: function (instance, helper, position) {
                        //debugger;
                        //position.coord.top += 150;
                        position.coord.left = helper.geo.origin.offset.left - 11;
                        return position;
                    }
                });
            }
        });
    }
}

function OnAfterRender() {
    //debugger;
    //console.log('OnAfterRender');
}

export function OnAfterRenderExp() {
    //debugger;
    //console.log('OnAfterRenderExp');

    tooltipstering();
}

// вызывается при добавлении скрипта на страницу
export function onLoad() {
    //console.log('Loaded');
}

// вызывается, когда скрипт все еще существует на странице после расширенного обновления.
export function onUpdate() {
    //debugger;
    //console.log('Updated');
}

// вызывается, когда скрипт удаляется со страницы после расширенного обновления. (сюда почему-то никогда не попадаем)
export function onDispose() {
    //console.log('Disposed');
}




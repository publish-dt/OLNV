window.Popover = (content) => {
    debugger;
    $('.page-title').popover({ // popover метод не работает, т.к. не загружен bootstrap.js
        placement: 'top',
        content: content
    });
}

window.DisplayPage = (view) => document.getElementById("page").style.display = view;
window.DisplayPrint = (view) => document.getElementById("block-print").style.display = view;

window.focusElement = (id) => {
    const element = document.getElementById(id);
    element.focus();
}

window.collapseMenu = () => {
    $('#bs-navbar').collapse('hide');
}

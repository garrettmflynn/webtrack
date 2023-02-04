// Get query selector input
function convertAttributesToQuerySelector(element) {

    var tagName = element.tagName.toLowerCase();
    var result = tagName;

    Array.prototype.slice.call(element.attributes).forEach(function (item) {
        if (element.outerHTML.includes(item.name))
            result += '[' + item.name + '="' + item.value + '"]';

    });

    return result;
}

function getMyPath(element) {
    const parentEl = element.parentElement;
    if (!parentEl || parentEl.tagName == 'HTML') return 'html';
    return getMyPath(parentEl) + '>' + parentEl.tagName.toLowerCase();
}

export function getQuerySelectorInput(element) {

    var elementPath = getMyPath(element);
    var simpleSelector = convertAttributesToQuerySelector(element);

    return elementPath + '>' + simpleSelector;

}
/*========================================================================
 * FILE:    HtmlHelper.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for building HTML elements (tags)
 */
/*------------------------------------------------------------------------
 *                      CONSTANTS
 */
const TAG_LIST_ITEM = "li";

/*------------------------------------------------------------------------
 *                      EXPORTED FUNCTIONS
 */
const anchor = function (volume) {
    return `<a name="v${volume.id}" />`;
};

const div = function (parameters) {
    let classString = "";
    let contentString = "";
    let idString = "";

    if (parameters.classKey !== undefined) {
        classString = ` class="${parameters.classKey}"`;
    }

    if (parameters.content !== undefined) {
        contentString = parameters.content;
    }

    if (parameters.id !== undefined) {
        idString = ` id="${parameters.id}"`;
    }

    return `<div${idString}${classString}>${contentString}</div>`;
};

const element = function (tagName, content, classValue) {
    let classString = "";

    if (classValue !== undefined) {
        classString = ` class="${classValue}"`;
    }

    return `<${tagName}${classString}>${content}</${tagName}>`;
};

const link = function (parameters) {
    let classString = "";
    let contentString = "";
    let hrefString = "";
    let idString = "";
    let titleString = "";

    if (parameters.classKey !== undefined) {
        classString = ` class="${parameters.classKey}"`;
    }

    if (parameters.content !== undefined) {
        contentString = parameters.content;
    }

    if (parameters.href !== undefined) {
        hrefString = ` href="${parameters.href}"`;
    }

    if (parameters.id !== undefined) {
        idString = ` id="${parameters.id}"`;
    }

    if (parameters.title !== undefined) {
        titleString = ` title="${parameters.title}"`;
    }

    return `<a${idString}${classString}${hrefString}${titleString}>${contentString}</a>`;
};

const listItem = function (content) {
    return element(TAG_LIST_ITEM, content);
};

const listItemLink = function (content, href = "") {
    return listItem(link({ content, href: `#${href}` }));
};

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
// Note that by exporting an object, we give an explicit "namespace" to
// the methods of this module.  Here we use the name Html, but in general,
// the client who imports the object can use any name they'd like.  That
// name becomes the prefix for each method, e.g. Html.anchor(...),
// Html.div(...) and so forth.
const Html = {
    anchor,
    div,
    element,
    link,
    listItem,
    listItemLink
}

export default Object.freeze(Html);
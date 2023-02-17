/*========================================================================
 * FILE:    Breadcrumbs.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for managing breadcrumb navigation
 */
/*------------------------------------------------------------------------
 *                      IMPORTS
 */
import Html from "./HtmlHelper.js";

/*------------------------------------------------------------------------
 *                      CONSTANTS
 */
const DIV_BREADCRUMBS = "crumbs";
const TAG_UNORDERED_LIST = "ul";
const TEXT_TOP_LEVEL = "The Scriptures";

/*------------------------------------------------------------------------
 *                      EXPORTED FUNCTIONS
 */
const injectBreadcrumbs = function (volume, book, chapter) {
    let crumbs = "";

    if (volume === undefined) {
        crumbs = Html.listItem(TEXT_TOP_LEVEL);
    } else {
        crumbs = Html.listItemLink(TEXT_TOP_LEVEL);

        if (book === undefined) {
            crumbs += Html.listItem(volume.fullName);
        } else {
            crumbs += Html.listItemLink(volume.fullName, volume.id);

            if (chapter === undefined || chapter <= 0) {
                crumbs += Html.listItem(book.tocName);
            } else {
                crumbs += Html.listItemLink(
                    book.tocName,
                    `${volume.id}:${book.id}`
                );
                crumbs += Html.listItem(chapter);
            }
        }
    }

    document.getElementById(DIV_BREADCRUMBS).innerHTML
        = Html.element(TAG_UNORDERED_LIST, crumbs);
};

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
export { injectBreadcrumbs };
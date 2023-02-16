/*========================================================================
 * FILE:    Chapter.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for managing chapter text
 */
/*------------------------------------------------------------------------
 *                      IMPORTS
 */
import { requestChapterText } from "./MapScripApi.js";
import { DIV_SCRIPTURES } from "./Navigation.js";

/*------------------------------------------------------------------------
 *                      CONSTANTS
 */
const CLASS_ICON = "material-icons";
const ICON_NEXT = "skip_next";
const ICON_PREVIOUS = "skip_previous";
const TAG_SPAN = "span";

/*------------------------------------------------------------------------
 *                      VARIABLES
 */
let requestedBookId;
let requestedChapter;
let requestedNextPrevious;

/*------------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const computeNextPreviousChapter = function (bookId, chapter) {
    let nextPrev = previousChapter(bookId, chapter);

    if (nextPrev === undefined) {
        requestedNextPrevious = "";
    } else {
        requestedNextPrevious = nextPreviousMarkup(nextPrev, ICON_PREVIOUS);
    }

    nextPrev = nextChapter(bookId, chapter);

    if (nextPrev !== undefined) {
        requestedNextPrevious += nextPreviousMarkup(nextPrev, ICON_NEXT);
    }
};

const getScripturesSuccess = function (chapterHtml) {
    let book = books[requestedBookId];

    document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

    document.querySelectorAll(".navheading").forEach(function (element) {
        element.innerHTML += `<div class="nextprev">${requestedNextPrevious}</div>`;
    });

    injectBreadcrumbs(volumeForId(book.parentBookId), book, requestedChapter);
    setupMarkers();
};

const nextChapter = function (bookId, chapter) {
    let book = books[bookId];

    if (book !== undefined) {
        if (chapter < book.numChapters) {
            return [
                bookId,
                chapter + 1,
                titleForBookChapter(book, chapter + 1)
            ];
        }

        let nextBook = books[bookId + 1];

        if (nextBook !== undefined) {
            let nextChapterValue = 0;

            if (nextBook.numChapters > 0) {
                nextChapterValue = 1;
            }

            return [
                nextBook.id,
                nextChapterValue,
                titleForBookChapter(nextBook, nextChapterValue)
            ];
        }
    }
};

const nextPreviousMarkup = function (nextPrev, icon) {
    return htmlLink({
        content: htmlElement(TAG_SPAN, icon, CLASS_ICON),
        href: `#0:${nextPrev[0]}:${nextPrev[1]}`,
        title: nextPrev[2]
    });
};

const previousChapter = function (bookId, chapter) {
    let book = books[bookId];

    if (book !== undefined) {
        if (chapter > 1) {
            return [
                bookId,
                chapter - 1,
                titleForBookChapter(book, chapter - 1)
            ];
        }

        let previousBook = books[bookId - 1];

        if (previousBook !== undefined) {
            return [
                previousBook.id,
                previousBook.numChapters,
                titleForBookChapter(previousBook, previousBook.numChapters)
            ];
        }
    }
};

const titleForBookChapter = function (book, chapter) {
    if (book !== undefined) {
        if (chapter > 0) {
            return `${book.tocName} ${chapter}`;
        }

        return book.tocName;
    }
};

/*------------------------------------------------------------------------
 *                      EXPORTED FUNCTIONS
 */
const navigateChapter = function (bookId, chapter) {
    requestedBookId = bookId;
    requestedChapter = chapter;

    computeNextPreviousChapter(bookId, chapter);
    requestChapterText(bookId, chapter, getScripturesSuccess);
};

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
export { navigateChapter };
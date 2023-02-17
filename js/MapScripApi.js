/*========================================================================
 * FILE:    MapScripApi.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for managing interactions with scriptures.byu.edu
 */
/*------------------------------------------------------------------------
 *                      CONSTANTS
 */
const URL_BASE = "https://scriptures.byu.edu/";
const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;

/*------------------------------------------------------------------------
 *                      VARIABLES
 */
let books;
let volumes;

/*------------------------------------------------------------------------
 *                      PRIVATE HELPERS
 */
const cacheBooks = function (callback) {
    volumes.forEach(function (volume) {
        let volumeBooks = [];
        let bookId = volume.minBookId;

        while (bookId <= volume.maxBookId) {
            volumeBooks.push(books[bookId]);
            bookId += 1;
        }

        volume.books = volumeBooks;
    });

    Object.freeze(books);
    Object.freeze(volumes);

    if (typeof callback === "function") {
        callback();
    }
};

const encodedScripturesUrlParameters = function (bookId, chapter, verses, isJst) {
    if (bookId !== undefined && chapter !== undefined) {
        let options = "";

        if (verses !== undefined) {
            options += verses;
        }

        if (isJst !== undefined) {
            options += "&jst=JST";
        }

        return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses${options}`;
    }
};

const getJSON = function (url) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.json();
        }
    });
};

/*------------------------------------------------------------------------
*                      EXPORTED FUNCTIONS
*/
const init = function (callback) {
    Promise.all([getJSON(URL_VOLUMES), getJSON(URL_BOOKS)])
        .then(function (jsonResults) {
            const [volumesJson, booksJson] = jsonResults;

            volumes = volumesJson;
            books = booksJson;
            cacheBooks(callback);
        });
};

const requestChapterText = function (bookId, chapter, success, failure) {
    fetch(encodedScripturesUrlParameters(bookId, chapter))
        .then(function (response) {
            if (response.ok) {
                response.text()
                    .then(function (chapterHtml) {
                        if (typeof success === "function") {
                            success(chapterHtml);
                        }
                    });
            } else {
                if (typeof failure === "function") {
                    failure(`Network failure: ${response.statusText}`);
                }
            }
        })
        .catch(function (error) {
            if (typeof failure === "function") {
                failure(error);
            }
        });
};

const volumeForId = function (volumeId) {
    if (volumeId !== undefined && volumeId > 0 && volumeId < volumes.length) {
        return volumes[volumeId - 1];
    }
};

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
export { books, init, requestChapterText, volumeForId, volumes };
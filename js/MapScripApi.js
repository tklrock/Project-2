/*========================================================================
 * FILE:    MapScripApi.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for managing interactions with scriptures.byu.edu
 */
/*------------------------------------------------------------------------
 *                      EXPORTED FUNCTIONS
 */
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

const requestChapterText = function (bookId, chapter, success) {
    fetch(encodedScripturesUrlParameters(bookId, chapter))
        .then(function (response) {
            if (response.ok) {
                response.text().then(function (chapterHtml) {
                    if (typeof success === "function") {
                        success(chapterHtml);
                    }
                });
            }
        });
}

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
export { requestChapterText };
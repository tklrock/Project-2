/*========================================================================
 * FILE:    Scriptures.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Front-end JavaScript code for the Scriptures, Mapped.
 */
/*-------------------------------------------------------------------
 *                      IMPORTS
 */
import Html from "./HtmlHelper.js";
import { injectBreadcrumbs } from "./Breadcrumbs.js";

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const BOTTOM_PADDING = "<br /><br />";
const CLASS_BOOKS = "books";
const CLASS_BUTTON = "btn";
const CLASS_CHAPTER = "chapter";
const CLASS_VOLUME = "volume";
const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
const INDEX_FLAG = 11;
const INDEX_LATITUDE = 3;
const INDEX_LONGITUDE = 4;
const INDEX_PLACENAME = 2;
const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
const MAX_ZOOM_LEVEL = 18;
const MIN_ZOOM_LEVEL = 6;
const TAG_HEADER5 = "h5";
const URL_BASE = "https://scriptures.byu.edu/";
const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
const ZOOM_RATIO = 450;

/*-------------------------------------------------------------------
 *                      PRIVATE VARIABLES
 */
let books;
let geoplaces = [];
let gmMarkers = [];
let volumes;

/*-------------------------------------------------------------------
    *                      PRIVATE METHODS
    */
const addGeoplace = function (placename, latitude, longitude) {
    let index = geoplaceIndex(latitude, longitude);

    if (index >= 0) {
        mergePlacename(placename, index);
    } else {
        geoplaces.push({
            latitude,
            longitude,
            placename
        });
    }
};

const addMarkers = function () {
    geoplaces.forEach(function (geoplace) {
        const marker = new markerWithLabel.MarkerWithLabel({
            animation: google.maps.Animation.DROP,
            clickable: false,
            draggable: false,
            labelAnchor: new google.maps.Point(0, -3),
            labelClass: "maplabel",
            labelContent: geoplace.placename,
            map,
            position: { lat: Number(geoplace.latitude), lng: Number(geoplace.longitude) }
        });

        gmMarkers.push(marker);
    });
};

const bookChapterValid = function (bookId, chapter) {
    let book = books[bookId];

    if (book === undefined || chapter < 0 || chapter > book.numChapters) {
        return false;
    }

    return chapter === 0 || book.numChapters > 0;
};

const booksGrid = function (volume) {
    return Html.div({
        classKey: CLASS_BOOKS,
        content: booksGridContent(volume)
    });
};

const booksGridContent = function (volume) {
    let gridContent = "";

    volume.books.forEach(function (book) {
        gridContent += Html.link({
            classKey: CLASS_BUTTON,
            content: book.gridName,
            href: `#${volume.id}:${book.id}`,
            id: book.id
        });
    });

    return gridContent;
};

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

    if (typeof callback === "function") {
        callback();
    }
};

const chaptersGrid = function (book) {
    return Html.div({
        classKey: CLASS_VOLUME,
        content: Html.element(TAG_HEADER5, book.fullName)
    }) + Html.div({
        classKey: CLASS_BOOKS,
        content: chaptersGridContent(book)
    });
};

const chaptersGridContent = function (book) {
    let gridContent = "";
    let chapter = 1;

    while (chapter <= book.numChapters) {
        gridContent += Html.link({
            classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
            content: chapter,
            href: `#0:${book.id}:${chapter}`,
            id: chapter
        });

        chapter += 1;
    }

    return gridContent;
};

const clearMarkers = function () {
    gmMarkers.forEach(function (marker) {
        marker.setMap(null);
    });

    gmMarkers = [];
    geoplaces = [];
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

const geoplaceIndex = function (latitude, longitude) {
    let i = geoplaces.length - 1;

    while (i >= 0) {
        const geoplace = geoplaces[i];

        // Note: here is the safe way to compare IEEE floating-point
        // numbers: compare their difference to a small number
        const latitudeDelta = Math.abs(geoplace.latitude - latitude);
        const longitudeDelta = Math.abs(geoplace.longitude - longitude);

        if (latitudeDelta < 0.00000001 && longitudeDelta < 0.00000001) {
            return i;
        }

        i -= 1;
    }

    return -1;
};

const getJSON = function (url) {
    return fetch(url).then(function (response) {
        if (response.ok) {
            return response.json();
        }
    });
};

const init = function (callback) {
    Promise.all([getJSON(URL_VOLUMES), getJSON(URL_BOOKS)]).then(function (jsonResults) {
        const [volumesJson, booksJson] = jsonResults;

        volumes = volumesJson;
        books = booksJson;
        cacheBooks(callback);
    });
};

const mergePlacename = function (placename, index) {
    let geoplace = geoplaces[index];

    if (!geoplace.placename.includes(placename)) {
        geoplace.placename += ", " + placename;
    }
};

const navigateBook = function (bookId) {
    let book = books[bookId];

    if (book.numChapters <= 1) {
        navigateChapter(bookId, book.numChapters);
    } else {
        document.getElementById(DIV_SCRIPTURES).innerHTML = Html.div({
            content: chaptersGrid(book),
            id: DIV_SCRIPTURES_NAVIGATOR
        });
        injectBreadcrumbs(volumeForId(book.parentBookId), book);
    }
};

const navigateHome = function (volumeId) {
    document.getElementById(DIV_SCRIPTURES).innerHTML = Html.div({
        content: volumesGridContent(volumeId),
        id: DIV_SCRIPTURES_NAVIGATOR
    });
    injectBreadcrumbs(volumeForId(volumeId));
};

const onHashChanged = function () {
    let ids = [];

    if (location.hash !== "" && location.hash.length > 1) {
        ids = location.hash.slice(1).split(":");
    }

    if (ids.length <= 0) {
        navigateHome();
    } else if (ids.length === 1) {
        let volumeId = Number(ids[0]);

        if (volumeId < volumes[0].id || volumeId > volumes.slice(-1)[0].id) {
            navigateHome();
        } else {
            navigateHome(volumeId);
        }
    } else {
        let bookId = Number(ids[1]);

        if (books[bookId] === undefined) {
            navigateHome();
        } else {
            if (ids.length === 2) {
                navigateBook(bookId);
            } else {
                let chapter = Number(ids[2]);

                if (bookChapterValid(bookId, chapter)) {
                    navigateChapter(bookId, chapter);
                } else {
                    navigateHome();
                }
            }
        }
    }
};

const setupMarkers = function () {
    if (gmMarkers.length > 0) {
        clearMarkers();
    }

    let matches;

    document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach(function (element) {
        matches = LAT_LON_PARSER.exec(element.getAttribute("onclick"));

        if (matches) {
            let placename = matches[INDEX_PLACENAME];
            let latitude = parseFloat(matches[INDEX_LATITUDE]);
            let longitude = parseFloat(matches[INDEX_LONGITUDE]);
            let flag = matches[INDEX_FLAG];

            if (flag !== "") {
                placename = `${placename} ${flag}`;
            }

            addGeoplace(placename, latitude, longitude);
        }
    });

    if (geoplaces.length > 0) {
        addMarkers();
    }

    zoomMapToFitMarkers(matches);
};

const showLocation = function (id, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
    console.log(id, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewHeading);
    map.panTo({ lat: latitude, lng: longitude });
    map.setZoom(Math.round(viewAltitude / ZOOM_RATIO));
};

const volumeForId = function (volumeId) {
    if (volumeId !== undefined && volumeId > 0 && volumeId < volumes.length) {
        return volumes[volumeId - 1];
    }
};

const volumesGridContent = function (volumeId) {
    let gridContent = "";

    volumes.forEach(function (volume) {
        if (volumeId === undefined || volumeId === volume.id) {
            gridContent += Html.div({
                classKey: CLASS_VOLUME,
                content: Html.anchor(volume) + Html.element(TAG_HEADER5, volume.fullName)
            });

            gridContent += booksGrid(volume);
        }
    });

    return gridContent + BOTTOM_PADDING;
};

const zoomMapToFitMarkers = function (matches) {
    if (gmMarkers.length > 0) {
        if (gmMarkers.length === 1 && matches) {
            // When there's exactly one marker, add it and zoom to it
            let zoomLevel = Math.round(Number(matches[9]) / ZOOM_RATIO);

            if (zoomLevel < MIN_ZOOM_LEVEL) {
                zoomLevel = MIN_ZOOM_LEVEL;
            } else if (zoomLevel > MAX_ZOOM_LEVEL) {
                zoomLevel = MAX_ZOOM_LEVEL;
            }

            map.setZoom(zoomLevel);
            map.panTo(gmMarkers[0].position);
        } else {
            let bounds = new google.maps.LatLngBounds();

            gmMarkers.forEach(function (marker) {
                bounds.extend(marker.position);
            });

            map.panTo(bounds.getCenter());
            map.fitBounds(bounds);
        }
    }
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */
const Scriptures = Object.freeze({
    init,
    onHashChanged,
    showLocation
});

export default Scriptures;
export { init, onHashChanged, showLocation };
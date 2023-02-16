/*========================================================================
 * FILE:    MapHelper.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2023
 *
 * DESCRIPTION: Module for managing Google Maps API interactions
 */
/*------------------------------------------------------------------------
 *                      CONSTANTS
 */
const INDEX_FLAG = 11;
const INDEX_LATITUDE = 3;
const INDEX_LONGITUDE = 4;
const INDEX_PLACENAME = 2;
const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
const MAX_ZOOM_LEVEL = 18;
const MIN_ZOOM_LEVEL = 6;
const ZOOM_RATIO = 450;

/*------------------------------------------------------------------------
 *                      VARIABLES
 */
let geoplaces = [];
let gmMarkers = [];

/*------------------------------------------------------------------------
 *                      PRIVATE HELPERS
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

const clearMarkers = function () {
    gmMarkers.forEach(function (marker) {
        marker.setMap(null);
    });

    gmMarkers = [];
    geoplaces = [];
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

const mergePlacename = function (placename, index) {
    let geoplace = geoplaces[index];

    if (!geoplace.placename.includes(placename)) {
        geoplace.placename += ", " + placename;
    }
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

/*------------------------------------------------------------------------
 *                      EXPORTED FUNCTIONS
 */
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

/*------------------------------------------------------------------------
 *                      EXPORTS
 */
export { setupMarkers, showLocation };
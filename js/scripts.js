var map = L.map('map').setView([40, -95], 5);

var basemap = L.tileLayer('https://api.mapbox.com/styles/v1/zbackwell/clphi6hnu005w01r8g2gf41ak/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemJhY2t3ZWxsIiwiYSI6ImNsb2l5cnE3cjA1NXoya3BkcjdqZ3RsYWYifQ.z4_szcYwFxFXbcOmaM2e5g', {
    maxZoom: 19,
    minZoom: 5,
}).addTo(map);

// legend
function getColor(d) {
    return d === "Open Water" ? '#466b9f' :
           d === "Perennial Ice/Snow" ? '#d1def8' :
           d === "Developed, Open Space" ? '#dec5c5' :
           d === "Developed, Low Intensity" ? '#d99282' :
           d === "Developed, Medium Intensity" ? '#eb0000' :
           d === "Developed, High Intensity" ? '#ab0000' :
           d === "Barren Land" ? '#b3ac9f' :
           d === "Deciduous Forest" ? '#68ab5f' :
           d === "Evergreen Forest" ? '#1c5f2c' :
           d === "Mixed Forest" ? '#b5c58f' :
           d === "Shrub/Scrub" ? '#ccb879' :
           d === "Grassland/Herbaceous" ? '#dfdfc2' :
           d === "Pasture/Hay" ? '#dcd939' :
           d === "Cultivated Crops" ? '#ab6c28' :
           d === "Woody Wetlands" ? '#b8d9eb' :
           d === "Emergent Herbaceous Wetlands" ? '#6c9fb8' :
                      '#e5f5e0';
}
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        labels = ["Open Water", "Perennial Ice/Snow", "Developed, Open Space", "Developed, Low Intensity", "Developed, Medium Intensity", "Developed, High Intensity", "Barren Land",
    "Deciduous Forest", "Evergreen Forest", "Mixed Forest", "Shrub/Scrub", "Grassland/Herbaceous", "Pasture/Hay", "Cultivated Crops", "Woody Wetlands", "Emergent Herbaceous Wetlands"];

    // create the legend labels
    for (var i = 0; i < labels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(labels[i]) + '"></i> ' +
            (labels[i] ? labels[i] : '+') + '<br>';
    }
    return div;
};

legend.addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>US Land Cover Data Years</h4>' +  (props ?
        '<b>' + props.NAME + '</b><br />' + "Left: " + props.LEFT + '<br />' + 'Right: ' + props.RIGHT + '<br />'
        : 'Click on a state');
};

info.addTo(map);

document.addEventListener("DOMContentLoaded", function() {
    // create a button object
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Map";
    
    // append the button
    const mapControlsContainer = document.getElementById("mapControls");

    if (mapControlsContainer) {
        mapControlsContainer.appendChild(resetButton);
    } else {
        console.error("Map controls container not found");
    }

    // remove data when user clicks the button
    resetButton.addEventListener("click", function() {
        // reset to original view
        map.setView([40, -95], 5);
        
        // run function for each layer loaded
        map.eachLayer(function (layer) {
            // remove all layers except the basemap
            if (layer !== basemap) {
                map.removeLayer(layer);
            }
        })
        // update the info to remove current state
        info.update()
        // remove the slider when returning to main view
        map.removeControl(slider)
        // replace states layer since this function removes all layers
        geojson.addTo(map);
        });
});

function style(feature) {
    return {
        fillColor: "#00441b",
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.0
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#00CC00',
        dashArray: '',
        fillOpacity: 0.0
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

var slider;

// Oregon
var latLngBoundsOR = L.latLngBounds([[41.9917939999999987, -124.5524410000000017], [46.2710039999999978, -116.4635040000000004]]);

var OR1 = "https://zbackwell.github.io/landcover/data/nlcd_2019_oregon_100m.png";
var OR2 = "https://zbackwell.github.io/landcover/data/nlcd_2021_oregon_100m.png";

// Louisiana
var latLngBoundsLA = L.latLngBounds([[28.9297089999999990, -94.0431470000000047], [33.0194570000000027, -88.8170170000000070]]);

var LA1 = "https://zbackwell.github.io/landcover/data/nlcd_2004_louisiana_100m.png";
var LA2 = "https://zbackwell.github.io/landcover/data/nlcd_2006_louisiana_100m.png";

// California
var latLngBoundsCA = L.latLngBounds([[32.5341560000000030, -124.4095910000000060], [42.0095179999999999, -114.1344270000000023]]);

var CA1 = "https://zbackwell.github.io/landcover/data/nlcd_2016_california_100m.png";
var CA2 = "https://zbackwell.github.io/landcover/data/nlcd_2019_california_100m.png";

// Texas
var latLngBoundsTX = L.latLngBounds([[25.8373770000000000, -106.6454789999999946], [36.5007039999999989, -93.5164070000000009]]);

var TX1 = "https://zbackwell.github.io/landcover/data/nlcd_2001_texas_100m.png";
var TX2 = "https://zbackwell.github.io/landcover/data/nlcd_2021_texas_100m.png";

// error image
var errorOverlayUrl = "https://cdn-icons-png.flaticon.com/512/110/110686.png";

function loadData(STUSPS) {
    // create map panes to hold images in place
    map.createPane('left');
    map.createPane('right');

    var img1, img2;

    // check the abbreviation of the selected state
    if (STUSPS === "OR") {
        img1 = L.imageOverlay(OR1, latLngBoundsOR, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "left"
        }).addTo(map);

        img2 = L.imageOverlay(OR2, latLngBoundsOR, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "right"
        }).addTo(map);
    }
    else if (STUSPS === "LA") {
        img1 = L.imageOverlay(LA1, latLngBoundsLA, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "left"
        }).addTo(map);

        img2 = L.imageOverlay(LA2, latLngBoundsLA, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "right"
        }).addTo(map);
    }
    else if (STUSPS === "CA") {
        img1 = L.imageOverlay(CA1, latLngBoundsCA, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "left"
        }).addTo(map);

        img2 = L.imageOverlay(CA2, latLngBoundsCA, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "right"
        }).addTo(map);
    }
    else if (STUSPS === "TX") {
        img1 = L.imageOverlay(TX1, latLngBoundsTX, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "left"
        }).addTo(map);

        img2 = L.imageOverlay(TX2, latLngBoundsTX, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            interactive: true,
            pane: "right"
        }).addTo(map);
    }
    else {
        return;
    }

    // Add text box with year to each pane
    info.update(null);

    // add the images to and create the slider
    slider = L.control.sideBySide(img1, img2).addTo(map);
}

function setData(e) {
    var geojson = e.target.feature;
    var clickedState = geojson.properties.STUSPS;

    map.fitBounds(e.target.getBounds());

    // create a popup
    fetch('https://zbackwell.github.io/landcover/data/popupdata.json')
        .then(response => response.json())
        .then(data => {
            // check if clicked state has data to display
            if (data.hasOwnProperty(clickedState)) {
                var stateData = data[clickedState];
                var popupContent = '<b>' + stateData.event + '</b><br />' + stateData.text + '<br />' + stateData.text2;

                var popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(popupContent)
                    .openOn(map);

                // bind the popup to the state
                e.target.bindPopup(popup);
            } else {
                console.error("Data is not yet available for " + geojson.properties.NAME);
                var popupContent2 = "Data is not yet available for " + geojson.properties.NAME;

                var popup2 = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(popupContent2)
                    .openOn(map);
                e.target.bindPopup(popup2);
            }
        })
        .catch(error => console.error("Error fetching state data:", error));

    // call function to load the data for the selected state
    loadData(clickedState);
    info.update(geojson.properties);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: setData,
    });
    layer.feature = feature;
}

// create the geojson layer
function geojsonlayer(data){
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    return geojson
}

fetch('https://zbackwell.github.io/landcover/data/cb_2018_us_state_5m.geojson')
    // convert data to json
    .then(function(response){
        return response.json();
    })
    // callback to above functions
    .then(function(json){
        geojsonlayer(json)
    })

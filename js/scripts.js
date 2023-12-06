var map = L.map('map').setView([40, -95], 5);

// uncomment when project is done to use mapbox style
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

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < labels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(labels[i]) + '"></i> ' +
            (labels[i] ? labels[i] : '+') + '<br>';
    }
    return div;
};

legend.addTo(map);

// Oregon rasters
var OR19 = '/data/nlcd_2019_oregon_100m.png';
var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
var altText = 'Image of Newark, N.J. in 1922. Source: The University of Texas at Austin, UT Libraries Map Collection.';
var latLngBounds = L.latLngBounds([[41.9917939999999987, -124.5524410000000017], [46.2710039999999978, -116.4635040000000004]]);

var OR21 = '/data/nlcd_2021_oregon_100m.png';
var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
var altText = '2021 land cover image of Oregon.';
var latLngBounds = L.latLngBounds([[41.9917939999999987, -124.5524410000000017], [46.2710039999999978, -116.4635040000000004]]);

// create a reset button for the map data
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Map";
document.body.appendChild(resetButton)

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

function setData(e) {
    var geojson = e.target.feature

    map.fitBounds(e.target.getBounds());
    // if statement that checks if clicked feature is Oregon
    if (geojson.properties.STATEFP === "41") {
        // create map panes to hold images in place
        map.createPane('left');
        map.createPane('right');
        
        // define the images
        var img1 = L.imageOverlay(OR19, latLngBounds, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            alt: altText,
            interactive: true,
            pane: "left"
        }).addTo(map);

        var img2 = L.imageOverlay(OR21, latLngBounds, {
            opacity: 1,
            errorOverlayUrl: errorOverlayUrl,
            alt: altText,
            interactive: true,
            pane: "right"
        }).addTo(map);

        // add the images to and create the slider
        slider = L.control.sideBySide(img1, img2).addTo(map);
    }
    else {
        return;
    }
}

function resetMap(e) {
    // reset to original view
    map.setView([40, -95], 5);
    
    // remove all data layers to reset map
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    })
    // remove the slider when returning to main view
    map.removeControl(slider)
    // replace states layer since this function removes all layers
    geojson.addTo(map);
    // replace mapbox style basemap
    basemap.addTo(map);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: setData,
    });
    layer.feature = feature;
}

resetButton.onclick = resetMap;

// if not done in a function, fetching the GeoJSON file gave an error
function geojsonlayer(data){
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    return geojson
}

fetch('/data/cb_2018_us_state_5m.geojson')
    // convert data to json
    .then(function(response){
        return response.json();
    })
    // callback to above functions
    .then(function(json){
        geojsonlayer(json)
    })

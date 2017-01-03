var map
var toolbar

require([
    "esri/map",
    "esri/layers/VectorTileLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "dojo/domReady!"
], function(
    Map,
    VectorTileLayer,
    FeatureLayer,
    ArcGISTiledMapServiceLayer,
    Extent,
    SpatialReference
) {

    //xmin, xmax, ymin, ymax
    var startExtent = new Extent(-8262688.480463322, 511203.60837192694, -8233336.525747752, 520853.15207724134,
        new SpatialReference({
            wkid: 102100
        }))

    var map = new Map("map", {
        //center: [-74, 4], // longitude, latitude
        extent: startExtent,
        //zoom: 2
    })
    window.map = map

    map.on("load", createDrawToolbar)

    //The URL referenced in the constructor may point to a style url JSON (as in this sample)
    //or directly to a vector tile service
    var vtlayer = new VectorTileLayer("https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json")
    map.addLayer(vtlayer)

    // var fl = new FeatureLayer("https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/Geodatabase_Redes_CAN/FeatureServer/0", {
    //     mode: FeatureLayer.MODE_ONDEMAND,
    //     // tileWidth: 200,
    //     // tileHeight: 200
    // })
    // window.fl = fl
    // map.addLayer(fl)
    // for (var i = 0; i <= 21; i++) {
    //   map.addLayer(new FeatureLayer("https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/FeatureServer/"+i, {
    //     mode: FeatureLayer.MODE_ONDEMAND,
    //   }))
    // }

    map.addLayer(new ArcGISTiledMapServiceLayer("https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/MapServer"))

})

function createDrawToolbar(themap) {
    require([
        "esri/toolbars/draw",
        "dojo/dom",
        "dojo/on"
    ], function(
        Draw,
        dom,
        on
    ) {
        toolbar = new Draw(map)
        toolbar.on("draw-end", addToMap)

        var boton = dom.byId("btnDrawPoint")
        var signal = on(boton, "click", function() {
            onClickButtonToolbar(Draw, "POINT")
        })
        var boton = dom.byId("btnDrawLine")
        var signal = on(boton, "click", function() {
            onClickButtonToolbar(Draw, "LINE")
        })
        var boton = dom.byId("btnDrawPoly")
        var signal = on(boton, "click", function() {
            onClickButtonToolbar(Draw, "POLYGON")
        })
    })

}

function addToMap(evt) {
    require([
        "esri/graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
    ], function(
        Graphic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol
    ) {
        var symbol
        toolbar.deactivate()
        map.showZoomSlider()
        switch (evt.geometry.type) {
            case "point":
            case "multipoint":
                symbol = new SimpleMarkerSymbol()
                break
            case "polyline":
                symbol = new SimpleLineSymbol()
                break
            default:
                symbol = new SimpleFillSymbol()
                break
        }
        var graphic = new Graphic(evt.geometry, symbol)
        map.graphics.add(graphic)
    })
}

function onClickButtonToolbar(Draw, type) {
    toolbar.activate(Draw[type])
    map.hideZoomSlider()
    // remove listener after first event
    //signal.remove()
    // do something else...
}

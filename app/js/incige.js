var map
var toolbar
var esriConfig

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
    configBufferTool()

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

    //map.addLayer(new ArcGISTiledMapServiceLayer("https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/MapServer"))

})

function configBufferTool() {
    require([
        "esri/config",
        "esri/tasks/GeometryService"
    ], function(
        esriConfig,
        GeometryService
    ) {
        window.esriConfig = esriConfig
        esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer")
        esriConfig.defaults.io.proxyUrl = "/proxy/"
        esriConfig.defaults.io.alwaysUseProxy = false
    })
}

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
        var geometry = evt.geometry
        switch (geometry.type) {
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
        var graphic = new Graphic(geometry, symbol)
        map.graphics.add(graphic)
        window.currentGeometry = geometry
    })
}

function onClickButtonToolbar(Draw, type) {
    toolbar.activate(Draw[type])
    map.hideZoomSlider()
    // remove listener after first event
    //signal.remove()
    // do something else...
}


function doBuffer(evtObj) {
    require([
        "esri/tasks/GeometryService",
        "esri/graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/tasks/BufferParameters",
        "esri/geometry/normalizeUtils",
        "dojo/dom"
    ], function(
        GeometryService,
        Graphic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Color,
        BufferParameters,
        normalizeUtils,
        dom
    ) {
        //toolbar.deactivate()
        var geometry = evtObj.geometry
        var symbol
        switch (geometry.type) {
            case "point":
                symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]))
                break
            case "polyline":
                symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1)
                break
            case "polygon":
                symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
                break
        }

        var graphic = new Graphic(geometry, symbol)
        map.graphics.add(graphic)

        //setup the buffer parameters
        var params = new BufferParameters()
        params.distances = [dom.byId("buffer_distance").value]
        params.outSpatialReference = map.spatialReference
        params.unit = GeometryService[dom.byId("buffer_unit").value]
        //normalize the geometry

        normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries) {
            var normalizedGeometry = normalizedGeometries[0]
            if (normalizedGeometry.type === "polygon") {
                //if geometry is a polygon then simplify polygon.  This will make the user drawn polygon topologically correct.
                esriConfig.defaults.geometryService.simplify([normalizedGeometry], function(geometries) {
                    params.geometries = geometries
                    esriConfig.defaults.geometryService.buffer(params, showBuffer)
                })
            } else {
                params.geometries = [normalizedGeometry]
                esriConfig.defaults.geometryService.buffer(params, showBuffer)
            }

        })
    })
}

function showBuffer(bufferedGeometries) {
    require([
        "esri/graphic",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "dojo/_base/array"
    ], function(
        Graphic,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        array
    ) {
        var symbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 0, 0, 0.65]), 2
            ),
            new Color([255, 0, 0, 0.35])
        )
        array.forEach(bufferedGeometries, function(geometry) {
            var graphic = new Graphic(geometry, symbol)
            map.graphics.add(graphic)
        })
    })
}

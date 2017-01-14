var map
var toolbar
var esriConfig
var servicios

require(['dojo/request/xhr'], function(xhr) {
    xhr('conf/servicios.json', {
        handleAs: 'json'
    }).then(function(data) {
        // Do something with the handled data
        console.log(data)
        window.servicios = data
        createMap()
    }, function(err) {
        // Handle the error condition
        console.log("err", err)
    }, function(evt) {
        // Handle a progress event from the request if the
        // browser supports XHR2
        console.log("evt", evt)
    })
})

function createMap() {
    require([
        'esri/map',
        'esri/layers/VectorTileLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/ArcGISTiledMapServiceLayer',
        'esri/geometry/Extent',
        'esri/SpatialReference',
        'esri/InfoTemplate',
        'dojo/domReady!'
    ], function(
        Map,
        VectorTileLayer,
        FeatureLayer,
        ArcGISTiledMapServiceLayer,
        Extent,
        SpatialReference,
        InfoTemplate
    ) {

        //xmin, xmax, ymin, ymax
        var startExtent = new Extent(-8262688.480463322,
            511203.60837192694, -8233336.525747752,
            520853.15207724134,
            new SpatialReference({
                wkid: 102100
            })
        )

        var map = new Map('map', {
            //center: [-74, 4], // longitude, latitude
            //zoom: 2, // zoom factor
            extent: startExtent,
            basemap: "topo"
        })
        window.map = map

        // The URL referenced in the constructor may point to a style url JSON (as in this sample)
        // or directly to a vector tile service
        // NOT SUPPORT IN CHROME
        // var vtlayer = new VectorTileLayer('https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json')
        // map.addLayer(vtlayer)

        configBufferTool()

        map.on('load', createDrawToolbar)

        // https://developers.arcgis.com/javascript/3/jssamples/fl_ondemand.html
        map.infoWindow.resize(155, 75)

        // var fl = new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/Geodatabase_Redes_CAN/FeatureServer/0', {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //     // tileWidth: 200,
        //     // tileHeight: 200
        // })
        // window.fl = fl
        // map.addLayer(fl)
        // for (var i = 0; i <= 21; i++) {
        //   map.addLayer(new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/FeatureServer/'+i, {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //   }))
        // }

        // for (var i = 10; i <= 15; i++) {
        //   map.addLayer(new FeatureLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/ArcGIS/rest/services/IRSP_V1/FeatureServer/'+i, {
        //     mode: FeatureLayer.MODE_ONDEMAND,
        //   }))
        // }

        // map.addLayer(new ArcGISTiledMapServiceLayer('https://services7.arcgis.com/lUZlLTBKH3INlBpk/arcgis/rest/services/IRSP_V1/MapServer'))

        // https://developers.arcgis.com/javascript/3/jshelp/best_practices_feature_layers.html
        // window.mapFeatureLayers = new Array()
        // map.on('onZoomEnd', function() {
        //     window.mapMaxOffset = calcOffset()
        //     for (var i = 0; i < featureLayers.length; i++) {
        //         featureLayers[i].setMaxAllowableOffset(window.maxOffset)
        //     }
        // })
        window.mapFeatureLayerObjects = new Array()
        map.on('zoom-end', function() {
            checkVisibilityAtScale()
        })

        var servicios = window.servicios
        for (var i = 0; i < servicios.length; i++) {
            var servicio = servicios[i]
            if (servicio.enable) {
                if (servicio.serviceType === 'MapServer') {
                    var arcGISTiledMapServiceLayer = new ArcGISTiledMapServiceLayer(servicio.url)
                    map.addLayer(arcGISTiledMapServiceLayer)
                } else if (servicio.serviceType === 'FeatureServer') {

                    for (var i = 0; i < servicio.layers.length; i++) {
                        var layer = servicio.layers[i]
                        if (layer.enable) {
                            var url = servicio.url + '/' + layer.layerId
                            var infoTemplate = new InfoTemplate("${state_name}", "Population (2000):  ${pop2000:NumberFormat}")
                            var featureLayer = new FeatureLayer(url, {
                                id: layer.id,
                                mode: FeatureLayer[servicio.mode],
                                outFields: ["*"],
                                infoTemplate: infoTemplate,
                                // maxAllowableOffset: calcOffset()
                            })
                            window.mapFeatureLayerObjects.push(layer)
                            // featureLayer.setMaxScale(layer.maxScale)
                            // featureLayer.setMinScale(layer.minScale)
                            map.addLayer(featureLayer)
                        }
                    }
                }
            }
        }
        checkVisibilityAtScale()
    })
}

function configBufferTool() {
    require([
        'esri/config',
        'esri/tasks/GeometryService'
    ], function(
        esriConfig,
        GeometryService
    ) {
        window.esriConfig = esriConfig
        esriConfig.defaults.geometryService = new GeometryService('https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer')
        esriConfig.defaults.io.proxyUrl = '/arcgis/proxy.php'
        esriConfig.defaults.io.alwaysUseProxy = false
    })
}

function createDrawToolbar(themap) {
    require([
        'esri/toolbars/draw',
        'dojo/dom',
        'dojo/on'
    ], function(
        Draw,
        dom,
        on
    ) {
        window.toolbar = new Draw(map)
        toolbar.on('draw-end', addToMap)

        var boton = dom.byId('btnDrawPoint')
        var signal = on(boton, 'click', function() {
            onClickButtonToolbar(Draw, 'POINT')
        })
        var boton = dom.byId('btnDrawLine')
        var signal = on(boton, 'click', function() {
            onClickButtonToolbar(Draw, 'LINE')
        })
        var boton = dom.byId('btnDrawPoly')
        var signal = on(boton, 'click', function() {
            onClickButtonToolbar(Draw, 'POLYGON')
        })
    })
}

function addToMap(evt) {
    require([
        'esri/graphic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol'
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
            case 'point':
            case 'multipoint':
                symbol = new SimpleMarkerSymbol()
                break
            case 'polyline':
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


// Because this is such a useful idea, it is done automatically for Feature Layers hosted by ArcGIS online.
// function calcOffset() {
//     //https://developers.arcgis.com/javascript/3/jsapi/featurelayer.html#maxallowableoffset
//     console.log('map.extent.getWidth() / map.width', map.extent.getWidth() / map.width)
//     return (map.extent.getWidth() / map.width)
// }

// https://developers.arcgis.com/javascript/3/jssamples/fl_performance.html
function checkVisibilityAtScale() {
    for (var i = 0; i < window.mapFeatureLayerObjects.length; i++) {
        var scale = map.getScale()
        var layer = window.mapFeatureLayerObjects[i]
        if (scale >= layer.minScale && scale <= layer.maxScale) {
            map.getLayer(layer.id).setVisibility(true)
        } else {
            console.log('false', layer.id, scale, layer.minScale, layer.maxScale, layer.minScale >= scale, scale <= layer.maxScale)
            map.getLayer(layer.id).setVisibility(false)
        }
    }
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
        'esri/tasks/GeometryService',
        'esri/graphic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/tasks/BufferParameters',
        'esri/geometry/normalizeUtils',
        'dojo/dom'
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
        // valida parámetros
        var distance = dom.byId('buffer_distance').value
        var unit = dom.byId('buffer_unit').value
        if (distance === '') {
            displayMessage('Especifique una distancia de buffer.')
            return
        }
        if (unit === '') {
            displayMessage('Especifique una unidad de buffer.')
            return
        }

        var geometry = evtObj.geometry
        var symbol
        switch (geometry.type) {
            case 'point':
                symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([0, 255, 0, 0.25]))
                break
            case 'polyline':
                symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1)
                break
            case 'polygon':
                symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
                break
        }

        var graphic = new Graphic(geometry, symbol)
        map.graphics.add(graphic)

        //setup the buffer parameters
        var params = new BufferParameters()
        params.distances = [distance]
        params.outSpatialReference = map.spatialReference
        params.unit = GeometryService[unit]
        //normalize the geometry

        normalizeUtils.normalizeCentralMeridian([geometry]).then(function(normalizedGeometries) {
            var normalizedGeometry = normalizedGeometries[0]
            if (normalizedGeometry.type === 'polygon') {
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
        'esri/graphic',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/Color',
        'dojo/_base/array'
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

function applyBuffer(evt) {
    if (!window.currentGeometry) {
        displayMessage('Por favor dibujer primero una geometría.')
    } else {
        doBuffer({
            geometry: window.currentGeometry
        })
    }
}

function displayMessage(msj) {
    $('#message-modal1').html(msj)
    $('#modal1').modal('open')
}

function printMap(evt) {
    require([
        'esri/tasks/PrintTask',
        'esri/tasks/PrintParameters',
        'esri/tasks/PrintTemplate'
    ], function(
        PrintTask,
        PrintParameters,
        PrintTemplate
    ) {
        var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
        var printTask = new PrintTask(url)

        var template = new PrintTemplate()
        template.exportOptions = {
            width: 500,
            height: 400,
            dpi: 96
        }
        template.format = 'PNG32'
        template.layout = 'MAP_ONLY'
        template.preserveScale = false

        var params = new PrintParameters()
        params.map = map
        params.template = template

        printTask.execute(params, function(response) {
            console.log(response.url)
            var urlImagen = response.url
            var urlWebService = 'http://192.168.69.69:5000/reporte/pdf?url_imagen=' + urlImagen
            window.open(urlWebService, '_blank')
        })
    })
}

var map
var toolbar
var esriConfig
var servicios
var navToolbar

require(['dojo/request/xhr'], function(xhr) {
    xhr('conf/servicios.json', {
        handleAs: 'json'
    }).then(function(data) {
        // Do something with the handled data
        window.servicios = data
        createMap()
    }, function(err) {
        // Handle the error condition
        console.log('err', err)
    }, function(evt) {
        // Handle a progress event from the request if the
        // browser supports XHR2
        console.log('Browser supports XHR2', 'evt', evt)
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
        'esri/dijit/Scalebar',
        'esri/toolbars/navigation',
        'dojo/domReady!'
    ], function(
        Map,
        VectorTileLayer,
        FeatureLayer,
        ArcGISTiledMapServiceLayer,
        Extent,
        SpatialReference,
        InfoTemplate,
        Scalebar,
        Navigation
    ) {

        //xmin, xmax, ymin, ymax
        var startExtent = new Extent(-8247776.0260493355,
            513403.24603438814, -8244107.048691551,
            515206.682170539,
            new SpatialReference({
                wkid: 102100
            })
        )

        var map = new Map('map', {
            //center: [-74, 4], // longitude, latitude
            //zoom: 2, // zoom factor
            extent: startExtent,
            basemap: 'topo'
        })
        window.map = map
        navToolbar = new Navigation(map)

        // The URL referenced in the constructor may point to a style url JSON (as in this sample)
        // or directly to a vector tile service
        // NOT SUPPORT IN CHROME
        // var vtlayer = new VectorTileLayer('https://www.arcgis.com/sharing/rest/content/items/bf79e422e9454565ae0cbe9553cf6471/resources/styles/root.json')
        // map.addLayer(vtlayer)

        configBufferTool()

        map.on('load', createDrawToolbar)

        // https://developers.arcgis.com/javascript/3/jssamples/fl_ondemand.html
        map.infoWindow.resize(400, 200)

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

        var scalebar = new Scalebar({
            map: map,
            // "dual" displays both miles and kilometers
            // "english" is the default, which displays miles
            // use "metric" for kilometers
            scalebarUnit: 'dual'
        })

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

                            var infoTemplate = new InfoTemplate()
                            infoTemplate.setTitle(layer.name)
                            var content = generateTemplateContent(layer)
                            infoTemplate.setContent(content)

                            var featureLayer = new FeatureLayer(url, {
                                id: layer.id,
                                mode: FeatureLayer[servicio.mode],
                                outFields: ['*'],
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
        //add the legend
        createLeyend()
        createTOC()
        createMeasurement()
    })
}

function generateTemplateContent(layer) {
    var content = ''
    console.log(layer)
    //console.log(typeof(layer.fields), layer.fields.length)
    if (typeof(layer.fields) === 'undefined' || layer.fields.length === 0) {
        // var capa = map.getLayer(layer.id)
        // var fields = capa.fields
        // for (var i = 0; i < fields.length; i++) {
        //     var field = fields[i]
        //     //if(typeof(noFields) === "undefined" || noFields.indexof(field.alias) < 0 ){
        //       content += '<b>' + field.alias + ':<b> ${' + field.alias + '}'
        //     //}
        // }
    } else {
        for (var i = 0; i < layer.fields.length; i++) {
            var field = layer.fields[i]
            content += '<b>' + field.alias + ':</b> ${' + field.name + '} <br/>'
        }
        console.log(content)
    }
    return content
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

function createLeyend() {
    require([
        'dojo/_base/array',
        'esri/dijit/Legend'
    ], function(
        arrayUtils,
        Legend
    ) {
        var layerInfo = arrayUtils.map(window.mapFeatureLayerObjects, function(layer, index) {
            return {
                layer: map.getLayer(layer.id),
                title: layer.name
            }
        })
        console.log('layerInfo', layerInfo)
        if (layerInfo.length > 0) {
            var legendDijit = new Legend({
                map: map,
                layerInfos: layerInfo
            }, 'legendDiv')
            legendDijit.startup()
        }
    })
}

function createMeasurement() {
    require([
        'dojo/dom',
        'esri/SnappingManager',
        'esri/dijit/Measurement',
        'esri/sniff',
        'dojo/keys',
        'dojo/parser'
    ], function(
        dom,
        SnappingManager,
        Measurement,
        has,
        keys
        //parser
    ) {
        //parser.parse()
        //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac., but has wrong code for Chrome on Mac
        var snapManager = map.enableSnapping({
            snapKey: has("mac") ? keys.META : keys.CTRL
        });

        var measurement = new Measurement({
            map: map
        }, dom.byId("measurementDiv"))
        measurement.startup()
    })
}

function createTOC() {
    require([
        'dojo/dom'
    ], function(
        dom
    ) {
        var ul = dom.byId('toc-ul')
        for (var i = 0; i < window.mapFeatureLayerObjects.length; i++) {
            var layer = window.mapFeatureLayerObjects[i]
            var imageUrl = (typeof(layer.icon) === 'undefined' || layer.icon === '') ? 'css/img/acueducto.png' : layer.icon
            var li = '\
            <li class="collection-item avatar">\
                <img src="' + imageUrl + '" alt="" class="circle">\
                <span class="title" style="padding-right: 22px; display: block;">' + layer.name + '</span>\
                <p>Desde escala 1:' + layer.maxScale + '</p>\
                <a href="#!" onclick="changeVisibilityLayer(this,\'' + layer.id + '\')" class="secondary-content">\
                    <i class="material-icons btnEye">visibility</i>\
                </a>\
            </li>'
            ul.innerHTML = ul.innerHTML + li
        }
    })
}

function changeVisibilityLayer(elem, layerId) {
    require([
        'dojo/query',
        'dojo/dom'
    ], function(
        query,
        dom
    ) {
        if (typeof(elem.estado) === 'undefined') {
            elem.estado = true
        }
        var layer = map.getLayer(layerId)
        var i = query('.material-icons', elem)[0]
        if (elem.estado) {
            layer.setVisibility(false)
            i.innerHTML = 'visibility_off'
        } else {
            layer.setVisibility(true)
            i.innerHTML = 'visibility'
        }
        elem.estado = !elem.estado

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
    document.getElementById('loading-report').style.display = 'block'
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
            var imageUrl = response.url
            window.generateReports(1, {
                imageUrl: imageUrl
            })
        })
    })
}

function changeNavpane(button, opt) {
    map.infoWindow.unsetMap()

    var btnFloatings = $('.btn-floating')
    btnFloatings.each(function(index) {
        $(this).removeClass('red')
        $(this).addClass('teal')
    })

    var button = $(button)
    button.removeClass('teal')
    button.addClass('red')

    // console.log('button', button)
    // if (button.hasClass('teal')) {
    //     button.removeClass('teal')
    //     button.addClass('red')
    // } else {
    //     button.removeClass('red')
    //     button.addClass('teal')
    // }

    var navpane = $('#navpane')
    if (navpane.css('display') === 'none') {
        navpane.css('display', 'block')
    } else {
        navpane.css('display', 'none')
        button.removeClass('red')
        button.addClass('teal')
        return
    }

    var divs = $('#navpane > div')
    divs.each(function(index) {
        $(this).css('display', 'none')
    })
    var ele = $('#' + opt)
    if (opt === 'pane-medicion') {
        ele.css('display', 'block')
    }
}

function generateReports(reportNumber, opt) {
    if (!window.currentGeometry) {
        displayMessage('Por favor dibujer primero una geometría.')
        return
    } else {
        //window.currentGeometry = undefined
    }
    loadingIcon(true, 'Lanzando Reporte...')
    require(['dojo/request/xhr'], function(xhr) {
        if (reportNumber === 1) {
            getRedesAfectadas(function(results) {
                xhr('templates/reporte1.html').then(function(html) {
                    generateQuickReport1(html, results, opt)
                })
            })
        }
    })
}

function generateReport1() {
    if (!window.currentGeometry) {
        displayMessage('Por favor dibujer primero una geometría.')
        return
    } else {
        //window.currentGeometry = undefined
    }
    loadingIcon(true, 'Generando Imagen...')
    printMap(function(imageUrl) {
        window.generateReports(1, {
            imageUrl: imageUrl
        })
    })
}

function generateQuickReport1(html, results, opt) {
    loadingIcon(false, 'Terminado...')
    var viewData = {
        name: 'Jonny',
        occupation: 'GLUD',
        imageUrl: opt.imageUrl,
        imageexist: (opt.imageUrl !== undefined),
        baseUrl: window.location.origin,
        resultado: results
    }
    console.log(viewData)
    var output = Mustache.render(html, viewData)
    console.log(output)

    var w = window.open('about:blank', '_blank')
    w.document.write(output)
    //w.print()
    //w.onfocus=function(){ w.alert('El reporte ha sido generado exitósamente.') }
    setTimeout(function() {
        w.stop()
    }, 3000)
    //w.document.body.innerHTML = output
}

function loadingIcon(activate, message) {
    document.getElementById('loading-report-message').innerHTML = message
    setTimeout(function() {
        if (activate) {
            document.getElementById('loading-report').style.display = 'block'
        } else {
            document.getElementById('loading-report').style.display = 'none'
        }
    }, 200)
}


function printMap(listener) {
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
            listener(imageUrl)
        })
    })
}

function getRedesAfectadas(listener) {
    var resultados = [{
        'capa': 'nombre de capa 1',
        'entidades': [{
            'nombre': 'hi'
        }, {
            'nombre': 'hi2  '
        }]
    }, {
        'capa': 'nombre de capa 2',
        'entidades': [{
            'nombre': 'hello'
        }, {
            'nombre': 'hello2  '
        }]
    }]
    listener(resultados)
}

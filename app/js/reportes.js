function generateReports(reportNumber, opt) {
    require(['dojo/request/xhr'], function(xhr) {
        if (reportNumber === 1) {
            xhr('templates/reporte1.html').then(function(data) {
                generateReport1(data, opt)
            })
        }
    })
}

function generateReport1(data, opt) {
    document.getElementById('loading-report').style.display = 'none'
    var viewData = {
        name: 'Jonny',
        occupation: 'GLUD',
        imageUrl: opt.imageUrl,
        baseUrl: window.location.origin
    }
    console.log(viewData)
    var output = Mustache.render(data, viewData)
    console.log(output)

    var w = window.open('about:blank', '_blank')
    w.document.write(output)
    //w.document.body.innerHTML = output
}

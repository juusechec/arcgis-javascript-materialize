function generateReports(reportNumber, opt) {
    require(['dojo/request/xhr'], function(xhr) {
        xhr('templates/report1.html').then(function(data) {
            if (reportNumber === 1) {
                generateReport1(data, opt)
            }
        })
    })
}

function generateReport1(data, opt) {
    document.getElementById('loading-report').style.display = 'none'
    var viewData = {
        name: 'Jonny',
        occupation: 'GLUD',
        imageUrl: opt.imageUrl,
        prueba: 'httphola.png',
        prueba2: 'http:',
        prueba3: 'http://'
    }
    console.log(viewData)
    var output = Mustache.render(data, viewData)
    console.log(output)

    var w = window.open('', '_blank')
    w.document.body.innerHTML = output
}

function generateReports(reportNumber, opt) {
  require(['dojo/request/xhr'], function(xhr) {
      xhr('templates/report1.html').then(function(data) {
        if(reportNumber === 1){
          generateReport1(data, opt)
        }
      })
  })
}

function generateReport1(data, opt){
  console.log(opt.imageUrl)
  document.getElementById('loading-report').style.display = 'none'
  var viewData = {
      name: 'Jonny',
      occupation: 'GLUD',
      imageUrl: opt.imageUrl
  }
  var output = Mustache.render(data, viewData)
  console.log(output)

  var w = window.open()
  w.document.body.innerHTML = output
}

function generateReports(){

}

function reemplazarVariables(respuestaHTML, diccionario, listener) {
    var htmlParseado = respuestaHTML
    for (var i in diccionario) {
        var expresionRegular = new RegExp('{{' + i + '}}', 'g')
        htmlParseado = htmlParseado.replace(expresionRegular, diccionario[i]);
    }
    listener(htmlParseado)
}

function generateReports() {
    var diccionario = {
        'A': A,
        'B': B,
        'num1': num1,
        'F2': f2,
        'raiz1': raices[0],
        'raiz2': raices[1],
        'c1': ValorCoef[0],
        'c2': ValorCoef[1],
        'exp': exp,

    }

}

function reemplazarVariables(respuestaHTML, diccionario, listener) {
    var htmlParseado = respuestaHTML
    for (var i in diccionario) {
        //var expresionRegular = new RegExp('{{' + i + '}}', 'g')
        //htmlParseado = htmlParseado.replace(expresionRegular, diccionario[i]);
    }
    listener(htmlParseado)
}

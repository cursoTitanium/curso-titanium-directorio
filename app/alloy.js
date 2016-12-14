/**
 * alloy.js
 * @description Fichero de declaración de funciones y variables globales
 */

//##ALLOY.JS
//### Fichero de declaración global
//En este fichero declararemos todas aquellas funciones y variables que queramos
//utilizar en cualquier punto de la aplicación


var RUTA_DB = "/db/users";
var NOMBRE_DB = "users";
var primerArranque = Ti.App.Properties.getBool("primerArranque", true);
var db;

//Vamos a realizar la instalación de la DB en el primer arranque de la app
if (primerArranque) {
    Ti.App.Properties.setBool("primerArranque", false);
    //Instalamos DB, en caso de existir la abrimos
    db = Ti.Database.install(RUTA_DB, NOMBRE_DB);
    db.close();
}

/**
 * convertirPrimeraMayuscula
 * @description Convierte la primera letra de un string en mayúscula
 * @param {String} cadena
 * @return {String}
 */
Alloy.Globals.convertirPrimeraMayuscula = function(cadena) {
    //Esta función de ayuda revuelve una palabra con su primera letra en mayúscula
    return cadena.charAt(0).toUpperCase() + cadena.substring(1);
};

// Creamos una referencia global al widget loader
// Podremos utilizarlo en cualquier punto de la app con su interfaz:
// Alloy.Globals.loader.show([message]);
// Alloy.Globals.loader.hide();
Alloy.Globals.loader = Alloy.createWidget('com.caffeinalab.titanium.loader', {
    message: L("cargando", "Cargando"),
    cancelable: true,
    useImages: false
});

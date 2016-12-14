/**
 * alloy.js
 * @description Fichero de declaración de funciones y variables globales
 */

 //Instalamos DB, en caso de existir la abrimos
 var RUTA_DB = "/db/users";
 var NOMBRE_DB = "users";
 var primerArranque = Ti.App.Properties.getBool("primerArranque", true);
 var db;

 if(primerArranque){
	 Ti.App.Properties.setBool("primerArranque", false);
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
	return cadena.charAt(0).toUpperCase() + cadena.substring(1);
};

// Creamos una referencia global al widget loader
Alloy.Globals.loader = Alloy.createWidget('com.caffeinalab.titanium.loader', {
    message: L("cargando", "Cargando"),
    cancelable: true,
    useImages: false
});

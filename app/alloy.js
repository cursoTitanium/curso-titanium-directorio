/**
 * alloy.js
 * @description Fichero de declaración de funciones y variables globales
 */

/**
 * convertirPrimeraMayuscula
 * @description Convierte la primera letra de un string en mayúscula
 * @param {String} cadena
 * @return {String}
 */
Alloy.Globals.convertirPrimeraMayuscula = function(cadena) {
	return cadena.charAt(0).toUpperCase() + cadena.substring(1);
};
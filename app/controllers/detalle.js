/**
 * Controlador detalle de aplicación
 * @author Jorge Macías García
 * @version 1.0
 */

//# DETALLE.JS
//## Controlador detalle de la aplicación

//Este controlador se encarga de mostrar los datos de un usuario
//permitiendo llamarle por telefono, accediendo a su localización y enviarle un email

//Recogemos los parámetros que vienen de index.js
var args = $.args,
    usuario = args.usuario || {};

//Añadimos listener evento close
$.addListener($.win, "close", limpiarControlador);

//Añadimos listener a los botones de la barra inferior de acciones
$.addListener($.accionLlamar, "click", accionLlamar);
$.addListener($.accionMapa, "click", accionMapa);
$.addListener($.accionEmail, "click", accionEmail);

//Establecemos datos de usuario en pantalla
$.foto.setImage(usuario.foto);
$.nombre.setText(usuario.nombre);
$.usuario.setText(usuario.usuario);
$.telefono.setText(usuario.telefono);
$.email.setText(usuario.email);
$.direccion.setText(usuario.direccion);

/**
 * accionLlamar
 * @description Abrimos la aplicación de llamadas
 */
function accionLlamar(e){
  //Utilizamos la función openURL para ejecutar el esquema de telefono
  var result = Ti.Platform.openURL("tel:"+usuario.telefono);

  //Si no ha tenido éxito la operación informamos que el dispositivo no puede
  //realizar llamadas.
  if(!result){
    alert("Este dispositivo no puede hacer llamadas");
  }
}

/**
 * accionEmail
 * @description Abrimos la aplicación de email
 */
function accionEmail(e){
  //Utilizamos la función openURL para ejecutar el esquema de envío de email
	var result = Ti.Platform.openURL("mailto:"+usuario.email);

  //Si no ha tenido éxito la operación informamos que el dispositivo no tiene
  //una aplicación para enviar emails
  if(!result){
    alert("Este dispositivo no tiene una aplicación instalada que permita enviar emails");
  }
}

/**
 * accionMapa
 * @description Abrimos la aplicación de mapa
 */
function accionMapa(e){

	var city, result;

  //Codificamos la dirección para enviarlo como parámetro de url
	city = encodeURIComponent(usuario.direccion);

  //Utilizamos la función openURL para ejecutar el esquema de mapas
	result = Ti.Platform.openURL("geo:0,0?q=" + city);

  //Si no ha tenido éxito la operación informamos que el dispositivo no tiene
  //una aplicación para visualizar el mapa y abrimos el navegador
	if(!result){
		Ti.Platform.openURL("https://www.google.com/maps?q=" + city);
	}
}

/**
 * close
 * @description Cierra la ventana
 * @param {Object} e
 */
function close(e) {
  //Cerramos la ventana
	$.win.close();
}

/**
 * limpiarControlador
 * @description Liberamos memoria y eliminamos eventos
 */
function limpiarControlador() {
  //Para liberar memoria realizamos las siguientes operaciones
	args = null;
	usuarios = null;
  //Eliminamos todos los listeners del controlador
	$.removeListener();
}

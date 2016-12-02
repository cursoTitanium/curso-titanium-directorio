//Recogemos los parámetros que nos pasa index.js
var args = $.args,
    usuario = args.usuario || {};

//Añadimos listener evento close
$.addListener($.win, "close", limpiarControlador);

//Añadimos listener a los botones de la barra inferior de acciones
$.addListener($.accionLlamar, "click", accionLlamar);
$.addListener($.accionMapa, "click", accionMapa);
$.addListener($.accionEmail, "click", accionEmail);

//Establecemos datos de usuario en pantalla
$.foto.setImage(usuario.picture.large);
$.nombre.setText(prepararNombre(usuario.name));
$.usuario.setText("@" + usuario.login.username);
$.telefono.setText(usuario.cell);
$.email.setText(usuario.email);
$.direccion.setText(Alloy.Globals.convertirPrimeraMayuscula(usuario.location.city));

/**
 * accionLlamar
 * @description Abrimos la aplicación de llamadas
 */
function accionLlamar(e){
	Ti.Platform.openURL("tel:"+usuario.cell);
}

/**
 * accionEmail
 * @description Abrimos la aplicación de email
 */
function accionEmail(e){
	Ti.Platform.openURL("mailto:"+usuario.email);
}

/**
 * accionMapa
 * @description Abrimos la aplicación de mapa
 */
function accionMapa(e){
	var result = Ti.Platform.openURL("geo:0,0?q=" + encodeURIComponent(usuario.location.city));
	
	//No tenemos una aplicación que abra este esquema de url
	if(!result){
		Ti.Platform.openURL("https://www.google.com/maps?q=" + encodeURIComponent(usuario.location.city));
	}
}

/**
 * accionLlamar
 * @description Abrimos la aplicación de llamadas
 */
function accionLlamar(e){
	Ti.Platform.openURL("tel:"+usuario.cell);
}

/**
 * close
 * @description Cierra la ventana
 * @param {Object} e
 */
function close(e) {
	$.win.close();
}

/**
 * prepararNombre
 * @description Prepara el nombre para visualizarlo en pantalla
 * @param {Object} nombre
 * @return {String}
 */
function prepararNombre(nombre) {
	return Alloy.Globals.convertirPrimeraMayuscula(nombre.first) + " " + Alloy.Globals.convertirPrimeraMayuscula(nombre.last);
}

/**
 * limpiarControlador
 * @description Liberamos memoria y eliminamos eventos
 */
function limpiarControlador() {
	args = null;
	usuarios = null;
	$.removeListener();
}

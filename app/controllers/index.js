/**
 * Controlador maestro de aplicación
 * @author Jorge Macías García
 * @version 1.0
 */

//Añadimos listener a la lista. Escuchamos los clicks sobre sus elementos
$.addListener($.list, "itemclick", abrirDetalle);

//Establecemos la lista de ListItems
$.section.setItems(Alloy.Globals.userList.map(prepararListaDeUsuarios));

//Abrimos ventana
$.index.open(); 

/**
 * abrirDetalle
 * @description Abrimos el controlador de detalle para un usuario
 * @param {Object} e Evento de callback
 */
function abrirDetalle(e) {
	//Recogemos el elemento sobre el que hemos hecho click
	var usuario = e.section.getItemAt(e.itemIndex).properties.usuario;

	//Abrimos controlador detalle con información del usuario
	Alloy.createController("detalle", {
		usuario : usuario
	}).getView().open();
}

/**
 * abrirAcercaDe
 * @description Abrimos ventana modal con información sobre la aplicación
 * @param {Object} e
 */
function abrirAcercaDe(e){
	//Alloy.createController("acercaDe").getView().open();
	Ti.UI.createAlertDialog({
		title: L("acercaDe"),
		message: Ti.App.name,
		ok: L("close")
	}).show();
}

/**
 * prepararListaDeUsuarios
 * @description Devuelve un ListItem
 * @param {Object} usuario
 */
function prepararListaDeUsuarios(usuario) {

	var nombre = prepararNombre(usuario.name);

	return {
		properties : {
			usuario : usuario,
			searchableText: nombre
		},
		foto : {
			image : usuario.picture.large
		},
		titulo : {
			text : nombre
		},
		template : "row"
	};
}

/**
 * prepararNombre
 * @description Prepara el nombre para visualizarlo en lista
 * @param {Object} nombre
 * @return {String}
 */
function prepararNombre(nombre) {
	return Alloy.Globals.convertirPrimeraMayuscula(nombre.first) + " " + Alloy.Globals.convertirPrimeraMayuscula(nombre.last);
}
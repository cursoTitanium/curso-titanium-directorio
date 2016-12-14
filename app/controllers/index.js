/**
 * Controlador maestro de aplicación
 * @author Jorge Macías García
 * @version 1.0
 */

var url = "https://randomuser.me/api/?format=json&results=50";

//Añadimos listener a la ventana. Escuchamos el evento open para recuperar datos
$.addListener($.index, "open", recuperarDatos);

//Añadimos listener a la lista. Escuchamos los clicks sobre sus elementos
$.addListener($.list, "itemclick", abrirDetalle);

//Abrimos ventana
$.index.open();

/**
 * recuperarDatos
 * @description Recuperamos datos del servidor
 * @param {Object} e Evento de callback
 */
function recuperarDatos(e) {
	//Creamos httpClient
	var httpClient = Ti.Network.createHTTPClient({
		timeout : 5000,
		onload : success,
		onerror : error
	});

	//Abrimos conexión
	httpClient.open("GET", url);

	//Solicitamos datos
	httpClient.send();
}

/**
 * success
 * @description Callback exito httpClient
 * @param {Object} e
 */
function success(e) {

	var usuarios = JSON.parse(this.getResponseText()).results;

	procesarUsuarios(usuarios);
}

/**
 * error
 * @description Callback error httpClient
 * @param {Object} e
 */
function error(e) {
	alert(JSON.stringify(e.error));
}

function procesarUsuarios(usuarios) {

	var db,
	    query;

	//Instalamos DB, en caso de existir la abrimos
	if(Ti.Filesystem.isExternalStoragePresent){
		db = Ti.Database.install("/db/users", Ti.Filesystem.externalStorageDirectory + 'db' + Ti.Filesystem.separator + "usuarios");	
	}else{
		db = Ti.Database.install("/db/users", "usuarios");
	}
	

	//Preparamos query
	query = "INSERT INTO USUARIOS (nombre, usuario, foto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?);";

	//Iniciamos transacción
	db.execute("BEGIN");

	//Iteramos usuarios
	usuarios.forEach(function(usuario) {
		db.execute(query, prepararNombre(usuario.name), "@" + usuario.login.username, usuario.picture.large, usuario.cell, usuario.email, Alloy.Globals.convertirPrimeraMayuscula(usuario.location.city));
	});

	//Commit en DB
	db.execute("COMMIT");

	//Cerramos conexión
	db.close();

	mostrarUsuarios();
}

function mostrarUsuarios() {
	var db,
	    query,
	    resultSet,
	    items;

	items = [];
	query = "SELECT * FROM USUARIOS";

	//Abrimos DB
	if(Ti.Filesystem.isExternalStoragePresent){
		db = Ti.Database.open(Ti.Filesystem.externalStorageDirectory + "db" + 'path' + Ti.Filesystem.separator + "usuarios");	
	}else{
		db = Ti.Database.open("usuarios");
	}

	//Ejecutamos query
	resultSet = db.execute(query);
console.log(resultSet.rowCount);
	//Si hay elementos
	if (resultSet.rowCount) {
		//Iteramos
		while (resultSet.isValidRow()) {
			items.push(prepararListaDeUsuarios(resultSet));
			resultSet.next();
		}
	} else {
		items.push(prepararListaDeUsuarios());
	}

	//Establecemos elementos en la lista
	$.section.setItems(items);

	//Cerramos resultSet y conexión con la DB
	resultSet.close();
	db.close();
}

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
function abrirAcercaDe(e) {
	Ti.UI.createAlertDialog({
		title : L("acercaDe"),
		message : Ti.App.name,
		ok : L("cerrar")
	}).show();
}

/**
 * prepararListaDeUsuarios
 * @description Devuelve un ListItem
 * @param {Object} registro ResultSet
 */
function prepararListaDeUsuarios(registro) {

	var listItem,
	    usuario;

	var listItem = {
		properties : {
			width : Ti.UI.FILL,
			height : 48,
			title : "No hay elementos que mostrar",
			color : "black"
		}
	};

	if (registro) {

		usuario = {
			id : registro.fieldByName("id"),
			nombre : registro.fieldByName("nombre"),
			usuario : registro.fieldByName("usuario"),
			foto : registro.fieldByName("foto"),
			telefono : registro.fieldByName("telefono"),
			email : registro.fieldByName("email"),
			direccion : registro.fieldByName("direccion")
		};

		listItem = {
			properties : {
				usuario : usuario,
				searchableText : usuario.nombre
			},
			foto : {
				image : usuario.foto
			},
			titulo : {
				text : usuario.nombre
			},
			template : "row"
		};
	}

	return listItem;
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
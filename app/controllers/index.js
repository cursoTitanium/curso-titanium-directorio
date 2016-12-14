/**
 * Controlador maestro de aplicación
 * @author Jorge Macías García
 * @version 1.0
 */

var TIEMPO_CACHE, NUMERO_USUARIOS, CLAVE_CACHE, RUTA_DB, NOMBRE_DB;

TIEMPO_CACHE = 60; //En segundos, 5 minutos
NUMERO_USUARIOS = 50; //Parámetro de url
CLAVE_CACHE = "CACHE_TTL"; //Clave de acceso a Properties
RUTA_DB = "/db/users"; //Ruta a base de datos en assets
NOMBRE_DB = "users";

//Añadimos listener a la ventana. Escuchamos el evento open para lanzar el proceso
$.addListener($.win, "open", comprobarCache);

//Añadimos listener a la lista. Escuchamos los clicks sobre sus elementos
$.addListener($.list, "itemclick", abrirDetalle);

//Abrimos ventana
$.win.open();

/**
 * Comprueba la caché de la aplicación o recupera datos
 * @param  {Object} e
 */
function comprobarCache(e) {

    if (esCacheExpirada()) {
        recuperarDatos();
    } else {
        mostrarUsuarios();
    }
}

/**
 * actualizarDatos
 * @description Reset de DB y nueva llamada htp
 * @param  {Object} e
 */
function actualizarDatos(e) {
    //Recuperamos datos
    recuperarDatos();
}

/**
 * Comprueba si la caché ha expirado
 * @return {Boolean} expirada
 */
function esCacheExpirada() {
    var cacheTTL, ahora, expirada;

    expirada = false;
    cacheTTL = Ti.App.Properties.getDouble(CLAVE_CACHE);
    ahora = new Date().getTime();

    if (!cacheTTL || ahora > cacheTTL) {
        expirada = true;
    }

    return expirada;
}

/**
 * Establece un nuevo tiempo de caché
 * @param  {Number} cacheTTL Tiempo en milisegundos de la proxima expiración de caché
 */
function establecerTiempoDeCache(cacheTTL) {
    Ti.App.Properties.setDouble(CLAVE_CACHE, cacheTTL);
}

/**
 * recuperarDatos
 * @description Recuperamos datos del servidor
 */
function recuperarDatos() {

    var url, httpClient;

    url = "https://randomuser.me/api/?format=json&results=" + NUMERO_USUARIOS;

    //Mostramos loader
    Alloy.Globals.loader.show();

    //Creamos httpClient
    httpClient = Ti.Network.createHTTPClient({
        timeout: 5000,
        onload: success,
        onerror: error
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
    mostrarUsuarios();
}

/**
 * procesarUsuarios
 * Procesamiento de usuario tras obtenerlos del servidor remoto
 * @param  {Object} usuarios Lista de usuarios remota
 */
function procesarUsuarios(usuarios) {

    var db,
        query;

    //Abrimos db
    db = Ti.Database.open(NOMBRE_DB);

    vaciarDatos(db);

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

    //Establecemos nuevo tiempo de caché
    establecerTiempoDeCache((new Date().getTime()) + (TIEMPO_CACHE * 1000));

    //Mostramos usuarios
    mostrarUsuarios();
}

function vaciarDatos(db) {
    var resultSet = db.execute("SELECT * FROM USUARIOS;");

    if (resultSet.rowCount) {
        db.execute("DELETE FROM USUARIOS;");
        db.execute("VACUUM;");
    }
}

/**
 * mostrarUsuarios
 * Mostramos los usuarios en la lista
 */
function mostrarUsuarios() {
    var db,
        query,
        resultSet,
        items;

    items = [];
    query = "SELECT * FROM USUARIOS";

    //Abrimos DB
    db = Ti.Database.open(NOMBRE_DB);

    //Ejecutamos query
    resultSet = db.execute(query);

    //Si hay elementos
    if (resultSet.rowCount) {
        //Iteramos
        while (resultSet.isValidRow()) {
            items.push(prepararListaDeUsuarios(resultSet));
            resultSet.next();
        }
    } else {
        //Si no hay elementos cargamos ListItem personalizado
        items.push(prepararListaDeUsuarios());
    }

    //Establecemos elementos en la lista
    $.section.setItems(items);

    //Cerramos resultSet y conexión con la DB
    resultSet.close();
    db.close();

    //Ocultamos loader
    Alloy.Globals.loader.hide();
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
        usuario: usuario
    }).getView().open();
}

/**
 * abrirAcercaDe
 * @description Abrimos ventana modal con información sobre la aplicación
 * @param {Object} e
 */
function abrirAcercaDe(e) {

    //Creamos dialogo personalizado
    Ti.UI.createAlertDialog({
        title: L("acercaDe"),
        message: Ti.App.name,
        ok: L("cerrar")
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

    //Preparamos ListItem por si no hay nada en la DB
    listItem = {
        properties: {
            width: Ti.UI.FILL,
            height: 48,
            title: "No hay elementos que mostrar",
            color: "black"
        }
    };

    //Si hay registro de entrada recuperamos campos
    if (registro) {

        usuario = {
            id: registro.fieldByName("id"),
            nombre: registro.fieldByName("nombre"),
            usuario: registro.fieldByName("usuario"),
            foto: registro.fieldByName("foto"),
            telefono: registro.fieldByName("telefono"),
            email: registro.fieldByName("email"),
            direccion: registro.fieldByName("direccion")
        };

        //Preparamos ListItem de registro de entrada
        listItem = {
            properties: {
                usuario: usuario,
                searchableText: usuario.nombre
            },
            foto: {
                image: usuario.foto
            },
            titulo: {
                text: usuario.nombre
            },
            template: "row"
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
    //Utilizando la función global convertirPrimeraMayuscula formateamos el nombre del usuario
    return Alloy.Globals.convertirPrimeraMayuscula(nombre.first) + " " + Alloy.Globals.convertirPrimeraMayuscula(nombre.last);
}

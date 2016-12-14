/**
 * Controlador maestro de aplicación
 * @author Jorge Macías García
 * @version 1.0
 */

//##INDEX.JS
//### Controlador inicial de la aplicación

//Este controlador se encarga de obtener una serie de datos remotos
//procesarlos e insertarlos en una base de datos.

//También implementa un sistema de caché con un tiempo de vida máximo

var TIEMPO_CACHE, NUMERO_USUARIOS, CLAVE_CACHE, RUTA_DB, NOMBRE_DB;

//En segundos, 1 minuto
TIEMPO_CACHE = 60;

//Parámetro de url indicando el número de usuarios que queremos recuperar
NUMERO_USUARIOS = 50;

//Clave de acceso a Properties
CLAVE_CACHE = "CACHE_TTL";

//Ruta a base de datos en assets
RUTA_DB = "/db/users";
//Nombre de la base de datos
NOMBRE_DB = "users";

//Añadimos listener a la ventana. Escuchamos el evento open para lanzar el proceso
$.addListener($.win, "open", comprobarCache);

//Añadimos listener a la lista. Escuchamos los clicks sobre sus elementos
$.addListener($.list, "itemclick", abrirDetalle);

//Abrimos ventana
$.win.open();

/**
 * comprobarCache
 * @description Comprueba la caché de la aplicación o recupera datos
 * @param  {Object} e
 */
function comprobarCache(e) {
    //Si la caché ha expirado
    if (esCacheExpirada()) {
        //Procedemos a hacer la llamada http
        recuperarDatos();
    } else {
        //Recuperamos datos de la DB y mostramos lista
        mostrarUsuarios();
    }
}

/**
 * actualizarDatos
 * @description Reset de DB y nueva llamada htp
 * @param  {Object} e
 */
function actualizarDatos(e) {
    //Esta función fuerza el reset de la DB y volvemos
    // a pedir datos del servidor remoto
    recuperarDatos();
}

/**
 * esCacheExpirada
 * @description Comprueba si la caché ha expirado
 * @return {Boolean} expirada
 */
function esCacheExpirada() {
    var cacheTTL, ahora, expirada;

    expirada = false;

    //Recuperamos valor del tiempo de vida de la memoria Properties
    cacheTTL = Ti.App.Properties.getDouble(CLAVE_CACHE);

    //Obtenemos el tiempo en formato UNIX Time
    ahora = new Date().getTime();

    //Si no hay tiempo de vida o ha caducado expiramos caché
    if (!cacheTTL || ahora > cacheTTL) {
        expirada = true;
    }

    return expirada;
}

/**
 * establecerTiempoDeCache
 * @description Establece un nuevo tiempo de caché
 * @param  {Number} cacheTTL Tiempo en milisegundos de la proxima expiración de caché
 */
function establecerTiempoDeCache(cacheTTL) {
    //Guardamos en memoria Properties el valor del tiempo de vida máximo de nuestra caché
    Ti.App.Properties.setDouble(CLAVE_CACHE, cacheTTL);
}

/**
 * recuperarDatos
 * @description Recuperamos datos del servidor
 */
function recuperarDatos() {

    var url, httpClient;

    //URL desde donde descargaremos los datos
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

    //Obtenemos la respuesta en formato texto y la transformamos en un objeto
    var usuarios = JSON.parse(this.getResponseText()).results;

    //Procedemos a tratar los datos remotos
    procesarUsuarios(usuarios);
}

/**
 * error
 * @description Callback error httpClient
 * @param {Object} e
 */
function error(e) {
    //Si no hemos recuperado nada del servidor remoto, mostramos lo que tengamos en la DB,
    //si no hay nada mostraremos una lista vacía
    mostrarUsuarios();
}

/**
 * procesarUsuarios
 * @description Procesamiento de usuario tras obtenerlos del servidor remoto
 * @param  {Object} usuarios Lista de usuarios remota
 */
function procesarUsuarios(usuarios) {

    var db,
        query;

    //Abrimos conexión con la DB
    db = Ti.Database.open(NOMBRE_DB);

    //Como venimos de una llamada HTTP vamos a vaciar la DB al estar caducada
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

/**
 * vaciarDatos
 * @description Vacía la tabla usuarios de la DB
 * @param  {Object} db Ti.Database.DB
 */
function vaciarDatos(db) {
    //Obtenemos un resultSet de la DB
    var resultSet = db.execute("SELECT * FROM USUARIOS;");

    //Si hay registros, vaciamos tabla
    if (resultSet.rowCount) {
        db.execute("DELETE FROM USUARIOS;");
        db.execute("VACUUM;");
    }
}

/**
 * mostrarUsuarios
 * @description Mostramos los usuarios en la lista
 */
function mostrarUsuarios() {
    var db,
        query,
        resultSet,
        items;

    items = [];
    //Preparamos query a la DB
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

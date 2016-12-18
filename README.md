# Aplicación Directorio de Personas
## Proyecto del Curso Básico de Titanium.
### Autor: Jorge Macías García
#### Email: jormagar@upv.es

La aplicación de ejemplo consiste en una estructura maestro-detalle.

La vista maestro es un listado de personas que al pinchar sobre cada una de ellas, se abrirá una vista detalle con la información correspondiente.

La aplicación utiliza una base de datos sobre la que almacena los usuarios recuperados desde una API de generación de usuarios aleatorios.

Se implementa una caché simple por tiempo para renovar los usuarios al arrancar la aplicación.

Por otro lado, se implementa la funcionalidad de vaciado de datos al actualizar manualmente los usuarios desde la acción del ActionBar
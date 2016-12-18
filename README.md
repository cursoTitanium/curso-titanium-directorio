# Aplicación Directorio de Personas
## Proyecto del Curso Básico de Titanium.
### Autor: Jorge Macías García
#### Email: jormagar@upv.es

#### Características

**Navegación: Maestro - detalle**

Maestro: Listado de personas
Detalle: Detalle de persona

**Maestro: Listado de personas**

La vista maestro es un listado de personas en el que cada fila contendrá la foto y el nombre de una persona y que al pinchar sobre ella, se abrirá una vista detalle con la información correspondiente.

**Detalle: Vista detalle de una persona**

La vista detalle es un conjunto de vistas en la que poder visualizar información de la persona y una serie de acciones para interactuar con el sistema (llamar, email, mapa)

**Base de datos**

La aplicación utiliza una base de datos sobre la que almacena los usuarios recuperados desde una API de generación de usuarios aleatorios.

**Cache**

Se implementa una caché simple por tiempo para renovar los usuarios al arrancar la aplicación.

**Actualizar**

Por otro lado, se implementa la funcionalidad de vaciado de datos al actualizar manualmente los usuarios desde la acción del ActionBar
# Inventario
Los componentes renderizan la pantalla; variables contiene hooks de estado y calculos; eventos contiene peticiones HTTP y acciones; utilidades contiene formatos y el documento imprimible.
ModulosOperativos conserva la coordinacion con mantenimiento y cronograma. La eliminacion de activos refresca ambas vistas.

## Fotos y firmas
Una imagen JPG, PNG o WebP por activo y una por mantenimiento, maximo 2 MB.
El frontend envia la imagen temporalmente como data URL en JSON. El backend valida contenido y tamano, escribe el archivo con un UUID en `uploads/activos` y sustituye FOTO o EVIDENCIA por `/uploads/activos/UUID.ext` antes de llamar al servicio SQL. SQL guarda solo esa ruta. No se usa un endpoint separado de carga, evitando fotos creadas sin enviar el formulario.
La carpeta se crea automaticamente al guardar. Si el controlador responde con un error, se elimina la nueva foto. Las fotos anteriores no se eliminan automaticamente al reemplazar o quitar la referencia, para preservar otros registros que pudieran usarlas.
El servidor ya publica `/uploads` mediante Express. Las vistas y el documento imprimible resuelven las rutas con el origen del backend, no con el servidor del frontend.
Aplicar las columnas desde la carpeta del backend: `node database/migraciones/aplicarFotos.cjs`. Usa la conexion existente y la configuracion `.env`; es repetible y no borra registros. Las imagenes anteriores en base64 siguen mostrandose y se convierten a archivo al guardar de nuevo el formulario.
La hoja de vida muestra fotos y evidencias y espera la carga de imagenes antes de imprimir. Contiene espacios para firma manuscrita, nombre y fecha del coordinador y la persona designada; no son firmas digitales.

## Verificacion funcional
Crear activo con foto, editar conservandola, reemplazarla y quitarla; guardar mantenimiento con evidencia y comprobarlo en la hoja de vida; imprimir con imagenes; rechazar archivos no permitidos y mayores de 2 MB; eliminar ultimo activo de una pagina y revisar la paginacion.

## Firmas de la hoja de vida
`react-signature-canvas` captura dos firmas por activo: COORDINADOR y DESIGNADO. Los endpoints GET `/api/inventario/:id/firmas` y PUT `/api/inventario/:id/firmas/:tipo` consultan y guardan imagen PNG, nombre, fecha UTC y usuario autenticado en FIRMASHOJAVIDA. La imagen se almacena como VARBINARY(MAX) en SQL, maximo 512 KB. El PUT comprueba acceso vigente de soporte o administrador y pertenencia del activo a la mesa. Reemplazar una firma actualiza ese cargo; limpiar el dibujo no borra la firma ya guardada. El PDF incluye las firmas persistidas y muestra la fecha en America/Bogota.
Aplicar `database/migraciones/20261005_firmas_hoja_vida.sql` antes de reiniciar el backend.

-- FOTO y EVIDENCIA almacenan rutas /uploads/activos/nombre.ext, no el contenido del archivo.
-- Ejecutar antes de iniciar el backend actualizado. Conserva los registros existentes.
IF COL_LENGTH('dbo.INVENTARIOSMESA', 'FOTO') IS NULL
  ALTER TABLE dbo.INVENTARIOSMESA ADD FOTO VARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.MANTENIMIENTOSMESA', 'EVIDENCIA') IS NULL
  ALTER TABLE dbo.MANTENIMIENTOSMESA ADD EVIDENCIA VARCHAR(MAX) NULL;

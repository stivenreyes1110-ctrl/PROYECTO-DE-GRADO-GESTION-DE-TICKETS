# Configuraci?n
Disponible para administradores desde el men? Configuraci?n. Incluye usuarios de soporte (asignaci?n de roles existente), CRUD de incidentes propios, sedes, ?reas y prioridades.
Los incidentes compartidos se consultan sin modificar. Sedes y ?reas son globales. Prioridades e incidentes propios pertenecen a la mesa autenticada.
El backend comprueba el rol actual en SQL, valida campos, usa par?metros y transacciones serializables y bloquea borrados de registros relacionados. El c?digo de una prioridad usada no se puede cambiar; el nombre y orden s?.
Aplicar `database/migraciones/20261005_configuracion.sql` en el backend antes de reiniciarlo. Crea PRIORIDADESMESA y conserva los valores de tickets existentes.
Endpoints: `/api/configuracion/{incidentes,sedes,areas,prioridades}` (GET/POST), `/:id` (PUT/DELETE); `/api/prioridades` (GET autenticado para los formularios de solicitud).

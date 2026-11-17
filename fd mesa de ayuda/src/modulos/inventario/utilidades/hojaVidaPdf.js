import {obtenerUrlImagen} from './imagen.url';
import {normalizarTipo, formatearFecha, obtenerTexto, escaparHtml} from './inventario.utilidades';
const crearFirmaPdf = (firmas, tipo, titulo) => {
  const firma = firmas.find(f => f.TIPO === tipo);
  const imagen = firma?.FIRMA && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(firma.FIRMA) ? `<img src="${escaparHtml(firma.FIRMA)}" alt="Firma de ${escaparHtml(firma.NOMBRE)}" style="width:100%;height:90px;object-fit:contain" />` : '<div style="height:90px">Sin firma registrada</div>';
  return `<div class="firma">${imagen}<strong>${escaparHtml(titulo)}</strong><br />Nombre: ${escaparHtml(firma?.NOMBRE || '____________________')}<br />Fecha: ${firma ? escaparHtml(new Date(firma.FECHAFIRMA).toLocaleString('es-CO', {timeZone: 'America/Bogota'})) : '____________________'}</div>`;
};
const crearFilaDetalle = (titulo, valor) => `
  <tr>
    <th>${escaparHtml(titulo)}</th>
    <td>${escaparHtml(valor)}</td>
  </tr>
`;

const crearFilaMantenimiento = (mantenimiento) => `
  <tr>
    <td>${escaparHtml(formatearFecha(mantenimiento.FECHA))}</td>
    <td>${escaparHtml(mantenimiento.TIPOMANTENIMIENTO)}</td>
    <td>${escaparHtml(mantenimiento.ESTADO)}</td>
    <td>${escaparHtml(mantenimiento.RESPONSABLE || 'Sin responsable')}</td>
    <td>${escaparHtml(mantenimiento.DESCRIPCION || 'Sin descripcion')}</td>
    <td>${escaparHtml(mantenimiento.DIAGNOSTICO || 'Sin diagnostico')}</td>
    <td>${escaparHtml(mantenimiento.SOLUCION || 'Sin solucion')}</td>
    <td>${mantenimiento.EVIDENCIA ? `<img src="${escaparHtml(obtenerUrlImagen(mantenimiento.EVIDENCIA))}" alt="Evidencia del mantenimiento" style="width:90px;height:70px;object-fit:contain" />` : 'Sin evidencia'}</td>
  </tr>
`;

export const crearHtmlPdf = (activo, mantenimientosEquipo, firmas = []) => {
  const preventivos = mantenimientosEquipo.filter((item) => normalizarTipo(item.TIPOMANTENIMIENTO) === 'PREVENTIVO');
  const correctivos = mantenimientosEquipo.filter((item) => normalizarTipo(item.TIPOMANTENIMIENTO) === 'CORRECTIVO');
  const fechaGeneracion = new Date().toLocaleString('es-ES');

  return `
    <!doctype html>
    <html>
      <head>
        <title>Hoja de vida equipo ${escaparHtml(activo.ID)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 28px;
            font-family: Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
          }
          .encabezado {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            gap: 18px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            color: #1d4ed8;
          }
          h2 {
            margin: 24px 0 10px;
            font-size: 16px;
            color: #1d4ed8;
          }
          .subtitulo {
            margin: 6px 0 0;
            color: #475569;
            font-size: 12px;
          }
          .resumen {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 18px;
          }
          .caja {
            border: 1px solid #bfdbfe;
            background: #eff6ff;
            padding: 10px;
          }
          .caja strong {
            display: block;
            font-size: 20px;
            color: #1d4ed8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            page-break-inside: auto;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 7px;
            font-size: 11px;
            vertical-align: top;
            text-align: left;
          }
          th {
            background: #dbeafe;
            color: #0f172a;
            width: 180px;
          }
          thead th {
            width: auto;
            background: #dbeafe;
          }
          tr { page-break-inside: avoid; }
          .sin-registros {
            border: 1px solid #cbd5e1;
            padding: 12px;
            color: #64748b;
            font-size: 12px;
          }
          .firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-top: 75px;
            break-inside: avoid;
          }
          .firma {
            border-top: 1px solid #334155;
            padding-top: 8px;
            font-size: 11px;
            color: #475569;
          }
          @media print {
            body { padding: 18px; }
          }
        </style>
      </head>
      <body>
        <section class="encabezado">
          <div>
            <h1>Hoja de vida de equipo de computo</h1>
            <p class="subtitulo">Inventario clinico - Generado: ${escaparHtml(fechaGeneracion)}</p>
          </div>
          <div>
            <p class="subtitulo"><strong>ID activo:</strong> ${escaparHtml(activo.ID)}</p>
            <p class="subtitulo"><strong>Placa:</strong> ${escaparHtml(activo.PLACA || 'Sin placa')}</p>
          </div>
        </section>

        <section class="resumen">
          <div class="caja">
            <strong>${mantenimientosEquipo.length}</strong>
            Mantenimientos totales
          </div>
          <div class="caja">
            <strong>${preventivos.length}</strong>
            Preventivos
          </div>
          <div class="caja">
            <strong>${correctivos.length}</strong>
            Correctivos
          </div>
        </section>

        <h2>Datos generales del equipo</h2>
        ${activo.FOTO ? `<img src="${escaparHtml(obtenerUrlImagen(activo.FOTO))}" alt="Foto del activo" style="width:220px;height:160px;object-fit:contain" />` : '<p class="sin-registros">Sin foto del activo</p>'}
        <table>
          <tbody>
            ${crearFilaDetalle('Categoria', obtenerTexto(activo.CATEGORIA))}
            ${crearFilaDetalle('Marca', obtenerTexto(activo.MARCA))}
            ${crearFilaDetalle('Modelo', obtenerTexto(activo.MODELO))}
            ${crearFilaDetalle('Numero de serie', obtenerTexto(activo.NUMEROSERIE))}
            ${crearFilaDetalle('Placa', obtenerTexto(activo.PLACA))}
            ${crearFilaDetalle('Sede', obtenerTexto(activo.NOMBRESEDE))}
            ${crearFilaDetalle('Area', obtenerTexto(activo.NOMBREAREA))}
            ${crearFilaDetalle('Mesa responsable', obtenerTexto(activo.NOMBREMESA))}
            ${crearFilaDetalle('Descripcion de ubicacion', obtenerTexto(activo.DESCRIPCIONUBICACION))}
            ${crearFilaDetalle('Fecha de registro', formatearFecha(activo.FECHAREGISTRO))}
          </tbody>
        </table>

        <h2>Mantenimientos preventivos</h2>
        ${preventivos.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Descripcion</th>
                <th>Diagnostico</th>
                <th>Solucion</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>${preventivos.map(crearFilaMantenimiento).join('')}</tbody>
          </table>
        ` : '<div class="sin-registros">No hay mantenimientos preventivos registrados.</div>'}

        <h2>Mantenimientos correctivos</h2>
        ${correctivos.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Descripcion</th>
                <th>Diagnostico</th>
                <th>Solucion</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>${correctivos.map(crearFilaMantenimiento).join('')}</tbody>
          </table>
        ` : '<div class="sin-registros">No hay mantenimientos correctivos registrados.</div>'}

        <section class="firmas">
          ${crearFirmaPdf(firmas, 'COORDINADOR', 'Firma del coordinador')}
          ${crearFirmaPdf(firmas, 'DESIGNADO', 'Firma de la persona designada para el equipo')}
        </section>
      </body>
    </html>
  `;
};


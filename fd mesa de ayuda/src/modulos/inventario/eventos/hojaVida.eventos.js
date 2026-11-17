import {crearHtmlPdf} from '../utilidades/hojaVidaPdf';
export async function imprimirHojaVida(activo, mantenimientosEquipo, firmas = []) {
  const ventana = window.open('', '_blank');
  if (!ventana) { alert('Permite ventanas emergentes para imprimir la hoja de vida.'); return; }
  ventana.document.open();
  ventana.document.write(crearHtmlPdf(activo, mantenimientosEquipo, firmas));
  ventana.document.close();
  await Promise.all(Array.from(ventana.document.images, imagen => imagen.decode().catch(() => null)));
  if (!ventana.closed) { ventana.focus(); ventana.print(); }
}

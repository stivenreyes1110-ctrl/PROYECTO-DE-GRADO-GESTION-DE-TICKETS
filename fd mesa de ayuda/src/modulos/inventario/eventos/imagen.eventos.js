export async function leerImagen(archivo) {
  if (!archivo) return '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (archivo.size > 2 * 1024 * 1024) throw new Error('La imagen debe pesar como maximo 2 MB.');
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error('No fue posible leer la imagen.'));
    lector.readAsDataURL(archivo);
  });
}

import CampoFirma from './CampoFirma';
export default function FirmasHojaVida({firmas, usuarios, cargando, guardando, error, onGuardar, onReintentar}) {
  return <section aria-label="Firmas de la hoja de vida" className="mt-8 border-t border-blue-200 pt-6">
    <h4 className="text-lg font-bold text-blue-950">Firmas de conformidad</h4><p className="mt-1 text-sm text-blue-800">Guarda cada firma antes de generar el PDF. Las firmas guardadas quedan asociadas a este activo.</p>
    {!cargando && !error && usuarios.length === 0 && <p role="status" className="mt-3 text-sm text-blue-800">No hay usuarios activos disponibles para firmar.</p>}
    {cargando ? <p role="status" className="mt-4 text-sm text-blue-800">Cargando firmas...</p> : error ? <p role="alert" className="mt-4 text-sm text-red-700">{error} <button type="button" onClick={onReintentar} className="font-semibold underline">Reintentar</button></p> : <div className="mt-5 grid gap-5 md:grid-cols-2">
      {[['COORDINADOR', 'Coordinador'], ['DESIGNADO', 'Persona designada para el equipo']].map(([tipo,titulo]) => <CampoFirma key={tipo} tipo={tipo} titulo={titulo} usuarios={usuarios} firma={firmas.find(f => f.TIPO === tipo)} guardando={guardando} onGuardar={onGuardar} />)}
    </div>}
  </section>;
}

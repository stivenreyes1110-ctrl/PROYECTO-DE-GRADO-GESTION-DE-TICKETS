export function crearEventosModalActivo({formulario, setFormulario, areas, idMesa, onSave}) {
  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === 'IDSEDE' ? { IDAREA: '' } : {})
    }));
  };

  const obtenerNombre = (registro) => {
    return registro.NOMBRE || registro.nombre || registro.DESCRIPCION || registro.descripcion || `ID ${registro.ID}`;
  };

  const areasFiltradas = formulario.IDSEDE
    ? areas.filter((area) => Number(area.IDSEDE) === Number(formulario.IDSEDE))
    : [];

  const enviarFormulario = (evento) => {
    evento.preventDefault();

    if (!formulario.CATEGORIA || !formulario.IDAREA || !formulario.IDSEDE) {
      alert('Categoría, área y sede son obligatorios');
      return;
    }

    onSave({
      ...formulario,
      IDAREA: Number(formulario.IDAREA),
      IDSEDE: Number(formulario.IDSEDE),
      IDMESA: Number(idMesa)
    });
  };

  return {cambiarCampo, obtenerNombre, areasFiltradas, enviarFormulario};
}

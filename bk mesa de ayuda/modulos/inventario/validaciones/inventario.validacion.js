const validarActivo = (activo = {}) => (
  Boolean(activo.CATEGORIA && activo.IDAREA && activo.IDSEDE)
);

module.exports = { validarActivo };

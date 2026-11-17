const { consultarAsignados } = require('./consulta.repositorio');

const consultarTicketsAsignados = async ({ contexto, pagina, limite, estado }) => {
  const resultado = await consultarAsignados({ contexto, pagina, limite, estado });
  return {
    datos: resultado.datos,
    paginacion: {
      pagina,
      limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite)
    }
  };
};

module.exports = { consultarTicketsAsignados };

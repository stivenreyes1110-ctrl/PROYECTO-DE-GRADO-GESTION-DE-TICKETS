const { listar } = require('./consulta.repositorio');

const consultarTickets = async ({ contexto, pagina, limite, estado }) => {
  const resultado = await listar({ idMesa: contexto.idMesa, pagina, limite, estado });
  return {
    datos: resultado.datos,
    paginacion: {
      pagina, limite, total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / limite)
    }
  };
};
module.exports = { consultarTickets };

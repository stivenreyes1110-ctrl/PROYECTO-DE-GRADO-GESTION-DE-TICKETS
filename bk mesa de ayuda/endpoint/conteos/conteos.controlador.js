const express = require('express');
const conteoService = require('./conteos.servicio')


/*
==================================================
INDICE
==================================================

1. LOSCONTEOSPORUSUARIO
2. LOSCONTEOSPORSOPORTE
3. CONTEODEDIFERENCIAPORTIEMPO
4. LOSCONTEOSINDIVIDUALPORSOPORTE

==================================================
*/


//1. LOSCONTEOSPORUSUARIO
const losConteoPorUsuairo = async (req, res) => {
    try {


        console.log('SE HIZO CONSULTA DE CONTEO POR USUARIO')
        console.log(" ");
        console.log(" ");


        const conteo = await conteoService.losConteoPorUsuairo(req);
        res.json(conteo)


    } catch (error) {


        console.log(error)
        res.status(500).json({error: 'Error del Servidor'})


    }
}


//2. LOSCONTEOSPORSOPORTE
const losConteos = async (req, res) => {
    try {
        const mesaToken = Number(req.usuario.idMesa);
        if (!mesaToken) {
            return res.status(400).json({ ok: false, mensaje: "La sesión no tiene una mesa activa" });
        }
        req.params.mesa = mesaToken;


        console.log('SE HIZO UNA CONSULTA DE CONTEOS TOTAL POR MESA')
        console.log(" ");
        console.log(" ");


        const conteo = await conteoService.losConteos(req);
        res.json(conteo)


    } catch (error) {


        console.log(error)
        res.status(500).json({error: 'Error del servidor'})


    }
}


//3. CONTEODEDIFERENCIAPORTIEMPO
const lasDiferencia = async (req, res) => {
    try {

        
        console.log("ENTRO A CONTEO DE DIFERENCIA DE TIEMPO ENTRE TICKETS")
        console.log(" ");
        console.log(" ");


        const result = await conteoService.lasDiferencia()
        res.json(result)


    } catch (error) {

        
        console.log(error)
        res.status(500).json({ok:false, mensaje: "Error de Servidor"})


    }

}


const agrupacionesPanel = async (req, res) => {
    try {
        const mesaToken = Number(req.usuario.idMesa);
        const mesaSolicitada = Number(req.query.mesa);
        const idMesa = mesaToken || mesaSolicitada;

        if (!idMesa) {
            return res.status(400).json({ ok: false, mensaje: "No se indicó una mesa activa." });
        }

        if (mesaToken && mesaSolicitada && mesaToken !== mesaSolicitada) {
            return res.status(403).json({ ok: false, mensaje: "La mesa solicitada no corresponde a la sesión." });
        }

        const resultado = await conteoService.consultarAgrupacionesPanel(idMesa);
        res.json(resultado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, mensaje: "Error al consultar agrupaciones del panel" });
    }
}

const obtenerResumenMesa = async (req, res) => {
    try {
        const idMesa = Number(req.usuario.idMesa);
        if (!idMesa) return res.status(400).json({ ok: false, mensaje: "La sesión no tiene una mesa activa" });
        return res.json(await conteoService.resumenTicketsMesa(idMesa));
    } catch (error) {
        console.error('[CONTEO_MESA_ERROR]', error);
        return res.status(500).json({ ok: false, mensaje: "Error al consultar el resumen de la mesa" });
    }
}

//4. LOSCONTEOSINDIVIDUALPORSOPORTE
const losConteosDeTickets = async (req, res) => {
    try {
        const mesaToken = Number(req.usuario.idMesa);
        if (!mesaToken) {
            return res.status(400).json({ ok: false, mensaje: "La sesión no tiene una mesa activa" });
        }
        req.params.mesa = mesaToken;


        console.log("ENTRO A CONTEO DE TICKETS POR USUARIO DE SOPORTE")
        console.log(" ");
        console.log(" ");


        const result = await conteoService.losConteosDeTickets(req,res)
        res.json(result)


    } catch (error) {


        console.log(error)
        res.status(500).json({ ok: false, mensaje: "Error del servidor" })


    }
}


module.exports = { 
    

    losConteos, 
    losConteoPorUsuairo, 
    obtenerResumenMesa,
    losConteosDeTickets,
    lasDiferencia,
    agrupacionesPanel


}

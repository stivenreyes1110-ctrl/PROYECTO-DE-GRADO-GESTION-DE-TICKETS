const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const {guardarImagen} = require('../middleware/guardar.imagen');
const {validarImagen} = require('../middleware/validar.imagen');
const db = require('../config/db');
let fallarSql = false;
let parametrosSql;
const conexionOriginal = db.conexion;
db.conexion = async () => ({request() {
  const inputs = {};
  return {
    input(nombre, tipo, valor) {inputs[nombre] = valor; return this;},
    async query() {
      parametrosSql = inputs;
      if (fallarSql) throw new Error('Fallo SQL simulado');
      return {recordset: [{...inputs, ID: inputs.ID || 1}]};
    }
  };
}});
const {insertarActivo} = require('../modulos/inventario/insertar/insertar.controlador');
const {actualizarActivo} = require('../modulos/inventario/actualizar/actualizar.controlador');
const {insertarMantenimiento, actualizarMantenimiento} = require('../modulos/mantenimientos/compartido/mantenimientos.controlador');
const foto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII=';

test('Archivo fisico, ruta enviada a SQL, consulta publica, edicion y errores', async t => {
  const directorio = await fs.mkdtemp(path.join(os.tmpdir(), 'mesa-activos-test-'));
  const app = express();
  app.use(express.json({limit: '3mb'}));
  app.use((req, res, next) => {req.usuario = {idMesa: 1};next();});
  app.post('/inventario', validarImagen('FOTO'), guardarImagen('FOTO', directorio), insertarActivo);
  app.put('/inventario/:id', validarImagen('FOTO'), guardarImagen('FOTO', directorio), actualizarActivo);
  app.post('/mantenimiento', validarImagen('EVIDENCIA'), guardarImagen('EVIDENCIA', directorio), insertarMantenimiento);
  app.put('/mantenimiento/:id', validarImagen('EVIDENCIA'), guardarImagen('EVIDENCIA', directorio), actualizarMantenimiento);
  app.use('/uploads/activos', express.static(directorio));
  const server = await new Promise(resolve => {const instancia = app.listen(0, '127.0.0.1', () => resolve(instancia));});
  const base = `http://127.0.0.1:${server.address().port}`;
  async function enviar(ruta, datos, method = 'POST') {
    const respuesta = await fetch(base + ruta, {method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(datos)});
    return {status: respuesta.status, body: await respuesta.json()};
  }
  const campos = {CATEGORIA: 'Computador', IDAREA: 1, IDSEDE: 1};
  try {
    let url;
    let evidenciaUrl;
    await t.test('crear: archivo binario en carpeta y solo URL en parametro SQL', async () => {
      const res = await enviar('/inventario', {...campos, FOTO: foto});
      assert.equal(res.status, 201);
      url = res.body.FOTO;
      assert.match(url, /^\/uploads\/activos\/[0-9a-f-]+\.png$/);
      assert.equal(parametrosSql.FOTO, url);
      const contenido = await fs.readFile(path.join(directorio, path.basename(url)));
      assert.deepEqual(contenido, Buffer.from(foto.split(',')[1], 'base64'));
      const imagen = await fetch(base + url);
      assert.equal(imagen.status, 200);
      assert.match(imagen.headers.get('content-type'), /image\/png/);
      assert.deepEqual(Buffer.from(await imagen.arrayBuffer()), contenido);
    });
    await t.test('editar conservando URL: no duplica archivo', async () => {
      const antes = await fs.readdir(directorio);
      const res = await enviar('/inventario/1', {...campos, FOTO: url}, 'PUT');
      assert.equal(res.status, 200);
      assert.equal(parametrosSql.FOTO, url);
      assert.deepEqual(await fs.readdir(directorio), antes);
    });
    await t.test('quitar foto: envia null a SQL', async () => {
      const res = await enviar('/inventario/1', {...campos, FOTO: ''}, 'PUT');
      assert.equal(res.status, 200);
      assert.equal(parametrosSql.FOTO, null);
      assert.equal(parametrosSql.CAMBIARFOTO, true);
    });
    await t.test('evidencia de mantenimiento: tambien guarda archivo y URL', async () => {
      const res = await enviar('/mantenimiento', {IDACTIVO: 1, TIPOMANTENIMIENTO: 'Preventivo', EVIDENCIA: foto});
      assert.equal(res.status, 201);
      assert.match(res.body.EVIDENCIA, /^\/uploads\/activos\/[0-9a-f-]+\.png$/);
      assert.equal(parametrosSql.EVIDENCIA, res.body.EVIDENCIA);
      evidenciaUrl = res.body.EVIDENCIA;
      await fs.access(path.join(directorio, path.basename(res.body.EVIDENCIA)));
    });
    await t.test('editar mantenimiento conserva evidencia sin duplicar archivo', async () => {
      const antes = (await fs.readdir(directorio)).sort();
      const res = await enviar('/mantenimiento/1', {IDACTIVO: 1, TIPOMANTENIMIENTO: 'Preventivo', EVIDENCIA: evidenciaUrl}, 'PUT');
      assert.equal(res.status, 200);
      assert.equal(parametrosSql.EVIDENCIA, evidenciaUrl);
      assert.equal(parametrosSql.CAMBIAREVIDENCIA, true);
      assert.deepEqual((await fs.readdir(directorio)).sort(), antes);
    });
    await t.test('reemplazar evidencia genera una nueva ruta', async () => {
      const res = await enviar('/mantenimiento/1', {IDACTIVO: 1, TIPOMANTENIMIENTO: 'Preventivo', EVIDENCIA: foto}, 'PUT');
      assert.equal(res.status, 200);
      assert.notEqual(res.body.EVIDENCIA, evidenciaUrl);
      await fs.access(path.join(directorio, path.basename(res.body.EVIDENCIA)));
    });
    await t.test('quitar evidencia envia null; omitirla conserva la referencia SQL', async () => {
      const campos = {IDACTIVO: 1, TIPOMANTENIMIENTO: 'Preventivo'};
      assert.equal((await enviar('/mantenimiento/1', {...campos, EVIDENCIA: ''}, 'PUT')).status, 200);
      assert.equal(parametrosSql.EVIDENCIA, null);
      assert.equal(parametrosSql.CAMBIAREVIDENCIA, true);
      assert.equal((await enviar('/mantenimiento/1', campos, 'PUT')).status, 200);
      assert.equal(parametrosSql.CAMBIAREVIDENCIA, false);
    });
    await t.test('fallo SQL: retira el nuevo archivo', async () => {
      const antes = (await fs.readdir(directorio)).sort();
      fallarSql = true;
      const res = await enviar('/inventario', {...campos, FOTO: foto});
      fallarSql = false;
      assert.equal(res.status, 500);
      for (let intento=0; intento<20; intento++) {
        if ((await fs.readdir(directorio)).length === antes.length) break;
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      assert.deepEqual((await fs.readdir(directorio)).sort(), antes);
    });
    await t.test('rechaza ruta externa, traversal, archivo inexistente y contenido falso', async () => {
      for (const FOTO of ['https://example.com/foto.png', '/uploads/activos/../secreto.png', '/uploads/activos/00000000-0000-0000-0000-000000000000.png', 'data:image/png;base64,AAAA']) {
        assert.equal((await enviar('/inventario', {...campos, FOTO})).status, 400);
      }
    });
  } finally {
    db.conexion = conexionOriginal;
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    // Solo archivos directos del directorio temporal creado por esta prueba.
    for (const nombre of await fs.readdir(directorio)) await fs.unlink(path.join(directorio, nombre));
    await fs.rmdir(directorio);
  }
});

const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const express = require("express");
const { firmaValida } = require("./src/meta");
const { procesar } = require("./src/repositorio");
const { enviarMensaje } = require("./whatsapp");

const app = express();
app.disable("x-powered-by");

app.get("/webhook", (req, res) => {
  const token = process.env.VERIFY_TOKEN;
  const challenge = req.query["hub.challenge"];

  if (
    token &&
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === token &&
    typeof challenge === "string"
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  const firma = req.get("x-hub-signature-256");
  if (!Buffer.isBuffer(req.body) || !firmaValida(req.body, firma, process.env.META_APP_SECRET)) {
    return res.sendStatus(403);
  }

  let evento;
  try {
    evento = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }
  if (evento?.object !== "whatsapp_business_account") return res.sendStatus(400);

  try {
    for (const entrada of evento.entry || []) {
      for (const cambio of entrada.changes || []) {
        const datos = cambio.value;
        if (cambio.field !== "messages" || datos?.metadata?.phone_number_id !== process.env.PHONE_NUMBER_ID) {
          continue;
        }

        for (const mensaje of datos.messages || []) {
          if (!/^\d{5,32}$/.test(mensaje.from || "") || typeof mensaje.id !== "string" || !mensaje.id || mensaje.id.length > 200) {
            continue;
          }
          await procesar(mensaje, enviarRespuesta);
        }
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("[whatsapp] Error procesando evento:", error.status || error.code || error.name);
    return res.sendStatus(503);
  }
});

async function enviarRespuesta(numero, respuesta) {
  const caracteres = Array.from(respuesta);
  for (let inicio = 0; inicio < caracteres.length; inicio += 3500) {
    await enviarMensaje(numero, caracteres.slice(inicio, inicio + 3500).join(""));
  }
}

if (require.main === module) {
  const puerto = process.env.PORT || 3005;
  app.listen(puerto, () => console.log("Servidor WhatsApp iniciado en puerto", puerto));
}

module.exports = app;

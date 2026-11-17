
require("dotenv").config({ path: require("node:path").join(__dirname, ".env"), quiet: true });
const axios = require("axios");

const API_URL =
  `https://graph.facebook.com/${process.env.GRAPH_API_VERSION}` +
  `/${process.env.PHONE_NUMBER_ID}/messages`;

async function enviarMensaje(numero, mensaje) {
  try {
    const response = await axios.post(
      API_URL,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: numero,
        type: "text",
        text: {
          preview_url: false,
          body: mensaje
        }
      },
      {
        timeout: 12000,
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Mensaje enviado:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error de Meta:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { enviarMensaje };

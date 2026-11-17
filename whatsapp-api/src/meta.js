const crypto=require('node:crypto');
function firmaValida(body,firma,secreto){
 if(!secreto||!/^sha256=[a-f0-9]{64}$/.test(firma||''))return false;
 return crypto.timingSafeEqual(crypto.createHmac('sha256',secreto).update(body).digest(),Buffer.from(firma.slice(7),'hex'));
}
module.exports = { firmaValida };

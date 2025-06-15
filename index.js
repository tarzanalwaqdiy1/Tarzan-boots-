const express = require('express');
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

let activeBots = {};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/start', async (req, res) => {
  const number = req.query.number || 'default';

  if (activeBots[number]) {
    return res.send('✅ البوت متصل مسبقاً بهذا الرقم');
  }

  const sessionFile = `./sessions/session-${number}.json`;
  if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

  const { state, saveState } = useSingleFileAuthState(sessionFile);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  activeBots[number] = sock;

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'open') {
      console.log(`✅ تم الاتصال بالرقم: ${number}`);
    }

    if (qr) {
      res.send(`<pre>${qr}</pre>`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      console.log(`❌ تم فصل الاتصال عن ${number}:`, lastDisconnect?.error?.message);
      delete activeBots[number];
    }
  });

  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.key.fromMe && m.message) {
      const sender = m.key.remoteJid;
      await sock.sendMessage(sender, { text: "✅ البوت جاهز ويعمل تلقائياً من GitHub!" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 الواجهة تعمل على http://localhost:${PORT}`);
});
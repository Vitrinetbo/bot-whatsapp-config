const express = require('express');
const admin = require('firebase-admin');
const { create } = require('@wppconnect-team/wppconnect'); // cliente WhatsApp
const app = express();
const port = process.env.PORT || 3000;

// Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

app.use(express.json());

// Inicializa o cliente do WhatsApp
create({
  session: 'bot-profissional',
  headless: true,
  qrTimeout: 0,
  catchQR: (base64Qrimg, asciiQR) => {
    console.log('⚠️ Escaneie o QR code:');
    console.log(asciiQR);
  },
  statusFind: (statusSession) => {
    console.log('Status:', statusSession);
  },
}).then(client => {
  console.log('✅ WhatsApp conectado com sucesso');

  // Envia mensagem de boas-vindas ao receber nova mensagem
  client.onMessage(async (message) => {
    const number = message.from;
    const text = message.body?.toLowerCase() || '';

    // Verifica se a mensagem é nova
    if (message.isNewMsg && !message.isGroupMsg) {
      console.log(`📩 Mensagem de ${number}: ${text}`);

      // Envia mensagem de boas-vindas
      await client.sendText(number, '👋 Olá! Seja bem-vindo ao nosso atendimento automático.');

      // Busca respostas salvas do usuário (pelo número de telefone como ID)
      const userId = number.replace(/[@:\s]/g, '_'); // Firebase-safe
      const ref = db.collection('users').doc(userId).collection('answers');

      try {
        const snapshot = await ref.get();
        const respostas = [];
        snapshot.forEach(doc => respostas.push(doc.data()));

        // Verifica se alguma pergunta bate
        for (const item of respostas) {
          if (text.includes(item.question.toLowerCase())) {
            await client.sendText(number, item.answer);
            break;
          }
        }

      } catch (error) {
        console.error('Erro ao buscar respostas:', error.message);
      }
    }
  });
});

// Rota para buscar respostas de um usuário
app.get('/answers/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const snapshot = await db.collection('users').doc(userId).collection('answers').get();
    const answers = [];
    snapshot.forEach(doc => answers.push(doc.data()));
    res.json({ answers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota simples de verificação
app.get('/', (req, res) => {
  res.send('🤖 Bot WhatsApp profissional rodando!');
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

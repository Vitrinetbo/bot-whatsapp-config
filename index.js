const express = require('express');
const admin = require('firebase-admin');
const app = express();

const port = process.env.PORT || 3000;

// Inicialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // baixa no Firebase Console > Configurações > Contas de serviço

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(express.json());

// Rota teste para retornar respostas de um usuário (simulando o bot)
app.get('/answers/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const snapshot = await db.collection('users').doc(userId).collection('answers').get();
    const answers = [];
    snapshot.forEach(doc => {
      answers.push(doc.data());
    });
    res.json({ answers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Bot rodando na porta ${port}`);
});
const express = require('express');
const admin = require('firebase-admin');
const app = express();

const port = process.env.PORT || 3000;

// Inicialize Firebase Admin SDK usando variáveis de ambiente
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // importante para as quebras de linha
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

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

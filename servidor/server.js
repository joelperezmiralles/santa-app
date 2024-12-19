const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors()); // E
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ... resto del código ...

function shuffle(participants) {
  let receivers;
  do {
    receivers = [...participants];
    // Mezclar el array
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    // Verificar si alguien se ha tocado a sí mismo
    const hasSelfAssignment = receivers.some((receiver, index) => 
      receiver.email === participants[index].email
    );
    // Si nadie se ha tocado a sí mismo, terminamos
    if (!hasSelfAssignment) break;
  } while (true);
  
  return receivers;
}

const createEmailHTML = (sender, receiver, organizer, customMessage) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px;">
        <!-- Cabecera con imagen navideña -->
        <div style="background-color: #D4372C; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎄 Amigo Invisible 🎁</h1>
            <p style="color: white; margin: 10px 0 0 0;">¡La magia de la Navidad comienza!</p>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 30px; background-color: white;">
            <p style="font-size: 18px; color: #333; margin-bottom: 25px;">
                ¡Hola <strong>${sender.name}</strong>! 🌟
            </p>
            <p style="color: #666; line-height: 1.5; margin-bottom: 20px;">
                ¡Has sido elegido para participar en nuestro Amigo Invisible! Tu misión, si decides aceptarla, es hacer sonreír a:
            </p>
            
            <!-- Nombre del receptor destacado -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <h2 style="color: #D4372C; margin: 0; font-size: 24px;">🎅 ${receiver.name} 🎅</h2>
            </div>

            <!-- Detalles del evento -->
            <div style="border-left: 4px solid #D4372C; padding-left: 20px; margin: 25px 0;">
                <p style="color: #333; margin: 10px 0;"><strong>📅 Fecha límite:</strong> 24 de Diciembre</p>
                <p style="color: #333; margin: 10px 0;"><strong>💰 Presupuesto:</strong> 20€</p>
                <p style="color: #333; margin: 10px 0;"><strong>📍 Lugar de intercambio:</strong> Oficina</p>
            </div>

            <!-- Mensaje personalizado -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #666; margin: 0; font-style: italic;">
                    ${customMessage}
                </p>
            </div>

            <!-- Recordatorio -->
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 25px;">
                <p style="color: #856404; margin: 0;">
                    <strong>🤫 Recuerda:</strong> Mantén el secreto hasta el día del intercambio. ¡Eso es lo divertido!
                </p>
            </div>
        </div>

        <!-- Pie de email -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
                Organizado con ❤️ por ${organizer}
            </p>
            <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                Por favor, no respondas a este email
            </p>
        </div>
    </div>
</body>
</html>
`;

app.post('/sorteo', async (req, res) => {
  try {
    const { participants, message, organizer } = req.body;
    const receivers = shuffle(participants);
    
    for (let i = 0; i < participants.length; i++) {
      const sender = participants[i];
      const receiver = receivers[i];
      
      if (sender.email === receiver.email) {
        throw new Error('Error en el sorteo: un participante se ha tocado a sí mismo');
      }
      
      const emailText = message.body
        .replace(/\$NOMBRE/g, sender.name)
        .replace(/\$AMIGO_INVISIBLE/g, receiver.name);
        
      await transporter.sendMail({
        from: {
          name: "🎄 Sorteo Amigo Invisible 🎁",
          address: process.env.EMAIL_USER
        },
        to: sender.email,
        subject: `🎁 ${sender.name}, ¡descubre a quién tienes que regalar!`,
        text: emailText,
        html: createEmailHTML(sender, receiver, organizer, emailText)
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ... resto del código ...

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/test', (req, res) => {
  res.json({ 
    status: 'ok',
    cors: 'enabled',
    allowedOrigins: [
      'https://amigo-invisible-ruby.vercel.app',
      'http://localhost:5173',
      'https://web-production-bec0.up.railway.app'
    ]
  });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
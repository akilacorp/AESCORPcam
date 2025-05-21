const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = moment().format('YYYY-MM-DD');
    const dir = path.join(__dirname, '..', '..', 'server', 'uploads', today);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const fileType = file.fieldname; 
    const ext = path.extname(file.originalname) || 
                (fileType === 'photo' ? '.jpg' : '.webm');
                
    cb(null, `${timestamp}_${fileType}${ext}`);
  }
});

const upload = multer({ storage: storage });

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhuma foto enviada' });
    }

    const fileInfo = {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    };

    if (process.env.WEBHOOK_URL) {
      try {
        await sendToWebhook(req.file.path, 'photo');
        console.log('Foto enviada para o webhook com sucesso');
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook:', webhookError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Foto salva com sucesso', 
      file: fileInfo 
    });
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar a foto' });
  }
});

router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum vídeo enviado' });
    }

    const fileInfo = {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    };

    if (process.env.WEBHOOK_URL) {
      try {
        await sendToWebhook(req.file.path, 'video');
        console.log('Vídeo enviado para o webhook com sucesso');
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook:', webhookError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Vídeo salvo com sucesso', 
      file: fileInfo 
    });
  } catch (error) {
    console.error('Erro ao salvar vídeo:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar o vídeo' });
  }
});

async function sendToWebhook(filePath, fileType) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const webhookType = process.env.WEBHOOK_TYPE || 'discord';
  
  if (!webhookUrl) {
    throw new Error('URL do webhook não configurada');
  }

  const formData = new FormData();
  const fileName = path.basename(filePath);
  const fileContent = fs.createReadStream(filePath);

  switch (webhookType.toLowerCase()) {
    case 'discord':
      formData.append('content', `Nova captura ${fileType === 'photo' ? 'de imagem' : 'de vídeo'} recebida!`);
      formData.append('file', fileContent, fileName);
      
      await axios.post(webhookUrl, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      break;

    case 'telegram':
      const methodName = fileType === 'photo' ? 'sendPhoto' : 'sendVideo';
      const paramName = fileType === 'photo' ? 'photo' : 'video';
      
      const urlParts = webhookUrl.split('/');
      const botToken = urlParts[4].replace('bot', '');
      const chatId = new URL(webhookUrl).searchParams.get('chat_id');
      
      if (!botToken || !chatId) {
        throw new Error('URL do Telegram inválida');
      }
      
      formData.append(paramName, fileContent, fileName);
      formData.append('chat_id', chatId);
      
      await axios.post(`https://api.telegram.org/bot${botToken}/${methodName}`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      break;

    default:
      formData.append('file', fileContent, fileName);
      formData.append('type', fileType);
      
      await axios.post(webhookUrl, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
  }
}

router.post('/upload-base64', async (req, res) => {
  try {
    const { imageData, fileType } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const today = moment().format('YYYY-MM-DD');
    const dir = path.join(__dirname, '..', '..', 'server', 'uploads', today);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const ext = fileType === 'photo' ? '.jpg' : '.webm';
    const filename = `${timestamp}_${fileType}${ext}`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileInfo = {
      filename: filename,
      path: filePath,
      size: buffer.length
    };

    if (process.env.WEBHOOK_URL) {
      try {
        await sendToWebhook(filePath, fileType);
        console.log('Arquivo enviado para o webhook com sucesso');
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook:', webhookError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Arquivo salvo com sucesso', 
      file: fileInfo 
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo base64:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar o arquivo' });
  }
});

module.exports = router;

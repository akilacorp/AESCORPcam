const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const moment = require('moment');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const isReplit = process.env.REPL_ID && process.env.REPL_SLUG;
const REPLIT_PORT = isReplit ? 8080 : PORT;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const today = moment().format('YYYY-MM-DD');
    const dir = path.join(__dirname, 'server', 'uploads', today);
    
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

const webhookRoutes = require('./server/routes/webhook');

app.use('/api', webhookRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(REPLIT_PORT, () => {
  console.log(`Servidor rodando na porta ${REPLIT_PORT}`);
  if (isReplit) {
    console.log('Detectado ambiente Replit!');
    console.log(`URL pública: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  }
  
  const uploadsDir = path.join(__dirname, 'server', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Pasta de uploads criada');
  }
});

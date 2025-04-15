const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Configurar multer para processar os uploads
const storage = multer.memoryStorage(); // Usamos memoryStorage para armazenar em buffer
const upload = multer({ storage: storage });

// Conexão com MySQL (XAMPP)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // ou a senha do seu MySQL
  database: 'seubanco'
});

// Rota de upload de imagem
app.post('/upload', upload.single('foto'), (req, res) => {
    const nome = req.body.nome;
    const fotoBuffer = req.file.buffer; // Aqui pegamos a imagem como buffer binário
  
    // Verificando se o buffer da imagem existe
    if (!fotoBuffer) {
      return res.status(400).send('Nenhuma imagem foi enviada.');
    }
  
    // Log para verificar o tamanho do buffer
    console.log(`Tamanho do buffer da imagem: ${fotoBuffer.length} bytes`);
  
    // Inserir a imagem no banco
    const sql = 'INSERT INTO users (nome, foto_perfil) VALUES (?, ?)';
    db.query(sql, [nome, fotoBuffer], (err, result) => {
      if (err) {
        console.error('Erro ao salvar no banco:', err);
        return res.status(500).send('Erro ao salvar no banco.');
      }
      res.send('Imagem enviada e salva com sucesso!');
    });
  });
  

// Rota para listar os usuários com a imagem (em formato binário)
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT id, nome, foto_perfil FROM users ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar usuários.');
    }
    res.json(results);
  });
});

app.get('/imagem/:id', (req, res) => {
    const { id } = req.params;
  
    const sql = 'SELECT foto_perfil FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao buscar imagem.');
      }
  
      if (results.length > 0) {
        const imagem = results[0].foto_perfil;
        
        // Verifique se a imagem foi encontrada e se não está vazia
        if (imagem) {
          // Converte o buffer binário para base64
          const base64Image = imagem.toString('base64');
  
          // Determina o tipo de conteúdo da imagem, ajustando para o formato adequado
          const mimetype = 'image/jpeg'; // Ou 'image/png', conforme o tipo da imagem
          res.writeHead(200, { 'Content-Type': mimetype });
          res.end(Buffer.from(base64Image, 'base64'));
        } else {
          res.status(404).send('Imagem não encontrada.');
        }
      } else {
        res.status(404).send('Usuário não encontrado.');
      }
    });
  });
    
  

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

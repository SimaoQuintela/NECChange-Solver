const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Obtém o diretório atual do arquivo server.js
const currentDir = __dirname;

// Define o caminho relativo para o diretório de destino dos arquivos
const dirPath = path.join(currentDir, "../../../../schedule/schedule/data");

// Garante que o diretório de destino existe
fs.mkdirSync(dirPath, { recursive: true });

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const app = express();

app.post("/upload", upload.array("file"), (req, res, next) => {
  res.send("Arquivos recebidos.");
});

app.listen(3000, () => {
  console.log("Servidor a ouvir na porta 3000");
});

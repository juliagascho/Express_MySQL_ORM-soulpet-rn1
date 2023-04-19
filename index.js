// Importações principais e variáveis de ambiente:
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

// Configuração do App
const app = express();
app.use(express.json()); // possibilita transitar dados usando JSON
app.use(morgan("dev"));

// Configuração do Banco de dados
const { connection, authenticate } = require("./database/database");
authenticate(connection); // efetivar a conexão
// const Cliente = require("./database/cliente"); // configurar o model da aplicação
// const Endereco = require("./database/endereco");
// const Pet = require("./database/pet");

// Definição de rotas
const rotasClientes = require("./routes/clientes");
const rotasPets = require("./routes/pets");

app.use(rotasClientes); // configurar o grupo de rotas no app
app.use(rotasPets);

// Escuta de eventos (listen)
app.listen(3000, () => {
    connection.sync(); // o force é para não salvar os dados de teste enquanto estamos modelando
    console.log("Servidor rodando em http://localhost:3000")
})
// Importações principais e variáveis de ambiente:
require("dotenv").config();
const express = require("express");

// Configuração do App
const app = express();
app.use(express.json()); // possibilita transitar dados usando JSON

// Configuração do Banco de dados
const { connection, authenticate } = require("./database/database");
authenticate(connection); // efetivar a conexão
const Cliente = require("./database/cliente"); // configurar o model da aplicação
const Endereco = require("./database/endereco");

// Definição de rotas

// rota para listar todos os clientes
app.get("/clientes", async (req, res) => {
    // SELECT * FROM clientes:
    const listaClientes = await Cliente.findAll();
    res.json(listaClientes);
})

// /clientes/5
app.get("/clientes/:id", async (req, res) => {
    // SELECT * FROM clientes WHERE id = 5:
    const cliente = await Cliente.findOne({ where: {id: req.params.id}, include: [Endereco], });

    if(cliente) {
        res.json(cliente)
    } else {
        res.status(404).json({message: "Cliente não encontrado!"})
    }
});


// rota para adicionar novo cliente
app.post("/clientes", async (req, res) => {
    // coletar os dados do req.body:
    const { nome, email, telefone, endereco } = req.body;
    // console.log(nome, email, telefone);
    // res.json("Recebido")

    // chamar o model e a função create:
    try {
        //dentro de 'novo' estará o objeto criado
        const novo = await Cliente.create(
            {nome, email, telefone, endereco}, // eu tenho que dizer para o create o que tem que inserir
            {include: [Endereco]} // coloca no include o model que quer inserir junto com o cliente
            );
        res.status(201).json(novo);
    } catch (err) {
        res.status(500).json({message: "Um erro aconteceu."});
    }
});   



// Escuta de eventos (listen)
app.listen(3000, () => {
    connection.sync({ force: true }) // o force é para não salvar os dados de teste enquanto estamos modelando
    console.log("Servidor rodando em http://localhost:3000")
})
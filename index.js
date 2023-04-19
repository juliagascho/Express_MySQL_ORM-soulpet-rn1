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
const Pet = require("./database/pet");


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

// listar pets
app.get("/pets", async (req, res) => {
    const listaPets = await Pet.findAll();
    res.json(listaPets);
})

// /pets/1
app.get("/pets/:id", async (req, res) => {    
    const pet = await Pet.findOne({ where: {id: req.params.id}});
    if(pet) {
        res.json(pet)
    } else {
        res.status(404).json({message: "Pet não encontrado!"})
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

// // rota para adicionar um novo pet:
// app.post("/pets", async (req, res) => {
//     const { nome, tipo, porte, dataNasc, clienteId } = req.body;
//     try {
//         const novoPet = await Pet.create(
//             { nome, tipo, porte, dataNasc, clienteId }
//         )
//         res.status(201).json({message: "Novo pet adicionado: ", pet: novoPet.toJSON()});
//     } catch (err) {
//         res.status(500).json({message: "Um erro aconteceu."});
//     };
// });

// rota para adicionar um novo pet:
//correção profe, com validação, que não é necessária pq com o codigo acima ele ja nao deixa adicionar em um id nao existente:
app.post("/pets", async (req, res) => {
    const { nome, tipo, porte, dataNasc, clienteId } = req.body;

    try {
        const cliente = await Cliente.findByPk(clienteId); // nova função findByPk
        if(cliente) {
            const pet = await Pet.create({ nome, tipo, porte, dataNasc, clienteId });
            res.status(201).json(pet);
        } else {
            res.status(404).json({ message: "Cliente não encontrado." });
        }        
    } catch (err) {
        res.status(500).json({message: "Um erro aconteceu."});
    };
});


// rota para atualizar um cliente
app.put("/clientes/:id", async (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    const { id } = req.params;
    try {
        const cliente = await Cliente.findOne({ where: { id } });
        if (cliente) {
            // se o endereço existir vai atualizar ele, e se não existir vai atualizar apenas o restante dos dados
            if(endereco){ 
                await Endereco.update(endereco, { where: { clienteId: id }}); // update sempre precisa ter where
                ////quando o clienteId de Endereco for = id do cliente fornecido em /clientes/:id
            }
            //depois de verificar se tem endereço verifica se há atualização nas demais informações
            //quando o clienteId de Cliente for = id do cliente fornecido em /clientes/:id
            await Cliente.update({ nome, email, telefone }, { where: { id }}); // a gente está implementando obrigatórios esses dados precisam ser passados, mas o sequelize consegue atualizar se a gente não passar todos esses dados.
            res.status(200).json({ message: "Cliente atualizado." });
        } else {
            //se não encontrar o cliente
            res.status(404).json({ message: "Cliente não encontrado." });
        }
    } catch (err) {
        //não consegue consultar o bd por algum motivo
        res.status(500).json({ message: "Um erro aconteceu." });
    }
})

// rota para atualizar um pet:
app.put("/pets/:id", async (req, res) => {
    // dados que virão no corpo JSON para atualizar:
    const { nome, tipo, dataNasc, porte } = req.body; 

    //primeiro ver se o pet existe: findOne ou findByPk
    // findByPk vai fazer um SELECT * FROM pets WHERE id = "req.params.id";    
    const pet = await Pet.findByPk(req.params.id); // se desestruturasse como no atualizar clientes, poderia usar apenas id aqui

    //dentro de pets ou vai ter o pet que está buscando, ou não vai ter nada
    // se pet for nulo, não existe pet com o id
    // se pet é null -> não existe o pet
    try {
        if(pet) {
            //atualiza
            // dentro do model Pet tem várias opções, para atualizar usa o update  
            // IMPORTANTE: indicar qual pet a ser atualizado 
            // UPDATE RECEBE 2 ARGUMENTOS: 1º DADOS NOVOS, 2º WHERE     
            await Pet.update({ nome, tipo, dataNasc, porte }, { where: { id: req.params.id } }); // where id = req.params.id (coluna da tabela)
            // outra maneira de fazer: await pet.update ({ nome, tipo, dataNasc, porte })
            res.status(200).json({ message: "Pet atualizado." });
        } else {
            // retorna 404
            // se id for inválido: a resposta ao cliente será essa
            res.status(404).json({ message: "Pet não encontrado." });
        }
    } catch (err) {
        // retorna 500
        // erro inesperado: mensagem será essa
        res.status(500).json({ message: "Um erro aconteceu." });
    }
})


// excluir um cliente
app.delete("/clientes/:id", async (req, res) => {
    const { id } = req.params;
    const cliente = await Cliente.findOne({ where: { id } }); // no where usa chaves pra colocar o id porque pode se usar varias condições dentro do where: https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#applying-where-clauses
    try {
        if(cliente){
            await cliente.destroy();
            res.status(200).json({ message: "Cliente removido." });
        } else {
            res.status(404).json({ message: "Cliente não encontrado." })
        }
    } catch (err) {
        res.status(500).json({ message: "Um erro aconteceu." });
    }    
});

//rota para deletar pet
// apenas verificar se o pet existe
app.delete("/pets/:id", async (req, res) => {
    //checar se o pet existe 
    const pet = await Pet.findByPk(req.params.id);
    try {
        if(pet) {
            //pet existe, podemos apagar
            await pet.destroy(); //não precisa passar nada, pq ele já sabe quem é o pet, objeto pet
            res.status(200).json({ message: "Pet removido." });
        } else {
            res.status(404).json({ message: "Pet não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ message: "Um erro aconteceu." });
    }    
});


// Escuta de eventos (listen)
app.listen(3000, () => {
    connection.sync({ force: true }) // o force é para não salvar os dados de teste enquanto estamos modelando
    console.log("Servidor rodando em http://localhost:3000")
})
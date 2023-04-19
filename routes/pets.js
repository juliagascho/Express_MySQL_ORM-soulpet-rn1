const Cliente = require("../database/cliente");
const Pet = require("../database/pet");

const { Router } = require("express");

// criar o grupo de rotas:
const router = Router();

// listar pets
router.get("/pets", async (req, res) => {
    const listaPets = await Pet.findAll();
    res.json(listaPets);
})

// /pets/1
router.get("/pets/:id", async (req, res) => {    
    const pet = await Pet.findOne({ where: {id: req.params.id}});
    if(pet) {
        res.json(pet)
    } else {
        res.status(404).json({message: "Pet não encontrado!"})
    }
});



// // rota para adicionar um novo pet:
// router.post("/pets", async (req, res) => {
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
router.post("/pets", async (req, res) => {
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



// rota para atualizar um pet:
router.put("/pets/:id", async (req, res) => {
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


//rota para deletar pet
// apenas verificar se o pet existe
router.delete("/pets/:id", async (req, res) => {
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


module.exports = router;
const Cliente = require("../database/cliente");
const Endereco = require("../database/endereco");

const { Router } = require("express");

// criar o grupo de rotas:
const router = Router();

// rota para listar todos os clientes
router.get("/clientes", async (req, res) => {
    // SELECT * FROM clientes:
    const listaClientes = await Cliente.findAll();
    res.json(listaClientes);
})

// /clientes/5
router.get("/clientes/:id", async (req, res) => {
    // SELECT * FROM clientes WHERE id = 5:
    const cliente = await Cliente.findOne({ where: {id: req.params.id}, include: [Endereco], });

    if(cliente) {
        res.json(cliente)
    } else {
        res.status(404).json({message: "Cliente não encontrado!"})
    }
});

// rota para adicionar novo cliente
router.post("/clientes", async (req, res) => {
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

// rota para atualizar um cliente
router.put("/clientes/:id", async (req, res) => {
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

// excluir um cliente
router.delete("/clientes/:id", async (req, res) => {
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


module.exports = router;

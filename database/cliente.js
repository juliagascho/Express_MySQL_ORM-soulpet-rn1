// modelo para gerar tabela de clientes no mysql
// mapeamento: cada propriedade vira coluna da tabela

// const cliente = {
//     nome: "José Almir", //VARCHAR
//     email: "jose.almir@gmail.com", //VARCHAR
//     telefone: "(88) 9-9999-9999" //VARCHAR
// }

//DataTypes =  serve para definir qual o tipo da coluna
const { DataTypes } = require("sequelize");
const { connection } = require("./database");

const  Cliente = connection.define("cliente", {
    //configurar a coluna nome:
    nome: {    
        // nome varchar not null    
        type: DataTypes.STRING(130),
        allowNull: false // equivale ao aplicar NOT NULL - não permite valor nulo 
    },
    email: {
        // email varchar unique not null
        type: DataTypes.STRING,
        allowNull: false, // equivale ao aplicar NOT NULL- não permite valor nulo 
        unique: true // não podem existir 2 clientes com mesmo email
    },
    telefone: {
        // telefone varchar not null
        type: DataTypes.STRING,
        allowNull: false // equivale ao aplicar NOT NULL - não permite valor nulo
    }
})

//relacionar dados no seguelize https://sequelize.org/docs/v6/core-concepts/model-basics/
// associação 1:1
// para 1:1 uma das tabelas tem que ter a chave estrangeira
const Endereco = require("./endereco");

Cliente.hasOne(Endereco, { onDelete: "CASCADE" }); // cliente tem um endereço
//CASCADE = apagar o cliente, faz o endereço associado a ele ser apagado junto
Endereco.belongsTo(Cliente); // endereço pertence a um cliente
// cliente tem um endereço
// Endereço ganha uma chave estrangeira (nome do model + Id) = cliendeId

module.exports = Cliente;

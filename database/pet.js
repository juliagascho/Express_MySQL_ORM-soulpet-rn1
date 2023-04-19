const { DataTypes } = require("sequelize");
const { connection } = require("./database");
const Cliente = require("./cliente");

const Pet = connection.define("pet", {
    nome: {
        type: DataTypes.STRING(130),
        allowNull: false,
    },
    tipo: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    porte: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    dataNasc: {
        type: DataTypes.DATEONLY,
    }
});

//relacionando pet com cliente:
//relacionamento 1:n
// um cliente pode ter muitos pets
Cliente.hasMany(Pet, { onDelete: "CASCADE" }); //cliente pode ter vários pets
// quando o cliente for deletado, todos os pets dele serãod eletados também
Pet.belongsTo(Cliente); // um pet pertence a um cliente

// relacionamento pet e cliente não deve ser feito dentro de cliente porque 1 cliente pode ter muitos pets
// a chave vai no pet, porque 1 cliente, com apenas 1 id, pode ter varios pets com ids diferentes
// se o cliente tiver mais de 1 pet, e fazer esse relacionamento dentro de clientes, ao construir a tabela, iria aparecer mais de 1 cliente com o mesmo id -> 1 cliente para cada pet, repetiria os ids dos clientes

module.exports = Pet;
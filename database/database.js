// database.js = arquivo de conexão com o banco de dados
// ele vai ler as variáveis de ambiente e tentar conectar ao MySQL

const { Sequelize } = require("sequelize");

// criamos o objeto de conexão
const connection = new Sequelize(
    process.env.DB_NAME, // nome reservado para o database
    process.env.DB_USER, // usuário reservado para conexão
    process.env.DB_PASSWORD, // senha para acesso
    {
        host: process.env.DB_HOST, // endereço (banco local)
        dialect: 'mysql'        
    }
);

// Estabelecer conexão usando o objeto
async function authenticate (connection) {
    try {
        // tenta estabelecer conexão com banco de dados - usar as informações passadas acima
        await connection.authenticate(); 
        console.log("Conexão estabelecida");
    } catch (err) {
        // err = objeto que guarda detalhes sobre o erro que aconteceu
        console.log("Um erro aconteceu", err);
    }
}

module.exports = { connection, authenticate };
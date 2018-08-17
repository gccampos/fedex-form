var config = {
    database: {
        host: 'localhost', // Endereço
        user: 'root', // Usuário
        password: 'root', // Senha
        port: 3306, // Porta
        db: 'fedexform' // Nome
    },
    server: { //Servidor Express
        host: '127.0.0.1', //Endereço
        port: '3000' //Porta
    }
};
//Exporta variável de configuração
module.exports = config;
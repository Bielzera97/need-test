const fastify = require('fastify')({ logger: true });
require('dotenv').config();

// Configurar conexão com PostgreSQL
fastify.register(require('@fastify/postgres'), {
    connectionString: process.env.DATABASE_URL
});

// Registrar rotas
fastify.register(require('./routes/usuarios'));

// Iniciar o servidor
const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3000 });
        console.log(`Servidor rodando na porta ${process.env.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
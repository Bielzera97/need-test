require('dotenv').config();
const fastify = require('fastify')({ logger: true });

// Configurar Swagger
fastify.register(require('@fastify/swagger'), {
    openapi: {
        info: {
            title: 'Minha API',
            description: 'API para gerenciar usuários',
            version: '1.0.0'
        },
        servers: [
            { url: `http://localhost:${process.env.PORT || 3636}`, description: 'Servidor local' }
        ]
    }
}).after((err) => {
    if (err) {
        console.error('Erro ao registrar Swagger:', err);
        process.exit(1);
    }
    console.log('Swagger registrado com sucesso');
});

// Configurar Swagger UI
fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    }
}).after((err) => {
    if (err) {
        console.error('Erro ao registrar Swagger UI:', err);
        process.exit(1);
    }
    console.log('Swagger UI registrado com sucesso');
});

// Configurar conexão com PostgreSQL
fastify.register(require('@fastify/postgres'), {
    connectionString: process.env.DATABASE_URL
}).after((err) => {
    if (err) {
        console.error('Erro ao registrar PostgreSQL:', err);
        process.exit(1);
    }
    console.log('PostgreSQL registrado com sucesso');
});

// Testar conexão com o banco
fastify.ready(async () => {
    try {
        const client = await fastify.pg.connect();
        console.log('Conexão com o banco de dados bem-sucedida');
        await client.release();
    } catch (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    }
});

// Registrar rotas após o Swagger estar completamente carregado
fastify.register(require('./routes/usuarios')).after((err) => {
    if (err) {
        console.error('Erro ao registrar rotas:', err);
        process.exit(1);
    }
    console.log('Rotas de usuários registradas com sucesso');
});

// Manipulador de erros
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(error.statusCode || 500).send({
        error: error.name || 'Erro interno do servidor',
        message: error.message
    });
});

// Iniciar o servidor
const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3636 });
        console.log(`Servidor rodando na porta ${process.env.PORT || 3636}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
const fp = require('fastify-plugin');

async function usuariosRoutes(fastify, options) {
    // Esquema do usuário para validação e documentação
    const usuarioSchema = {
        type: 'object',
        required: ['nome', 'email'],
        properties: {
            id: { type: 'integer', description: 'ID do usuário' },
            nome: { type: 'string', minLength: 1, description: 'Nome do usuário' },
            email: { type: 'string', format: 'email', description: 'Email do usuário' }
        }
    };

    // Esquema de erro para 404
    const notFoundSchema = {
        type: 'object',
        properties: {
            message: { type: 'string', description: 'Mensagem de erro' }
        }
    };

    // GET: Listar todos os usuários
    fastify.get('/usuarios', {
        schema: {
            description: 'Lista todos os usuários',
            tags: ['Usuários'],
            response: {
                200: {
                    description: 'Lista de usuários',
                    type: 'array',
                    items: usuarioSchema
                }
            }
        }
    }, async (request, reply) => {
        try {
            const client = await fastify.pg.connect();
            const { rows } = await client.query('SELECT * FROM usuarios');
            await client.release();
            return rows;
        } catch (err) {
            throw new Error(err.message);
        }
    });

    // POST: Criar um usuário
    fastify.post('/usuarios', {
        schema: {
            description: 'Cria um novo usuário',
            tags: ['Usuários'],
            body: usuarioSchema,
            response: {
                200: usuarioSchema,
                400: notFoundSchema
            }
        }
    }, async (request, reply) => {
        const { nome, email } = request.body;
        try {
            const client = await fastify.pg.connect();
            const { rows } = await client.query(
                'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
                [nome, email]
            );
            await client.release();
            return rows[0];
        } catch (err) {
            throw new Error(err.message);
        }
    });

    // PUT: Atualizar um usuário
    fastify.put('/usuarios/:id', {
        schema: {
            description: 'Atualiza um usuário existente',
            tags: ['Usuários'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer', description: 'ID do usuário' }
                }
            },
            body: usuarioSchema,
            response: {
                200: usuarioSchema,
                404: notFoundSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { nome, email } = request.body;
        try {
            const client = await fastify.pg.connect();
            const { rows } = await client.query(
                'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *',
                [nome, email, id]
            );
            await client.release();
            return rows[0] || { message: 'Usuário não encontrado' };
        } catch (err) {
            throw new Error(err.message);
        }
    });

    // DELETE: Deletar um usuário
    fastify.delete('/usuarios/:id', {
        schema: {
            description: 'Deleta um usuário',
            tags: ['Usuários'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer', description: 'ID do usuário' }
                }
            },
            response: {
                200: notFoundSchema,
                404: notFoundSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            const client = await fastify.pg.connect();
            const { rowCount } = await client.query('DELETE FROM usuarios WHERE id = $1', [id]);
            await client.release();
            return rowCount > 0 ? { message: 'Usuário deletado' } : { message: 'Usuário não encontrado' };
        } catch (err) {
            throw new Error(err.message);
        }
    });
}

module.exports = fp(usuariosRoutes);
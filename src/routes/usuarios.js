async function usuariosRoutes(fastify, options) {
    // GET: Listar todos os usuários
    fastify.get('/usuarios', async (request, reply) => {
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
    fastify.post('/usuarios', async (request, reply) => {
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
    fastify.put('/usuarios/:id', async (request, reply) => {
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
    fastify.delete('/usuarios/:id', async (request, reply) => {
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

module.exports = usuariosRoutes;
const fastify = require('fastify')({ logger: false });

fastify.get('/', async (_req, reply) => {
  reply.send({ message: 'Hello World' })
});

const schema = {
  response: {
    default: {
      type: 'object',
      properties: {
        hello: {
          type: 'string',
        }
      }
    },
  },
};

fastify.get('/schema', schema, (_req, reply) => {
  reply.send({ hello: 'world' });
});

fastify.get('/resource', (_req, reply) => {
  // get cpuUsage from the current process
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();
  reply.send({ cpu: cpuUsage, memory: memoryUsage });
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});


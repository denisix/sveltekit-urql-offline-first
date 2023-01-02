const mercurius = require('mercurius')
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const { schema, resolvers, emitter } = require('./schema')
const { PORT: port = 3000, NODE_ENV } = process.env

const app = Fastify({ logger: false })

const start = async () => {
  try {
    await app.register(cors, { origin: true })
    app.register(mercurius, {
      schema,
      resolvers,
      graphiql: NODE_ENV !== 'production'
    })

    console.log('- listen on port', port)
    await app.listen({ host: '0.0.0.0', port })
  } catch (error) {
    console.log('- catch:', error)
    app.log.error(error)
  }
}

start()

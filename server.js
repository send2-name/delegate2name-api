import 'dotenv/config';
import Fastify from 'fastify';
import { Liquid } from 'liquidjs';
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";

import { index } from './controllers/public.js';

const app = Fastify({
  logger: true
});

// set up templating engine
const __dirname = path.resolve(path.dirname(""))

const liquid = new Liquid({
  root: path.join(__dirname, "templates"),
  extname: ".liquid",
});

// register plugins
app.register(fastifyView, {
  engine: {
    liquid: liquid,
  },
});

app.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
  prefix: "/static/",
});

// Add a preHandler hook to set CORS headers for all routes
app.addHook('preHandler', (request, reply, done) => {
  // Set the appropriate CORS headers
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  reply.header('Access-Control-Allow-Headers', 'Content-Type');

  // Continue processing the request
  done();
});

// PUBLIC
app.get('/', index);

// run the server
app.listen({ port: process.env.PORT || 3000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
});
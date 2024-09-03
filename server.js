import 'dotenv/config';
import Fastify from 'fastify';
import { Liquid } from 'liquidjs';
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";

import { index } from './controllers/public.js';

import { 
  arbDelegateConfirm,
  arbDelegateDelegate,
  arbMyDelegateShare,
  arbDelegateStart1, 
  arbDelegateTxCallback,
  arbDelegateTxData,
} from './controllers/delegate/arb/frames.js';

import { 
  delegateArbConfirm, 
  delegateArbDelegate, 
  delegateArbNoDelegate,
  delegateArbShare,
  delegateArbSuccess,
} from './controllers/delegate/arb/images.js';

import { 
  opDelegateConfirm,
  opDelegateDelegate,
  opMyDelegateShare,
  opDelegateStart1, 
  opDelegateTxCallback,
  opDelegateTxData,
} from './controllers/delegate/op/frames.js';

import { 
  delegateOpConfirm, 
  delegateOpDelegate, 
  delegateOpNoDelegate,
  delegateOpShare,
  delegateOpSuccess,
} from './controllers/delegate/op/images.js';

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

// ARBITRUM DELEGATE FRAMES
app.get('/frame/delegate/arb/confirm', arbDelegateConfirm);
app.post('/frame/delegate/arb/confirm', arbDelegateConfirm);
app.post('/frame/delegate/arb/delegate', arbDelegateDelegate);
app.get('/frame/delegate/arb/delegate', arbDelegateDelegate);
app.get('/frame/delegate/arb/share', arbMyDelegateShare);
app.get('/frame/delegate/arb/start-1', arbDelegateStart1);
app.post('/frame/delegate/arb/start-1', arbDelegateStart1);
app.post('/frame/delegate/arb/tx-callback', arbDelegateTxCallback);
app.post('/frame/delegate/arb/tx-data', arbDelegateTxData);

// ARBITRUM DELEGATE IMAGES
app.get('/image/arb/confirm', delegateArbConfirm);
app.get('/image/arb/delegate', delegateArbDelegate);
app.get('/image/arb/no-delegate', delegateArbNoDelegate);
app.get('/image/arb/share', delegateArbShare);
app.get('/image/arb/success', delegateArbSuccess);

// OPTIMISM DELEGATE FRAMES
app.get('/frame/delegate/op/confirm', opDelegateConfirm);
app.post('/frame/delegate/op/confirm', opDelegateConfirm);
app.post('/frame/delegate/op/delegate', opDelegateDelegate);
app.get('/frame/delegate/op/delegate', opDelegateDelegate);
app.get('/frame/delegate/op/share', opMyDelegateShare);
app.get('/frame/delegate/op/start-1', opDelegateStart1);
app.post('/frame/delegate/op/start-1', opDelegateStart1);
app.post('/frame/delegate/op/tx-callback', opDelegateTxCallback);
app.post('/frame/delegate/op/tx-data', opDelegateTxData);

// OPTIMISM DELEGATE IMAGES
app.get('/image/op/confirm', delegateOpConfirm);
app.get('/image/op/delegate', delegateOpDelegate);
app.get('/image/op/no-delegate', delegateOpNoDelegate);
app.get('/image/op/share', delegateOpShare);
app.get('/image/op/success', delegateOpSuccess);

// run the server
app.listen({ port: process.env.PORT || 3000 }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
});
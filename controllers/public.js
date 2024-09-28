export function index(request, reply) {
  if (request.headers.host.startsWith("arb.")) {
    return reply.view("./templates/index-arb.liquid");
  } else if (request.headers.host.startsWith("op.")) {
    return reply.view("./templates/index-op.liquid");
  }

  return reply.view("./templates/index.liquid");
}

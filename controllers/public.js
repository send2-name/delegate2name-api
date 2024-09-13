export function index(request, reply) {
  // if subdomain (arb.delegate2.name) starts with "arb" then render index-arb.liquid, otherwise render index.liquid  
  if (request.headers.host.startsWith("arb.")) {
    return reply.view("./templates/index-arb.liquid");
  }

  return reply.view("./templates/index.liquid");
}

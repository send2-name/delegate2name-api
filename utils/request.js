export function getPageUrl(request) {
  let host = request.headers.host;
  const path = request.raw.url;

  if (host.includes("localhost")) {
    host = "http://" + host;
    return { pageUrl: host + path, host };
  }

  host = "https://" + host;

  return { pageUrl: host + path, host };
}
// Redirect all Pages requests before serving static files or running legacy APIs.
export function onRequest() {
  return Response.redirect('https://civic.vtaiwan.tw/', 301);
}

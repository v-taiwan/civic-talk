/**
 * Civic Talk has moved to https://civic.vtaiwan.tw/.
 * Permanently redirect every request to the new homepage.
 */
export default {
  fetch() {
    return Response.redirect('https://civic.vtaiwan.tw/', 301);
  },
};

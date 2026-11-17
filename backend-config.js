// PawPark 2027 backend settings. Public values ONLY, no API secrets.
// LIVE=false keeps demo behavior until independent backend, email and admin QA pass.
window.PAWPARK_BACKEND = Object.freeze({
  live: false,
  supabaseUrl: "",
  publishableKey: "",
  submitFunction: "pawpark-submit",
  adminEmail: "info@pawapp.net",
  turnstileSiteKey: ""
});

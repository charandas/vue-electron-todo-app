export default function configureRoutes (server) {
  server.on('get-snoozed', (req, next) => {
    next(null, global.snoozed);
  });
}

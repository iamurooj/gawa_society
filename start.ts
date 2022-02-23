import express = require("express");
require("express-async-errors");
import path from "path";
import { Server } from "http";
import logger from "loglevel";
import { getData } from "./data";

function startServer({ port = process.env.PORT } = {}) {
  //const cors = require('cors');
  const app = express();
  // Serve the static files from the React app
  app.use(express.static(path.join(__dirname, "../build")));

  app.use(express.json());
  app.use("/api", getData());
  // add the generic error handler just in case errors are missed by middleware
  app.use(errorMiddleware);

  // Handles any requests that don't match the ones above
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"));
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`
      🚀 Server ready at: http://localhost:${port}
      ⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);

      // this ensures that we properly close the server when the program exists
      setupCloseOnExit(server);

      // resolve the whole promise with the express server
      resolve(server);
    });
  });
}
// here's our generic error handler for situations where we didn't handle
// errors properly
function errorMiddleware(
  error: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (res.headersSent) {
    next(error);
  } else {
    logger.error(error);
    res.status(500);
    res.json({
      message: error.message,
      // we only add a `stack` property in non-production environments
      ...(process.env.NODE_ENV === "production"
        ? null
        : { stack: error.stack }),
    });
  }
}

// ensures we close the server in the event of an error.
function setupCloseOnExit(server: Server) {
  async function exitHandler(options = { exit: false }) {
    server.close((err?: Error) => {
      if (err) {
        logger.warn("Something went wrong closing the server", err.stack);
      } else {
        logger.info("Server successfully closed");
      }

      if (options.exit) process.exit();
    });
  }
  // do something when app is closing
  process.on("exit", exitHandler);
  // catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}
export { startServer };
  function cors(): any {
    throw new Error("Function not implemented.");
  }


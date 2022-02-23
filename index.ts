import logger from "loglevel";
import { startServer } from "./start";
logger.setLevel("info");
startServer({ port: process.env.PORT || "4000" });

import app from "./application.js";
import dotenv from "dotenv";
import { logger } from "./utility/loggerService.js";
import config from "./configuration/config.js";

dotenv.config();

app.listen(3030, () => {
  logger(config.loggingLevel.INFO, "application started and running in {0}", `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});



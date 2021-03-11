import logger from "futurosenso-log";

const levels = {
  "trace": "TRACE",
  "debug": "DEBUG",
  "info": "INFO",
  "warn": "WARN",
  "error": "ERROR",
  "fatal": "FATAL",
};

const logAt = (level, message = "") => {
  logger.log(`${level}:  ${message}`);
}

export {
  logAt,
  levels
};
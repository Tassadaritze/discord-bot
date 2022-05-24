import winston from "winston";

export default {
    name: "error",
    execute(error: Error) {
        winston.error(error);
    }
}

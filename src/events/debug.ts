import winston from "winston";

export default {
    name: "debug",
    execute(info: string) {
        winston.debug(info);
    }
};

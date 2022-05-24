import * as util from "util"
import winston from "winston";
import "winston-daily-rotate-file";

const initialize = () => {
    winston.configure({
        format: winston.format.combine(
            winston.format.colorize({ colors: { error: "red", info: "cyan", debug: "magenta", silly: "brightGreen" } }),
            winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${typeof info.message === "object" ? util.inspect(info.message) : info.message}`)
        ),
        level: "silly",
        transports: [
            new winston.transports.Console(),
            new winston.transports.DailyRotateFile({
                format: winston.format.uncolorize(),
                dirname: "./logs",
                filename: "%DATE%.log",
                zippedArchive: true,
                maxFiles: "7d"
            })
        ]
    });

    /*
    winston.error("error test");
    winston.info("info test");
    winston.debug("debug test");
    winston.silly("silly test");
    winston.info({ nested: { object: "test" } });
     */
}

export default initialize;
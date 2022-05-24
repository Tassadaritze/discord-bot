import winston from "winston";
import "winston-daily-rotate-file";

const initialize = () => {
    winston.configure({
        format: winston.format.combine(
            winston.format.colorize({ colors: { error: "red", info: "blue", debug: "yellow" } }),
            winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
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
}

export default initialize;
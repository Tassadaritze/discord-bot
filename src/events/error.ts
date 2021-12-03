export default {
    name: "error",
    execute(error: Error) {
        console.error("[ERROR]", error);
    }
}

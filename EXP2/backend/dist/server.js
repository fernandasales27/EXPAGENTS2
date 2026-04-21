"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const scheduler_1 = require("./infrastructure/scheduler");
const port = Number(process.env.PORT ?? 3000);
const scheduler = (0, scheduler_1.createEmailDispatchScheduler)(app_1.emailDispatchService, process.env);
scheduler.start();
app_1.app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
process.on('SIGINT', () => {
    scheduler.stop();
});
process.on('SIGTERM', () => {
    scheduler.stop();
});

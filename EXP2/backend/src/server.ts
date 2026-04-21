import 'dotenv/config';
import { app, emailDispatchService } from './app';
import { createEmailDispatchScheduler } from './infrastructure/scheduler';

const port = Number(process.env.PORT ?? 3000);
const scheduler = createEmailDispatchScheduler(emailDispatchService, process.env);

scheduler.start();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
  scheduler.stop();
});

process.on('SIGTERM', () => {
  scheduler.stop();
});

import 'dotenv/config';
import { logAt, levels } from './log';
import { startConsumer } from './pubsub';

logAt(levels.info, "SAILTHRU INTEGRATION SERVICE booted up");

startConsumer();

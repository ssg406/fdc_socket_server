import { loggerFactory } from 'visible_logger';
import io from './server';
import dotenv from 'dotenv';

const logger = loggerFactory({ hideLogsDuringTest: true });

dotenv.config();


io.listen(3000);
logger.info(`Listening on port ${process.env.PORT}`, 'Server');

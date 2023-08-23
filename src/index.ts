import { loggerFactory } from 'visible_logger';
import io from './server';
import dotenv from 'dotenv';


if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
    dotenv.config();
}

const logger = loggerFactory({ hideLogsDuringTest: true });

const port = parseInt(process.env.PORT!) || 3000;

io.listen(port);

logger.info(`Server is listening on port ${port}`, 'Server')

import dotenv from 'dotenv';
// load env variables from .env
dotenv.config();

// setup Instrumentation
import { setupInstrumentation } from './instrumentation';
setupInstrumentation();

// regular express stuff
import express, { Express, Request, Response } from 'express';

// local imports
import logger from './logger';
import { makeAPICall } from './invoker';

const app: Express = express();
app.use(express.json());

const port = process.env.PORT;

/**
 * A test endpoint where you can pass path param as 'valid' or 'invalid'
 */
app.get('/test/:scenario', async (req: Request, res: Response) => {
  const scenario = req.params.scenario === 'valid' ? 'valid' : 'invalid';
  logger.info(`Executing scenario: ${scenario}`);
  const data = await makeAPICall({
    method: 'POST',
    url: `/${scenario}`,
    payload: {
      name: 'tester1',
    },
  });
  res.status(200).json(data);
});

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  const result = getRandomNumber(1, 6);
  logger.info(`Rolled dice {dice}`, { dice: result });
  res.send(result.toString());
});

// simulate an endpoint that returns valid data
// start listening
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

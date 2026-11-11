
import 'dotenv/config';

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const url =
  'https://us10sap02.hobas.com:1443' +
  '/sap/bc/zapi/execute/GET_SALES_ANALYSIS' +
  '?sap-client=100';

const rl = createInterface({
  input: stdin,
  output: stdout
});

try {
  const username = await rl.question('Usuario SAP: ');

  const password = process.env.SAP_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Falta usuario o SAP_PASSWORD en el archivo .env'
    );
  }

  const authorization = Buffer.from(
    `${username}:${password}`,
    'utf8'
  ).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      salesOrders: ['0000001234']
    }),
    redirect: 'error',
    signal: AbortSignal.timeout(15000)
  });

  const body = await response.text();

  console.log('HTTP:', response.status);
  console.log(
    'Handler:',
    response.headers.get('x-zapi-handler')
  );
  console.log(
    'Content-Length:',
    response.headers.get('content-length')
  );
  console.log('Bytes recibidos:', Buffer.byteLength(body));
  console.log('Body:', body);

} catch (error) {
  console.error('Error:', error.message);

} finally {
  rl.close();
}

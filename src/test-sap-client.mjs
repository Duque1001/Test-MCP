
import { sapPost } from './sap/sap-client.js';

async function main() {
  const path =
    '/sap/bc/zapi/execute/GET_SALES_ANALYSIS';

  const payload = {
    salesOrders: ['0000001234']
  };

  try {
    const result = await sapPost(path, payload);

    console.log('HTTP:', result.status);
    console.log('OK:', result.ok);
    console.log(
      'Respuesta SAP:',
      JSON.stringify(result.data, null, 2)
    );

  } catch (error) {
    console.error(
      'Error de comunicacion:',
      error.message
    );

    process.exitCode = 1;
  }
}

main();

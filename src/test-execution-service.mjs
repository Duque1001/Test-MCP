
import { executeSapTool }
  from './sap/execution-service.js';

async function main() {
  try {
    const result = await executeSapTool(
      'GET_SALES_ANALYSIS',
      {
        salesOrders: ['1341000013']
      }
    );

    console.log('Resultado de ejecucion SAP:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(
      'Error:',
      error.message
    );

    process.exitCode = 1;
  }
}

main();

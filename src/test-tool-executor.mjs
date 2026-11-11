
import { executeMcpTool }
  from './mcp/tool-executor.js';

async function main() {
  const result = await executeMcpTool(
    'GET_SALES_ANALYSIS',
    {
      salesOrders: ['0000001234']
    }
  );

  console.log(
    'Resultado MCP:',
    JSON.stringify(result, null, 2)
  );
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exitCode = 1;
});

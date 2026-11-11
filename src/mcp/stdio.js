
import { StdioServerTransport }
  from '@modelcontextprotocol/server/stdio';

import { createMcpServer } from './mcp-server.js';

// Inicializar el servidor MCP.
async function main() {
  const server = await createMcpServer();

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('[MCP] Servidor SAP iniciado');
}

main().catch((error) => {
  console.error(
    '[MCP] Error inicializando servidor:',
    error.message
  );

  process.exitCode = 1;
});

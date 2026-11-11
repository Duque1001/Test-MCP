
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod/v4';

import { getSapTools } from '../sap/catalog-service.js';
import { registerSapTools } from './tool-registry.js';

import { startCatalogSync } from './catalog-sync.js';

// Crear y preparar el servidor MCP.

export async function createMcpServer() {
  const server = new McpServer({
    name: 'sap-dynamic-mcp',
    version: '1.0.0'
  });

  // Herramienta fija de diagnostico.
  registerCatalogTool(server);

  // Cargar herramientas iniciales desde SAP.
  const registry = await registerSapTools(server);

  // Sincronizar automaticamente el catalogo.
  startCatalogSync(registry);

  return server;
}

// Herramienta de diagnostico del catalogo SAP.
function registerCatalogTool(server) {
  server.registerTool(
    'get_sap_catalog',
    {
      title: 'Consultar catalogo SAP',
      description:
        'Consulta las herramientas disponibles en SAP',
      inputSchema: z.object({})
    },
    async () => {
      try {
        const tools = await getSapTools();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total: tools.length,
                tools: tools.map((tool) => ({
                  name: tool.name,
                  description: tool.description
                }))
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error('[MCP] Error de catalogo:', error.message);

        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'No fue posible consultar SAP'
            }
          ]
        };
      }
    }
  );
}

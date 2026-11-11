
import { fromJsonSchema } from '@modelcontextprotocol/server';

import { getSapTools } from '../sap/catalog-service.js';

import { executeMcpTool } from './tool-executor.js';

// Validar metadatos basicos del catalogo SAP.
function validateTool(tool) {
  return (
    tool &&
    typeof tool.name === 'string' &&
    /^[A-Za-z][A-Za-z0-9_]{0,59}$/.test(tool.name) &&
    typeof tool.description === 'string' &&
    tool.description.trim().length > 0 &&
    tool.inputSchema?.type === 'object' &&
    tool.inputSchema.properties !== null &&
    typeof tool.inputSchema.properties === 'object' &&
    !Array.isArray(tool.inputSchema.properties)
  );
}

// Administrar las herramientas dinamicas.
export class SapToolRegistry {
  constructor(server) {
    this.server = server;
    this.registered = new Map();
  }

  // Registrar una herramienta MCP.

    addTool(tool, signature) {
    const handle = this.server.registerTool(
        tool.name,
        {
        title: tool.name,
        description: tool.description,
        inputSchema: fromJsonSchema(tool.inputSchema)
        },

        async (parameters) => {
        return executeMcpTool(
            tool.name,
            parameters
        );
        }
    );

    this.registered.set(tool.name, {
        handle,
        signature
    });

    console.error(
        `[MCP] Herramienta registrada: ${tool.name}`
    );
    }

  // Retirar una herramienta del servidor.
  removeTool(name) {
    const current = this.registered.get(name);

    if (!current) {
      return;
    }

    current.handle.remove();
    this.registered.delete(name);
  }

  // Comparar el catalogo nuevo con el existente.
  synchronize(tools) {
    if (!Array.isArray(tools)) {
      throw new Error('Catalogo SAP invalido');
    }

    if (tools.length > 100) {
      throw new Error('Catalogo supera el limite de herramientas');
    }

    const incoming = new Map();

    // Validar el catalogo completo antes de aplicar cambios.
    for (const tool of tools) {
      if (!validateTool(tool)) {
        throw new Error('Herramienta SAP invalida');
      }

      if (tool.name.toLowerCase() === 'get_sap_catalog') {
        throw new Error('Nombre reservado para diagnostico');
      }

      if (incoming.has(tool.name)) {
        throw new Error('Herramienta SAP duplicada');
      }

      incoming.set(tool.name, tool);
    }

    const result = {
      changed: false,
      added: 0,
      updated: 0,
      removed: 0
    };

    // Actualizar herramientas nuevas o modificadas.
    for (const [name, tool] of incoming) {
      const signature = JSON.stringify(tool);
      const current = this.registered.get(name);

      if (!current) {
        this.addTool(tool, signature);
        result.added++;
        continue;
      }

      if (current.signature !== signature) {
        // Volver a registrar cuando cambian metadatos
        // o la definicion del JSON Schema.
        this.removeTool(name);
        this.addTool(tool, signature);
        result.updated++;
      }
    }

    // Retirar las herramientas desactivadas en SAP.
    for (const name of [...this.registered.keys()]) {
      if (!incoming.has(name)) {
        this.removeTool(name);
        result.removed++;
      }
    }

    result.changed =
      result.added > 0 ||
      result.updated > 0 ||
      result.removed > 0;

    return result;
  }
}

// Registrar el catalogo inicial.
export async function registerSapTools(server) {
  const registry = new SapToolRegistry(server);

  const tools = await getSapTools();

  registry.synchronize(tools);

  console.error(
    `[MCP] Herramientas SAP registradas: ${registry.registered.size}`
  );

  return registry;
}

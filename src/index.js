import { environment } from './config/environment.js';
import { getSapTools } from './sap/catalog-service.js';

// Punto de entrada para las pruebas iniciales del MCP.
async function main() {
  console.log('====================================');
  console.log(' MCP DINAMICO - SAP');
  console.log('====================================');

  console.log('Mandante SAP:', environment.sap.client);
  console.log('Endpoint:', environment.sap.catalogPath);

  try {
    const tools = await getSapTools();

    console.log('Conexion y consulta del catalogo correctas');
    console.log('Herramientas encontradas:', tools.length);

    for (const tool of tools) {
      console.log(`- ${tool.name}`);
    }
  } catch (error) {
    console.error('Error consultando SAP:', error.message);
    process.exitCode = 1;
  }
}

main();
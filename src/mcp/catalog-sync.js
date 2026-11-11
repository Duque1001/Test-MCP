
import { getSapTools } from '../sap/catalog-service.js';

// Intervalo de sincronizacion del catalogo.
const SYNC_INTERVAL_MS = 30000;

// Consultar SAP y actualizar las herramientas registradas.
export function startCatalogSync(toolRegistry) {
  let synchronizing = false;

  async function synchronize() {
    if (synchronizing) {
      return;
    }

    synchronizing = true;

    try {
      const tools = await getSapTools();

      const result = toolRegistry.synchronize(tools);

      if (result.changed) {
        console.error(
          `[MCP] Catalogo actualizado. ` +
          `Agregadas: ${result.added}, ` +
          `Modificadas: ${result.updated}, ` +
          `Retiradas: ${result.removed}`
        );
      }

    } catch (error) {
      // Conservar el catalogo conocido.
      // Las herramientas siguen sin ejecucion habilitada.
      console.error(
        '[MCP] Error sincronizando catalogo:',
        error.message
      );
    } finally {
      synchronizing = false;
    }
  }

  const timer = setInterval(
    synchronize,
    SYNC_INTERVAL_MS
  );

  console.error(
    '[MCP] Sincronizacion automatica activada'
  );

  return () => clearInterval(timer);
}


import { environment } from '../config/environment.js';
import { executeSapTool } from '../sap/execution-service.js';

// Construir una respuesta estandar para MCP.
function buildMcpResponse(data, isError = false) {
  return {
    isError,
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

// Responder cuando la ejecucion esta deshabilitada.
function buildDisabledResponse() {
  return buildMcpResponse(
    {
      success: false,
      code: 'EXECUTION_DISABLED',
      message: 'La ejecucion SAP no esta habilitada'
    },
    true
  );
}

// Ejecutar una herramienta SAP de forma controlada.
export async function executeMcpTool(
  toolName,
  parameters
) {
  // Bloquear antes de realizar cualquier llamada HTTP.
  if (!environment.execution.enabled) {
    return buildDisabledResponse();
  }

  try {
    const result = await executeSapTool(
      toolName,
      parameters
    );

    // SAP conserva la decision final de autorizacion.
    if (!result.success) {
      return buildMcpResponse(
        {
          success: false,
          httpStatus: result.httpStatus,
          error: result.data
        },
        true
      );
    }

    return buildMcpResponse(result.data);

  } catch (error) {
    console.error(
      '[MCP] Error ejecutando herramienta:',
      error.message
    );

    return buildMcpResponse(
      {
        success: false,
        code: 'EXECUTION_ERROR',
        message: 'No fue posible procesar la solicitud SAP'
      },
      true
    );
  }
}

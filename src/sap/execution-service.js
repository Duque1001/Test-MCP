
import { sapPost } from './sap-client.js';

const EXECUTION_BASE_PATH = '/sap/bc/zapi/execute';

// Validar que el nombre no pueda alterar la ruta HTTP.
function validateToolName(toolName) {
  if (
    typeof toolName !== 'string' ||
    !/^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(toolName)
  ) {
    throw new Error('Nombre de herramienta SAP invalido');
  }

  return toolName;
}

// Construir la ruta de ejecucion de una herramienta.
function buildExecutionPath(toolName) {
  const validatedName = validateToolName(toolName);

  return (
    `${EXECUTION_BASE_PATH}/` +
    encodeURIComponent(validatedName)
  );
}

// Enviar una solicitud al dispatcher SAP.
export async function executeSapTool(toolName, parameters) {
  const path = buildExecutionPath(toolName);

  if (
    parameters === null ||
    typeof parameters !== 'object' ||
    Array.isArray(parameters)
  ) {
    throw new Error(
      'Los parametros deben ser un objeto JSON'
    );
  }

  const response = await sapPost(path, parameters);

  return {
    success:
      response.ok &&
      response.data?.success === true,

    httpStatus: response.status,
    data: response.data
  };
}

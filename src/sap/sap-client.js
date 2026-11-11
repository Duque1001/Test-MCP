import { environment } from '../config/environment.js';

function buildSapUrl(path) {
  const url = new URL(path, environment.sap.baseUrl);

  if (url.protocol !== 'https:') {
    throw new Error('La conexion SAP requiere HTTPS');
  }

  url.searchParams.set('sap-client', environment.sap.client);

  return url;
}

function buildAuthHeaders() {
  const { authType, username, password } = environment.sap;

  if (authType !== 'basic') {
    throw new Error('Tipo de autenticacion SAP no soportado');
  }

  if (!username || !password) {
    throw new Error('Credenciales SAP no configuradas');
  }

  const credentials = Buffer
    .from(`${username}:${password}`, 'utf8')
    .toString('base64');

  return {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json'
  };
}

export async function sapGet(path) {
  const url = buildSapUrl(path);

  const response = await fetch(url, {
    method: 'GET',
    headers: buildAuthHeaders(),
    signal: AbortSignal.timeout(environment.sap.timeout),
    redirect: 'error'
  });

  if (!response.ok) {
    throw new Error(`Error HTTP SAP: ${response.status}`);
  }

  return response.json();
}


/**
 * Envia una solicitud POST JSON al servicio REST SAP.
 *
 * Devuelve el estado HTTP y el cuerpo JSON,
 * incluso cuando SAP responde 400, 403 o 404.
 */
export async function sapPost(path, payload) {
  const url = buildSapUrl(path);

  if (payload === null ||
      typeof payload !== 'object' ||
      Array.isArray(payload)) {
    throw new Error('El payload SAP debe ser un objeto JSON');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(environment.sap.timeout),
    redirect: 'error'
  });

  // Leer el cuerpo incluso para respuestas HTTP de error.
  const responseText = await response.text();

  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `SAP devolvio una respuesta JSON invalida. HTTP ${response.status}`
      );
    }
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

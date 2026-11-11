import { sapGet } from './sap-client.js';
import { environment } from '../config/environment.js';

export async function getSapTools() {
  const catalog = await sapGet(
    environment.sap.catalogPath
  );

  if (!catalog || !Array.isArray(catalog.tools)) {
    throw new Error('Formato del catalogo SAP no valido');
  }

  return catalog.tools;
}

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

const envPath = resolve(currentDir, '../../.env');

dotenv.config({
  path: envPath
});

export const environment = {
  sap: {
    baseUrl: process.env.SAP_BASE_URL,
    client: process.env.SAP_CLIENT || '100',
    catalogPath:
      process.env.SAP_CATALOG_PATH || '/sap/bc/zapi/tools',
    timeout: Number(process.env.SAP_TIMEOUT_MS || 15000),
    authType: process.env.SAP_AUTH_TYPE || 'basic',
    username: process.env.SAP_USERNAME,
    password: process.env.SAP_PASSWORD
  },

  execution: {
    enabled: process.env.SAP_EXECUTION_ENABLED === 'true'
  }
};


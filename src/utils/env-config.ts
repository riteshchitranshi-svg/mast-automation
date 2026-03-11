import * as fs from 'fs';
import * as path from 'path';

export const env = (process.env.TEST_ENV ?? 'sandbox') as 'sandbox' | 'stage';

function parsePropertiesFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return result;
}

export function loadEnvConfig(): { baseUrl: string; apiBaseUrl: string; timeout: number } {
  const p = parsePropertiesFile(path.resolve(__dirname, `../../testData/${env}/env.properties`));
  return { baseUrl: p.baseUrl, apiBaseUrl: p.apiBaseUrl, timeout: parseInt(p.timeout, 10) };
}

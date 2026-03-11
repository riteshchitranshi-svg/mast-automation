import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { env } from './env-config';

export function getUserByKey(key: string): { email: string; password: string } {
  const csvPath = path.resolve(__dirname, `../../testData/${env}/users.csv`);
  const rows: Array<{ key: string; email: string; password: string }> = parse(
    fs.readFileSync(csvPath),
    { columns: true, skip_empty_lines: true },
  );
  const user = rows.find(r => r.key === key);
  if (!user) {
    throw new Error(`No user found for key "${key}" in ${env}/users.csv`);
  }
  return { email: user.email, password: user.password };
}

import * as fs from 'node:fs';
import * as path from 'node:path';

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .forEach((line) => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    });
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'secret-for-testing';
}

import { readFileSync } from 'fs';
import { join } from 'path';

export const SECRETS_FILEPATH = 'secrets.sh';
export const SECRETS_TEMPLATE_FILEPATH = 'secrets.template.sh';
export const absSecretPath = join(process.cwd(), SECRETS_FILEPATH);
export const absTemplatePath = join(process.cwd(), SECRETS_TEMPLATE_FILEPATH);

export function loadSecretsFile() {
  let deploySecrets: { [key: string]: string };
  let secretsBuffer: Buffer;
    try {
      secretsBuffer = readFileSync(absSecretPath);
    } catch (e) {
      // * secrets file read failed, use template instead
      secretsBuffer = readFileSync(absTemplatePath);
    } finally {
      // * Parse secrets.sh file.
      deploySecrets = parseBashExports(secretsBuffer.toString()); // forEach(char => console.log(char, '\n'));
    }
    // * Write parsed keys to environment for use in other scripts
    Object.keys(deploySecrets).forEach(key => {
      process.env[key] = deploySecrets[key];
    });
    return deploySecrets;
}

/**
 * Checks for `export`s in a bash script and parses them as strings
 * @param input a string with the contents of the file
 * @returns a map with key-value pairs
 */
export function parseBashExports(input: string): { [key: string]: string } {
  const lines = input.split('\n');
  const output = {};
  lines.forEach(line => {
    const words = line.split(/\s/g);
    // First word has to be 'export'
    if (words?.[0] !== 'export') return;

    words.shift(); // Remove 'export'
    // Factor in values that have spaces
    const assignment = words.join(' ').split('=');
    const key = assignment[0];
    const value = assignment[1].match(/(["|'])(.*?)\1/)?.[0].replace(/"|'/g, '');
    output[key] = value;
  });
  return output;
}

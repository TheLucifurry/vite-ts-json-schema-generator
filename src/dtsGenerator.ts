
import { IConfigResolved, ISchemaFilesMetaList } from './types';
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'

export function generateDtsCode(pluginConfig: IConfigResolved, files: ISchemaFilesMetaList): string {
  const body = Object.entries(files)
    .map(([name, { exports }]) => {
      const content = exports
        .map(en => `export const ${en}: JSONSchema;`)
        .join('')
      //TODO: Doesn't match ts files by path with ".ts" ext, if it will be need, make support ts env-s, that implies imports with ext
      return `declare module '*/${name}${pluginConfig.suffix}' { ${content} }\n`
    })
    .join('');

  return `// Generated by vite-ts-json-schema-generator plugin
// Don't modify this file

type JSONSchema = object;${''/* TODO: Replace this mock by correct type */}

${body}\n`;
}

export async function generateDeclarationFile(pluginConfig: IConfigResolved, filepath: string, files: ISchemaFilesMetaList) {
  const originalContent = existsSync(filepath) ? await readFile(filepath, 'utf-8') : ''

  const code = generateDtsCode(pluginConfig, files)
  if (!code)
    return

  if (code !== originalContent)
    await writeFile(filepath, code, 'utf-8')
}

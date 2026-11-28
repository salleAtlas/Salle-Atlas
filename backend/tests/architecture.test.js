const fs = require('fs');
const path = require('path');

function getAllJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractRequires(content) {
  const requires = [];
  const regex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    requires.push(match[1]);
  }
  return requires;
}

describe('8-Layer Backend Architecture Guardrails', () => {
  const srcDir = path.resolve(__dirname, '../src');
  const allFiles = getAllJsFiles(srcDir);

  test('Layer 1: Models (src/models/) are pure schemas and never contain methods/statics or forbidden imports', () => {
    const modelFiles = allFiles.filter((f) => f.includes(`${path.sep}src${path.sep}models${path.sep}`));
    expect(modelFiles.length).toBeGreaterThan(0);

    for (const file of modelFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      // Never define .methods. or .statics.
      expect(content).not.toMatch(/\.methods\./);
      expect(content).not.toMatch(/\.statics\./);

      // Never require from services, repositories, controllers, routes, dtos, or mappers
      for (const req of requires) {
        expect(req).not.toMatch(/services\//);
        expect(req).not.toMatch(/repositories\//);
        expect(req).not.toMatch(/controllers\//);
        expect(req).not.toMatch(/routes\//);
        expect(req).not.toMatch(/dtos\//);
        expect(req).not.toMatch(/mappers\//);
      }
    }
  });

  test('Layer 2: Repositories (src/repositories/) never import from services, controllers, routes, or middlewares', () => {
    const repoFiles = allFiles.filter((f) => f.includes(`${path.sep}src${path.sep}repositories${path.sep}`));
    expect(repoFiles.length).toBeGreaterThan(0);

    for (const file of repoFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      for (const req of requires) {
        expect(req).not.toMatch(/services\//);
        expect(req).not.toMatch(/controllers\//);
        expect(req).not.toMatch(/routes\//);
        expect(req).not.toMatch(/middlewares\//);
      }
    }
  });

  test('Layer 3 & 4: DTOs and Mappers never require mongoose or domain layers', () => {
    const dtoAndMapperFiles = allFiles.filter(
      (f) =>
        f.includes(`${path.sep}src${path.sep}dtos${path.sep}`) ||
        f.includes(`${path.sep}src${path.sep}mappers${path.sep}`)
    );
    expect(dtoAndMapperFiles.length).toBeGreaterThan(0);

    for (const file of dtoAndMapperFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      for (const req of requires) {
        expect(req).not.toBe('mongoose');
        expect(req).not.toMatch(/models\//);
        expect(req).not.toMatch(/repositories\//);
        expect(req).not.toMatch(/services\//);
        expect(req).not.toMatch(/controllers\//);
        expect(req).not.toMatch(/routes\//);
      }
    }
  });

  test('Layer 5: Services (src/services/) never import models (except enums) or controllers', () => {
    const serviceFiles = allFiles.filter((f) => f.includes(`${path.sep}src${path.sep}services${path.sep}`));
    expect(serviceFiles.length).toBeGreaterThan(0);

    for (const file of serviceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      for (const req of requires) {
        expect(req).not.toMatch(/controllers\//);
        if (req.includes('models/')) {
          expect(req).toMatch(/models\/enums(\.js)?$/);
        }
      }
    }
  });

  test('Layer 6: Controllers (src/controllers/) never import models or repositories (exception: health.controller)', () => {
    const controllerFiles = allFiles.filter((f) => f.includes(`${path.sep}src${path.sep}controllers${path.sep}`));
    expect(controllerFiles.length).toBeGreaterThan(0);

    for (const file of controllerFiles) {
      const relative = path.relative(srcDir, file).replace(/\\/g, '/');
      const isHealth = relative === 'controllers/api/health.controller.js';
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      for (const req of requires) {
        expect(req).not.toMatch(/repositories\//);
        if (!isHealth) {
          expect(req).not.toMatch(/models\//);
          expect(req).not.toBe('mongoose');
        }
      }
    }
  });

  test('Validators (src/middlewares/validators/) never import models or repositories', () => {
    const validatorFiles = allFiles.filter((f) =>
      f.includes(`${path.sep}src${path.sep}middlewares${path.sep}validators${path.sep}`)
    );
    expect(validatorFiles.length).toBeGreaterThan(0);

    for (const file of validatorFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const requires = extractRequires(content);

      for (const req of requires) {
        expect(req).not.toMatch(/models\//);
        expect(req).not.toMatch(/repositories\//);
      }
    }
  });
});

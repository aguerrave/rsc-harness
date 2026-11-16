# Validación de la distribución aguerrave — 2026-11-16

Base: upstream v4.1.7 (260396d). Release propia: 4.1.7-aguerrave.3 (anterior: 4.1.7-aguerrave.2).

## 4.1.7-aguerrave.3

- Nueva skill `idempiere-2pack` (empaquetar, importar y depurar 2Pack), tomada de la versión de Cursor de dotfiles. Los nombres de tabla y columna se verificaron contra iDempiere 12: el borrador usaba `AD_Package_Imp_Det`, que no existe; la tabla correcta es `AD_Package_Imp_Detail`.
- `idempiere-plugins` suma las reglas propias de la skill de Cursor `idempiere-plugin`: `processIt` en vez de escribir `DocStatus`, callouts y `beforeSave` ligeros, y entity type propio en el 2Pack.
- El catálogo pasa a 283 skills; hay 10 skills iDempiere.

## 4.1.7-aguerrave.2

- Seis skills iDempiere nuevas (plugin-compiler, integration-test, jasper-report-bundle, freemarker-print-template, osgi-framework-listener, jenkinsfile-developer), cada una con evals (5/4/1). El catálogo pasó de 276 a 282 skills.
- `idempiere-plugins` incorpora las reglas de código del core aplicables a plugins, redactadas aquí.
- Licencias: no se incluye contenido de fuentes sin licencia. Las plantillas Java llevan la cabecera GPL-2.0 de iDempiere; el script de README conserva el aviso MIT de Carl0gonzalez; el ejemplo FreeMarker es propio. Las APIs que usan las plantillas se verificaron contra el core release-12 (b478095).
- `upstream/idempiere-sources.json` y `scripts/idempiere-upstream.js` fijan y vigilan las 5 fuentes.
- Corrección: la copia nativa de Codex incluye `assets/`, `references/` y `scripts/`. La prueba de instalación del fork falla sin la corrección.

## Comprobaciones (4.1.7-aguerrave.3)

Pasaron: `npm test` (1858 ok, 0 fallos, 3 omitidas), validate, manifest:check, eval-lint, drift, originalidad y `routing:audit`.

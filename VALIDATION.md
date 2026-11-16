# Validación de la distribución aguerrave — 2026-11-16

Base: upstream v4.1.7 (260396d). Rama: feat/idempiere-skills-consolidation (sin release todavía).

- Seis skills iDempiere nuevas (plugin-compiler, integration-test, jasper-report-bundle, freemarker-print-template, osgi-framework-listener, jenkinsfile-developer), cada una con evals (5/4/1). El catálogo pasa de 276 a 282 skills.
- `idempiere-plugins` incorpora las reglas de código del core aplicables a plugins, redactadas aquí, y recomienda las skills nuevas.
- Licencias: no se incluye contenido de fuentes sin licencia. Las plantillas Java llevan la cabecera GPL-2.0 de iDempiere; el script de README conserva el aviso MIT de Carl0gonzalez; el ejemplo FreeMarker es propio. Las APIs que usan las plantillas se verificaron contra el core release-12 (b478095).
- `upstream/idempiere-sources.json` y `scripts/idempiere-upstream.js` fijan y vigilan las 5 fuentes. Se probó la detección con un pin antiguo (reporta commits y archivos, código 1).
- Corrección: la copia nativa de Codex ahora incluye `assets/`, `references/` y `scripts/`. La prueba de instalación del fork cubre las 9 skills y falla sin la corrección.
- Pasaron: `npm test` (1858 ok, 0 fallos, 3 omitidas), validate, manifest:check, eval-lint, drift y originalidad. `routing:audit` pasa con 85,0% (main estaba en 84,9%) tras ajustar los tags de las skills iDempiere.

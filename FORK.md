# Distribución propia de rsc

Origen: https://github.com/aguerrave/rsc-harness
Upstream: https://github.com/ericrisco/rsc-harness
Base: v4.1.7 (260396d). Fork anterior: v4.1.7-aguerrave.2 sobre v4.1.7.
Versión propia: 4.1.7-aguerrave.3. Referencia de distribución: v4.1.7-aguerrave.3.

## Instalar o sincronizar
`npx --yes --package=github:aguerrave/rsc-harness#v4.1.7-aguerrave.3 rsc sync --target claude,codex,cursor`

## Skills propias
- idempiere-implementation: implantación contractual y funcional.
- idempiere-plugins: Java, OSGi, factories y 2Pack.
- idempiere-deployment: instalación, despliegue y verificación del runtime.
- idempiere-plugin-compiler: compilar plugins con Tycho o plugin-builder, sin asumir Docker.
- idempiere-integration-test: pruebas JUnit 5 contra iDempiere real (AbstractTestCase).
- idempiere-jasper-report-bundle: reportes Jasper empaquetados en el bundle y registrados por 2Pack.
- idempiere-freemarker-print-template: plantillas FreeMarker (AD_PrintTemplate), solo iDempiere 13+.
- idempiere-osgi-framework-listener: reaccionar al arranque completo del contenedor OSGi.
- idempiere-jenkinsfile-developer: Jenkinsfile para plugins con agente nativo.
- idempiere-2pack: empaquetar, importar y depurar 2Pack (AD_Package_Imp, AD_Package_Imp_Detail).

Se instalan explícitamente, no en todos los perfiles genéricos. No se añaden a proyectos ajenos a iDempiere.

## Fuentes upstream de las skills iDempiere
`upstream/idempiere-sources.json` fija cada fuente (repo, commit, licencia y qué skills la siguen). `node scripts/idempiere-upstream.js` la clona en un temporal y reporta lo que cambió desde el pin, incluido si apareció un archivo de licencia. Sale con código 1 si hay algo que revisar. Tras revisar y adaptar, se registra la decisión en rsc-brain (`alge-idempiere`, tema `skills-upstream-sync`) y se actualiza el pin con `--bump <id>`.

No se copia contenido de fuentes sin licencia. `hengsin/idempiere-skills` (11 skills de plugins) y `muriloht/idempiere-print-template` no tienen licencia; sus skills se incorporan cuando la tengan. Las plantillas Java derivan de ejemplos GPL-2.0 de iDempiere y conservan su cabecera GPL-2.0; el texto de las skills es MIT.

En Codex, la copia nativa `.agents/skills/<id>/` incluye `assets/`, `references/` y `scripts/` de la skill, porque el cuerpo los cita por ruta relativa.

## Política de actualizaciones
El arranque no descarga actualizaciones ni consulta npm upstream. La distribución está fijada a la referencia publicada del fork. upgrade usa el fork; una nueva release requiere revisar cambios de upstream, ejecutar las pruebas y publicar otra referencia. .rsc.json registra el repositorio y ref de origen. El recibo de onboarding anterior se conserva como evidencia histórica, no como mecanismo de actualización.

## Credenciales
GitHub SSH usa git-aguerrave para publicar como aguerrave. No se guardan claves ni datos privados en este repositorio.

# Distribución propia de rsc

Origen: https://github.com/aguerrave/rsc-harness
Upstream: https://github.com/ericrisco/rsc-harness
Base: v3.4.0 (25d3892). Fork anterior: v3.3.1-aguerrave.1 sobre v3.3.1.
Versión propia: 3.4.0-aguerrave.1. Referencia de distribución: v3.4.0-aguerrave.1.

## Instalar o sincronizar
`npx --yes --package=github:aguerrave/rsc-harness#v3.4.0-aguerrave.1 rsc sync --target claude,codex,cursor`

## Skills propias
- idempiere-implementation: implantación contractual y funcional.
- idempiere-plugins: Java, OSGi, factories y 2Pack.
- idempiere-deployment: instalación, despliegue y verificación del runtime.

Se instalan explícitamente, no en todos los perfiles genéricos. No se añaden a proyectos ajenos a iDempiere.

## Política de actualizaciones
El arranque no descarga actualizaciones ni consulta npm upstream. La distribución está fijada a la referencia publicada del fork. upgrade usa el fork; una nueva release requiere revisar cambios de upstream, ejecutar las pruebas y publicar otra referencia. .rsc.json registra el repositorio y ref de origen. El recibo de onboarding anterior se conserva como evidencia histórica, no como mecanismo de actualización.

## Credenciales
GitHub SSH usa git-aguerrave para publicar como aguerrave. No se guardan claves ni datos privados en este repositorio.

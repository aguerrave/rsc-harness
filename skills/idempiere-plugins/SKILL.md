---
name: idempiere-plugins
description: "Desarrollar y revisar plugins Java OSGi de iDempiere: factories, servicios declarativos, modelos, procesos y paquetes 2Pack. Úsala sobre código fuente, no para configurar procesos funcionales del cliente."
tags: ["idempiere", "java", "osgi", "2pack", "model", "process", "factory", "event", "validator", "callout", "beforesave", "parser", "matcher", "pruebas", "proceso"]
recommends: ["idempiere-plugin-compiler", "idempiere-integration-test", "idempiere-jasper-report-bundle", "idempiere-freemarker-print-template", "idempiere-osgi-framework-listener", "idempiere-deployment"]
origin: aguerrave
---

# Plugins iDempiere

Detecta primero versión de iDempiere, Java y ZK en MANIFEST.MF y plataforma de destino. Compila contra esa plataforma; no mezcles dependencias de versiones distintas. Respeta el sistema de construcción existente.

Un nombre de clase en AD_Process no basta: verifica cómo la descubre el runtime. Procesos propios pueden requerir IProcessFactory, modelos IModelFactory y cargadores/matchers sus factories específicas. Comprueba implementación, XML de servicio, Service-Component y empaquetado.

Verifica referencias UUID e identidad de los objetos del diccionario. Un 2Pack incremental no puede depender de una definición que solo aparece en un paquete posterior. Preserva compatibilidad con instalaciones existentes y prueba instalación limpia y actualización cuando corresponda.

En SQL conserva el filtro de cliente/organización en todas las ramas OR; parametriza valores. Revisa límites de transacción y manejo de errores: no consideres éxito un resultado parcial silenciado. No cambies modelos generados sin determinar cómo se regeneran.

Prueba comportamiento, no solo compilación: para parsers financieros verifica signo, céntimos, separadores y fechas; para matching prueba ambigüedad, orden, activación y pagos ya vinculados. El JAR entregado debe corresponder al código probado; registra huella y revisión.

No generalices un formato bancario sintético a un banco real. Etiqueta las suposiciones y pide muestras depuradas cuando sean necesarias para validar el contrato.

## Reglas de código (alineadas con las del core)

- Acceso a datos, en este orden: clases de modelo `M*` (con sus getters en caché), luego `Query` con parámetros, luego los helpers `DB.*`, y JDBC directo solo si nada de lo anterior sirve (cerrando siempre con `DB.close`). Un `UPDATE` directo se salta `beforeSave`, los validadores, los event handlers y el registro de cambios: úsalo solo si eso es lo que se quiere.
- El SQL debe funcionar en PostgreSQL y en Oracle. Evita funciones propias de un motor y usa los helpers de `DB`.
- Pasa el `trxName` de punta a punta. No hagas commit ni rollback de una transacción que no abriste.
- Los textos visibles para el usuario salen de `AD_Message` (`Msg.getMsg`), no van escritos en el código. Los errores se lanzan como `AdempiereException` y se registran con `CLogger`, nunca con `System.out`.
- No edites a mano las clases `X_*` ni `I_*`: se regeneran desde el diccionario.
- No inventes `*_ID` ni `*_UU`. Los registros del diccionario se crean en una instancia de desarrollo y viajan en un 2Pack exportado.
- Si el plugin expone API para otros plugins, conserva las firmas públicas: agrega sobrecargas y marca `@Deprecated` en lugar de borrar.

Para compilar usa `idempiere-plugin-compiler`; para probar contra una base real, `idempiere-integration-test`.

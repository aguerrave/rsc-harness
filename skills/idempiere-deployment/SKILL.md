---
name: idempiere-deployment
description: "Instalar, actualizar y validar iDempiere o sus bundles en entornos identificados, con respaldo, migraciones y evidencia del runtime. No implica autorización automática para producción ni reinicios compartidos."
tags: ["idempiere", "deployment", "osgi", "backup"]
origin: aguerrave
---

# Instalación y despliegue de iDempiere

Identifica el destino real antes de escribir: URL, proxy, host/contenedor, servicio, base y plataforma. localhost de la estación no identifica necesariamente al servidor ni a su sistema de archivos. No traslades nombres, puertos o credenciales de otro proyecto.

Consulta el mecanismo de instalación existente (p2, exportación PDE, Tycho, consola OSGi o procedimiento operativo). Mantén ese mecanismo cuando sea adecuado. Copiar un JAR no prueba instalación y ACTIVE no demuestra que el 2Pack terminó correctamente.

Antes de aplicar cambios con efectos de diccionario, comprueba respaldo y recuperación. Un snapshot de un servidor compartido también revierte trabajo ajeno; documenta esa consecuencia y coordina la restauración. No restaure automáticamente un snapshot completo para resolver un fallo de un solo plugin.

Registra artefacto, SHA-256, revisión fuente y versión; comprueba dependencias y ubicación persistente del bundle. En actualizaciones OSGi comprueba qué ubicación conservará el framework al reiniciar.

Tras instalar verifica estado de bundle y servicios, logs acotados al momento de instalación, cada paquete incremental y objetos de diccionario necesarios. Prueba los recorridos relevantes con datos identificables. Los servicios pueden tener un /tmp privado: usa una ruta explícita accesible al usuario del servicio.

Usa credenciales externas al repositorio. Distingue prueba aislada, prueba funcional y puesta en producción. Registra las limitaciones y la limpieza de datos; documentos completados pueden requerir anulación y reversos en vez de borrado.

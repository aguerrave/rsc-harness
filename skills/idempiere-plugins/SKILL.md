---
name: idempiere-plugins
description: "Desarrollar y revisar plugins Java OSGi de iDempiere: factories, servicios declarativos, modelos, procesos y paquetes 2Pack. Úsala sobre código fuente, no para configurar procesos funcionales del cliente."
tags: ["idempiere", "java", "osgi", "2pack"]
origin: aguerrave
---

# Plugins iDempiere

Detecta primero versión de iDempiere, Java y ZK en MANIFEST.MF y plataforma de destino. Compila contra esa plataforma; no mezcles dependencias de versiones distintas. Respeta el sistema de construcción existente.

Un nombre de clase en AD_Process no basta: verifica cómo la descubre el runtime. Procesos propios pueden requerir IProcessFactory, modelos IModelFactory y cargadores/matchers sus factories específicas. Comprueba implementación, XML de servicio, Service-Component y empaquetado.

Verifica referencias UUID e identidad de los objetos del diccionario. Un 2Pack incremental no puede depender de una definición que solo aparece en un paquete posterior. Preserva compatibilidad con instalaciones existentes y prueba instalación limpia y actualización cuando corresponda.

En SQL conserva el filtro de cliente/organización en todas las ramas OR; parametriza valores. Revisa límites de transacción y manejo de errores: no consideres éxito un resultado parcial silenciado. No cambies modelos generados sin determinar cómo se regeneran.

Prueba comportamiento, no solo compilación: para parsers financieros verifica signo, céntimos, separadores y fechas; para matching prueba ambigüedad, orden, activación y pagos ya vinculados. El JAR entregado debe corresponder al código probado; registra huella y revisión.

No generalices un formato bancario sintético a un banco real. Etiqueta las suposiciones y pide muestras depuradas cuando sean necesarias para validar el contrato.

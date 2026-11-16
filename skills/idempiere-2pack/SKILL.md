---
name: idempiere-2pack
description: "Empaquetar, importar y depurar 2Pack de iDempiere (PackOut, PackIn, AD_Package_Imp, META-INF/2Pack_*.zip): orden incremental, entity type propio, separación diccionario/datos y diagnóstico de un PackIn fallido. No para escribir el código Java del plugin (idempiere-plugins) ni para el despliegue del bundle (idempiere-deployment)."
tags: ["idempiere", "2pack", "packin", "packout", "ad_package_imp", "diccionario", "entitytype"]
recommends: ["idempiere-plugins", "idempiere-deployment", "idempiere-jasper-report-bundle"]
origin: aguerrave
---

# 2Pack de iDempiere

Un 2Pack es un zip con metadatos del diccionario (AD) y, a veces, datos. El código Java del bundle no viaja en él: el JAR y el 2Pack se versionan juntos, pero son piezas distintas.

## Al empaquetar (PackOut)

- Exporta desde una instancia de desarrollo con `AD_Package_Exp`. No escribas el XML a mano ni inventes `*_ID` o `*_UU`.
- Cada cambio sale en un paquete incremental nuevo: `2Pack_1.0.0.zip`, luego `2Pack_1.0.1.zip`. `Incremental2PackActivator` los aplica en orden de versión, una sola vez cada uno. Nunca reescribas un paquete ya publicado: el sistema lo da por aplicado y no lo vuelve a leer.
- Un paquete no puede depender de una definición que solo aparece en uno posterior.
- Todo registro nuevo lleva el **entity type del plugin**, registrado en `AD_EntityType`. Nunca `D` (Dictionary): esos registros los pisa la siguiente migración del core.
- No incluyas registros de System que el core ya trae.
- Separa diccionario y datos de tenant (impuestos, listas, configuración de un cliente). Los datos van en su propio paquete y solo para el tenant que corresponde.

## Al importar (PackIn)

- Respaldo verificable antes, sobre todo en un servidor compartido.
- Importa en orden de versión. En un bundle, deja que lo haga el activator al arrancar.
- Revisa `AD_Package_Imp` (un registro por paquete aplicado) y `AD_Package_Imp_Detail` (una línea por objeto, con su resultado). Un bundle `ACTIVE` no prueba que el 2Pack terminó bien.
- Confirma el resultado en la aplicación: la ventana, el proceso o el reporte existe, aparece en el menú (`AD_TreeNodeMM`) y abre.

## Si un PackIn falla

1. Lee el detalle en `AD_Package_Imp_Detail` y el log del servidor de ese momento; identifica el primer objeto que falló, no el último.
2. Busca colisiones: la tabla, columna o elemento ya existe con otro entity type o con otro UUID.
3. No reimportes el mismo zip a ciegas. Corrige con un paquete incremental nuevo, o restaura el respaldo si el estado quedó a medias.
4. Si el paquete mezcla diccionario y datos de tenant, sepáralos antes de reintentar.

## Consultas útiles

```sql
-- Paquetes aplicados y su estado, del más reciente al más antiguo
SELECT Name, PK_Version, PK_Status, Created
FROM AD_Package_Imp ORDER BY Created DESC;

-- Detalle de un paquete: qué objetos fallaron
SELECT d.TableName, d.Name, d.Type, d.Action, d.Result
FROM AD_Package_Imp_Detail d
JOIN AD_Package_Imp p ON p.AD_Package_Imp_ID = d.AD_Package_Imp_ID
WHERE p.Name = ? AND d.Success = 'Failure'
ORDER BY d.AD_Package_Imp_Detail_ID;

-- Entity types registrados
SELECT EntityType, Name, Version FROM AD_EntityType ORDER BY EntityType;
```

Verificado contra iDempiere 12: `Success` vale `Success` o `Failure`, y `Result` trae el mensaje. Comprueba los nombres en el core destino si es otra versión.

## Reporte

Paquetes creados o aplicados con su versión, entity type usado, separación diccionario/datos, resultado en `AD_Package_Imp` y `AD_Package_Imp_Detail`, y qué se verificó en la aplicación. Si algo no se pudo comprobar, dilo.

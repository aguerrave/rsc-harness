---
name: idempiere-jasper-report-bundle
description: Use when a Jasper report (.jrxml/.jasper) must ship inside an iDempiere OSGi plugin and install itself — choosing the bundle:, resource: or attachment: JasperReport prefix, wiring Incremental2PackActivator and the 2Pack that registers the AD_Process or report record. NOT designing or debugging the JRXML itself, NOT FreeMarker print templates (idempiere-freemarker-print-template).
tags: [idempiere, jasper, jasperreports, jrxml, report, reporte]
recommends: [idempiere-plugins, idempiere-plugin-compiler, idempiere-deployment]
origin: aguerrave
---

# Ship a Jasper report in an iDempiere bundle

Package the compiled report with the plugin and register it through 2Pack, so
installing the bundle is enough — no manual upload in "Report & Process".

## Pick the JasperReport prefix — they are not interchangeable

`AD_Process.JasperReport` takes a prefixed value that tells iDempiere where to
load the `.jasper` from. A prefix that does not match where the file is fails
silently at run time.

| Prefix | Example | Where the `.jasper` lives | Use it for |
|---|---|---|---|
| `bundle:<symbolic-name>:<path>` | `bundle:com.example.report:resources/Order.jasper` | `resources/` at the bundle root, listed in `build.properties` `bin.includes` | A new report — the simplest option |
| `resource:<symbolic-name>:<classpath-path>` | `resource:com.example.report:com/example/report/Order.jasper` | Next to the Java classes under `src/`, loaded through the bundle classloader | A report that belongs with the Java code using it |
| `attachment:<file>.jasper` | `attachment:BalanceSheet.jasper` | Not in the bundle: an attachment on the process or report record, shipped by the 2Pack | Replacing a **standard** report without new code |

## Steps

1. Keep the `.jrxml` source in the repository (for example `reports/`); only the
   compiled `.jasper` is needed at run time. Compile with the same JasperReports
   version as the target server.
2. Place the `.jasper` where the chosen prefix expects it.
3. Activator: `assets/MyActivator.java.template` extends
   `Incremental2PackActivator`, which applies `META-INF/2Pack_<version>.zip`
   packages in order, each once, when the bundle starts.
4. 2Pack: export the `AD_Process` (and menu, report view or financial report
   records) from a development instance with Pack Out, with `JasperReport` set to
   the prefixed value. Ship each change as a new incremental package, so an
   upgrade applies only the delta. Never invent `*_ID` or `*_UU` values by hand.
5. `MANIFEST.MF`: `Require-Bundle` on `org.adempiere.base` and
   `org.adempiere.plugin.utils` (for the activator), `Service-Component` pointing
   at the `OSGI-INF/*.xml`. `build.properties` must include `META-INF/`,
   `OSGI-INF/` and `resources/` (if used), or they never reach the JAR.

## Check before reporting done

- Open the built JAR (`unzip -l`) and confirm the `.jasper`, the 2Pack zip and the
  `OSGI-INF` descriptor are inside.
- After installing, the 2Pack must show as applied (`AD_Package_Imp`) and the
  report must run from its menu entry. An ACTIVE bundle alone proves neither.

## Report

The prefix chosen and why, the files added, the manifest and `build.properties`
changes, and what was verified (JAR contents, 2Pack applied, report run) versus
left to the user.

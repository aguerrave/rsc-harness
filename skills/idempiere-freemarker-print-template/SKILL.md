---
name: idempiere-freemarker-print-template
description: Use when an iDempiere 13+ plugin must ship a FreeMarker (.ftlh) print template as an AD_PrintTemplate — document or list mode, HTML/PDF/CSV/XLSX output through the report-content renderer API (IDEMPIERE-7070). Refuses iDempiere 12 targets, where that API does not exist. NOT Jasper reports (idempiere-jasper-report-bundle), NOT writing the rendering engine itself.
tags: [idempiere, freemarker, ftlh, print, report, template, printformat]
recommends: [idempiere-jasper-report-bundle, idempiere-plugins, idempiere-plugin-compiler]
origin: aguerrave
---

# FreeMarker print template for iDempiere

FreeMarker templates are a lighter alternative to Jasper: an `.ftlh` file stored
as an `AD_PrintTemplate`, rendered by a renderer bundle such as
`org.idempiere.print.freemarker` (github.com/muriloht/idempiere-print-template).

## Hard requirement: iDempiere 13 or newer

The renderer depends on `org.idempiere.print.IReportContentRenderer` and
`IReportContentRendererFactory`, added by IDEMPIERE-7070 (fix versions 13 and 14).
**They are not in iDempiere 12.**

- Check the target core itself, not a README:
  `find <core>/org.adempiere.base -name 'IReportContentRenderer*.java'`, or the
  `org.adempiere.base` version in the target's `MANIFEST.MF` / p2 repository.
- On iDempiere 12, stop: say this skill does not apply and offer
  `idempiere-jasper-report-bundle` instead. Loosening a version bound does not
  make the classes exist; it moves the failure to run time.
- When declaring `Require-Bundle` on the renderer bundle, use the lowest version
  verified against the real target core.

## Data model available to a template

- Record columns at the top level; foreign keys are maps with `id` and `display`.
- `ctx`: client, organization, user, language and `now`.
- `assets`: template attachments, base64 encoded (logos, images).
- List mode (`IsForm='N'`) also exposes `rows` (one map per record) and `count`.

Document mode (`IsForm='Y'`) renders once per record and merges a multi-record
selection (PDF pages, HTML page breaks). Do not mix the two modes in one template.

## Steps

1. Confirm the core version (above).
2. Decide the mode: one document per record (invoice-like) or one listing over a
   filtered set (report-like).
3. Write the `.ftlh`. For list mode, start from
   `assets/example-list-template.ftlh`. Use real column names from
   `AD_Table`/`AD_Column`; do not guess them. Escape nothing by hand: `.ftlh`
   auto-escapes HTML.
4. Register the `AD_PrintTemplate` (table or print format, `IsForm`) through a
   2Pack exported from a development instance. Never invent `*_ID` or `*_UU`.
5. Add the renderer bundle to `Require-Bundle` if the plugin does not depend on
   it yet.
6. Compile against the real target core and render the template once with real
   data before calling it done.

## Report

The `.ftlh` written, the mode, the `AD_PrintTemplate` registration, any manifest
change, the core version verified and how, and whether a real render was done.

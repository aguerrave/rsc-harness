---
name: idempiere-integration-test
description: Use when iDempiere plugin or model code needs a JUnit 5 test that runs inside a live iDempiere (OSGi + GardenWorld database) through org.idempiere.test.AbstractTestCase — real context, per-test transaction rollback, DictionaryIDs instead of magic numbers, documents completed through the workflow. NOT pure-logic tests with no server (plain JUnit), NOT UI or browser tests (e2e-testing).
tags: [idempiere, junit, abstracttestcase, gardenworld, dictionaryids, tycho]
recommends: [idempiere-plugins, idempiere-plugin-compiler]
origin: aguerrave
---

# iDempiere integration test

Use this when the code under test needs what only a running iDempiere gives:
a logged-in context, the Application Dictionary, documents, accounting. For logic
that needs none of that, write a plain JUnit test instead — it is faster and
does not need a database.

## What AbstractTestCase gives you

Extend `org.idempiere.test.AbstractTestCase`. Every test method starts with:

- a logged-in **GardenWorld Admin** context (client, HQ org, admin user and role,
  HQ warehouse, `en_US`), available through `getCtx()`, `getAD_Client_ID()`,
  `getAD_Org_ID()`, `getLoginDate()`;
- its **own transaction**, `getTrxName()`, rolled back when the method ends.

Pass `getTrxName()` to every model constructor, `Query` and `DB` call. A call
with `null` runs outside the test transaction, leaves data behind and can lock rows.

## Writing the test

- Reference seed records through `org.idempiere.test.DictionaryIDs`
  (`DictionaryIDs.C_BPartner.JOE_BLOCK.id`, `DictionaryIDs.C_DocType.STANDARD_ORDER.id`)
  instead of literal IDs. If a record you need is missing there, look up its real
  ID and UUID in the GardenWorld database — never invent them.
- **Do not update shared seed rows** (SysConfig, client info, products, rates) to
  build a scenario: it locks rows, slows the suite and breaks parallel runs.
  Create new rows inside the test transaction, and mock static getters such as
  `MSysConfig` with `Mockito.mockStatic(…, CALLS_REAL_METHODS)` when the code
  reads configuration.
- Complete or void documents the way the UI does:
  `MWorkflow.runDocumentActionWorkflow(po, DocAction.ACTION_Complete)`, then
  `assertFalse(info.isError(), info.getSummary())` and `po.load(getTrxName())`
  before checking `getDocStatus()`.
- Keep tests deterministic: set dates explicitly, never depend on test order.
- Avoid `commit()`. If the code under test really needs committed data, clean up
  afterwards.
- Assert the specific outcome with a message that says why it matters.

Start from `assets/MyTestCase.java.template` (GPL-2.0 header, like iDempiere's
own sources).

## Bundle setup

- `MANIFEST.MF`: `Require-Bundle: org.adempiere.base`, plus `Import-Package` for
  `org.idempiere.test` and each `org.junit.jupiter.*` package actually used
  (`api`, `api.extension`, `params`, `params.provider`…), and `org.mockito` if mocking.
- Tests are usually skipped by default in Tycho builds; enable them explicitly.

## Running it

| Option | Command |
|---|---|
| Eclipse | Duplicate the `idempiere.unit.test` launch configuration, add your test bundle on the Plug-ins tab, choose the class on the Test tab |
| Maven, own target platform | `mvn verify -DskipTests=false` |
| Maven, a target-platform pom | `mvn -f pom-targetplatform.xml verify -DskipTests=false` |
| Maven, a locally installed core | `mvn -f pom-core-parent.xml verify -DskipTests=false` (after `mvn install` in the core checkout) |
| One class or method | add `-Dtest=MyTest` or `-Dtest='MyTest#myMethod'` |

The runtime reads `idempiere.properties` from `idempiere.home`: it must point to
a database with GardenWorld and all migrations applied. Never print or commit
that file.

## Report

The tests added or changed, the exact command run, and the result. If the tests
were not run, or were already failing before the change, say so plainly.

---
name: idempiere-plugin-compiler
description: Use when an iDempiere OSGi plugin must be built, packaged or its compilation failure diagnosed — picks the plugin's own Tycho pom or the idempiere-target-platform-plugin builder, orders local dependencies from Require-Bundle and reports the exact command and JARs produced. Runs natively; never assumes Docker. NOT CI pipeline authoring (idempiere-jenkinsfile-developer), NOT installing the JAR (idempiere-deployment).
tags: [idempiere, tycho, maven, build, compile, plugin-builder, compilar]
recommends: [idempiere-jenkinsfile-developer, idempiere-plugins, idempiere-deployment]
origin: aguerrave (adapted from Carl0gonzalez/AI-Skills-Idempiere, MIT)
---

# Build an iDempiere plugin

A plugin build is only reproducible when it compiles against the same iDempiere
core it will run on. This skill picks the right builder, resolves local plugin
dependencies in order, and reports what it actually produced.

## Before choosing a command

1. Read the plugin's `META-INF/MANIFEST.MF`: `Bundle-SymbolicName`, the
   `org.adempiere.base` version bound (it tells you the target core: 12, 13…),
   `Require-Bundle` and relevant `Import-Package` entries.
2. Read the repository's build notes, its `pom.xml` and any `Jenkinsfile`. If the
   project documents a build command, use it.
3. Check the toolchain where the build will run: `which javac java mvn` and
   `java -version` (iDempiere 12 needs Java 17). **Check for Docker before using
   it** (`which docker`); do not generate a Docker-based command on a machine
   that has no daemon.

## Pick the builder

| Situation | Command |
|---|---|
| The plugin has its own Tycho `pom.xml` that points at a core p2 repository or target file | `mvn clean verify` (or `package`) from that directory; add `-DskipTests` only if the user agrees |
| No usable pom | Clone `ingeint/idempiere-target-platform-plugin` on the branch matching the core version (for example `12.0`) and run `./plugin-builder build ../<plugin>` |
| A local core checkout is available | A `pom-targetplatform.xml` pointing at that core's `org.idempiere.p2` repository is an equally valid path |

`plugin-builder` only needs `javac`, `java` and `mvn` on `PATH`, so it runs the
same on a developer machine and on a CI node without containers.

## Dependencies

Build custom local dependencies first, in `Require-Bundle` order. When two
plugins depend on each other, use the repository's documented multi-plugin build
(for `plugin-builder`, pass the dependency paths before the requested plugin).

## Rules

- Do not assume a builder path, shell, OS, iDempiere version or plugin name.
- Do not delete build outputs or change dependency metadata unless asked.
- Never print credentials, tokens or repository URLs that embed secrets.
- A green compile is not a working plugin: if the task is "make it work", say
  that installation and runtime checks belong to `idempiere-deployment`.

## Report

Return the exact command run and the directory it ran in, the result (the Maven
or Tycho summary, or the first real error with the file and line), and every
generated JAR with its path, size and modification time.

---
name: idempiere-jenkinsfile-developer
description: Use when a Jenkinsfile for an iDempiere OSGi plugin must be created, updated or standardized — version-matched target-platform compile on a native agent (no Docker unless the node has it), JAR archiving, and a README-to-HTML documentation stage. NOT compiling locally (idempiere-plugin-compiler), NOT GitHub Actions (github-actions), NOT editing Java sources.
tags: [idempiere, jenkins, jenkinsfile, ci, pipeline, tycho]
recommends: [idempiere-plugin-compiler, idempiere-deployment]
origin: aguerrave (adapted from Carl0gonzalez/AI-Skills-Idempiere, MIT)
---

# Jenkinsfile for an iDempiere plugin

Generate or patch a declarative `Jenkinsfile` that builds the plugin against the
right iDempiere core and publishes its README as an HTML report.

## Check the node first

Many Jenkins nodes for iDempiere run without a Docker daemon. Before writing
anything, confirm what the target node has — read its provisioning (Nix, Ansible,
Dockerfile of the agent) or ask the user to run `which docker git java mvn python3`.

- `git`, Java 17 and Maven are required for the compile stage.
- `python3` is required for the README stage.
- Generate `agent { docker { … } }` blocks **only** if the node is confirmed to
  run Docker. Otherwise use `agent any` and native `sh` steps. If something truly
  needs Docker and the node lacks it, say so instead of emitting a pipeline that
  will fail.

## Stages

1. **Init** — always set `currentBuild.description`. Update parent or multibranch
   job descriptions only when `currentBuild.rawBuild` is allowed by the Jenkins
   script security policy; otherwise skip it and report the limitation.
2. **Compile** — native, version-matched:

   ```groovy
   stage('Compile') {
       agent any
       steps {
           dir('target-platform') {
               git branch: '12.0', url: 'https://github.com/ingeint/idempiere-target-platform-plugin.git'
               sh './plugin-builder build ../${PLUGIN_NAME}'
               archiveArtifacts artifacts: "target/${PLUGIN_NAME}-${IDEMPIERE_VERSION}.${BUILD_NUMBER}.jar", fingerprint: true
           }
       }
   }
   ```

   Take the branch from the plugin's core version (`MANIFEST.MF`). Do not hardcode
   a host path for the Maven cache; read it from a job or environment variable.
3. **Archive Readme** — convert `README.md` to `readme.html` with
   `assets/generate_readme.py.template` (a self-contained Markdown-to-HTML
   converter with a dark theme), run it with `sh 'python3 generate_readme.py'`,
   and publish it with `publishHTML`. Keep the template's look so every plugin
   report matches.

## Rules

- Change only the pipeline. Leave Java, `MANIFEST.MF` and `pom.xml` alone unless asked.
- Patch conservatively: keep existing stage names, comments, indentation and order.
- Add no stage, variable, credential or dependency the repository or the user
  does not justify.
- Never hardcode secrets. Use `withCredentials` / `credentials('id')` and tell
  the user which credential id to create.
- Inside Groovy `'''…'''` strings, backslashes in the embedded Python regexes
  must be doubled (`\\*\\*`, `\\1`). Check that every `{` has its `}`.

## Report

The `Jenkinsfile` path, its full new content, and one line saying whether `git`,
Java 17, Maven and `python3` were verified on the node or assumed.

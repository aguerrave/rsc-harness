---
name: idempiere-osgi-framework-listener
description: Use when iDempiere plugin code must react to the whole OSGi framework — run once after every bundle has started (STARTLEVEL_CHANGED) or log framework errors — through a Declarative Services component registered as a FrameworkListener. NOT one bundle's own lifecycle (BundleActivator / @Activate), NOT reacting to a service (@Reference), NOT model or document events (idempiere-plugins).
tags: [idempiere, osgi, frameworklistener, startlevel, startup, arranque, bundles]
recommends: [idempiere-plugins, idempiere-plugin-compiler]
origin: aguerrave
---

# OSGi FrameworkListener in an iDempiere plugin

A bundle's own activation only says that *this* bundle started. To run logic once
the whole container is up, listen to framework events instead.

## Pick the right hook

| You need to react to… | Use |
|---|---|
| The whole framework reaching a start level, or a framework error | `FrameworkListener` (this skill) |
| Your own bundle starting or stopping | `@Activate` / `@Deactivate` or a `BundleActivator` |
| Other bundles being installed or started | `BundleListener` |
| A service appearing or going away | `@Reference` (dynamic) or a `ServiceTracker` |

## Steps

1. Implement `org.osgi.framework.FrameworkListener` on a class annotated
   `@Component(immediate = true)` — start from
   `assets/MyFrameworkListenerComponent.java.template` (GPL-2.0 header).
2. Register in `@Activate` with `context.addFrameworkListener(this)` and remove it
   in `@Deactivate`, using the `BundleContext` passed to the method.
3. In `frameworkEvent`, handle `FrameworkEvent.STARTLEVEL_CHANGED` (check bundle
   states before assuming everything is up) and `FrameworkEvent.ERROR` (log the
   bundle and the throwable with `CLogger`, never `System.out`).
4. The event can fire more than once. Guard one-time work with a flag, as the
   template does.
5. No `Bundle-Activator` is needed for this. The manifest needs
   `Service-Component: OSGI-INF/<fully.qualified.Name>.xml`; the descriptor
   declares the implementation class and needs no `<service>` element, because
   registration happens through the API call in step 2.

## Keep it light

Framework events are delivered on the framework's thread. Do quick checks there
and hand slow work (database migrations, remote calls) to a separate thread or
a scheduled process, or you delay the whole server start.

## Report

The component class, the `OSGI-INF` descriptor and manifest changes, which event
types are handled, and how repeated events are guarded.

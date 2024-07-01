# HTTP Proxy functions

NOTE: This is still fairly experimental.

A collection of functions for creating a HTTP proxy via a set of rules.

Accompanies [@http functions](https://jsr.io/@http), but could be used with any
Deno server/router based on the standard Request/Response functions.

- Configured via a single `Manifest` (JSON or TypeScript module).
- Rules can filter based on URL pattern, method, and the 'role' of the incoming
  request
- Highly pluggable via functions, dynamic modules, or requests to external
  services
- Pluggable 'Role Provider' determines the role of the incoming request
- Pluggable Auditor chains

Docs and examples coming soon (hopefully).

## Example

See the [demo](./demo/main.ts) server.

Usage:

```sh
export OPENAI_API_KEY=...
deno task demo
```

(You can also declare env vars in a `.env` file)

Then hit http://localhost:8000/v1/models in your browser.

## Manifest

The proxy is configured via a Manifest object, take a look at the
[example manifest](./demo/manifest.ts) in the demo, and the
[type declaration](./types.ts).

It is possible to declare the manifest entirely as a JSON file if you can rely
on dynamic modules or remote services for all pluggable parts, otherwise use a
regular typescript module.

Note: [Deno Deploy](https://deno.com/deploy) doesn't currently support dynamic
module imports, so you'll generally need to use a ts module for the manifest,
and statically import role providers, auditor functions.

# deno_http_proxy_fns

NOTE: This is still fairly experimental.

A collection of functions for creating a HTTP proxy via a set of rules.

Accompanies [http_fns](https://deno.land/x/http_fns), but could be used with any
Deno server/router based on the standard Request/Response functions.

- Configured via a single `Manifest` (JSON or TypeScript module).
- Rules can filter based on URL pattern, method, and the 'role' of the incoming
  request
- Highly pluggable via functions, dynamic modules, or requests to external
  services
- Pluggable 'Role Provider' determines the role of the incoming request
- Pluggable Auditor chains

Docs and examples coming soon (hopefully).

import type { Manifest } from "https://deno.land/x/http_proxy_fns@v0.0.2/types.ts";
import audit_log from "https://deno.land/x/http_proxy_fns@v0.0.2/audit/console_log.ts";

export default {
  // The base URL of the target API
  "target": "https://api.openai.com",

  // Declare the roles provider
  "rolesProvider": {
    // For this demo we'll hardcode the provided roles for all requests,
    // normally this would be only used for demonstration, testing and development.
    "as": ["domain:example.com"],

    // Normally you'd use one of the following ways to declare the roles provider:
    // "fn": aRoleProviderFn,
    // "module": "http://example.com/url/to/dyanmically/imported/module.ts",
    // "service": "http://example.com/url/to/remote/service/that/provides/roles",

    params: {
      // Additional parameters passed to the roles provider
    },
  },

  // Declare auditors for all requests
  "auditors": [
    {
      // The kind of audit action to handle
      "kind": ["denied", "error", "aborted"],

      // The Auditor function, may also be a dynamic module or service (like roles provider)
      "fn": audit_log,

      // Example of loading the same auditor via a dynamic module:
      //"module": "https://deno.land/x/http_proxy_fns@v0.0.2/audit/console_log.ts",

      "params": {
        "log": "roles",
      },
    },
    // TODO: demo auditor chains
  ],

  // Declare rules for routes, rules are tested in the order presented until one matches
  "routeRules": [
    {
      // A URLPattern to match against the request URL
      "pattern": "/v1/files{/*}?",

      // Explicitly deny requests that match this rule
      "allow": false,
    },
    {
      "pattern": "/v1/*",

      // Rule only applies if the role matches one provided by the roles provider
      "role": "domain:example.com",

      // Explicitly allow requests that match this rule
      "allow": true,

      // Headers to be added/modified in the outgoing request
      "headers": {
        "Authorization": "Bearer ${OPENAI_API_KEY}",
        "OpenAI-Organization": "${OPENAI_ORG_ID}",
      },
    },
    {
      // Finish with a fallback rule to match any URL and deny the request
      "pattern": "*",
      "allow": false,
    },
  ],
} satisfies Manifest;

import { byPattern } from "@http/route/by-pattern";
import { proxyViaRules } from "./proxy-via-rules.ts";
import { determineRoles } from "./determine-roles.ts";
import { createAuditor } from "./create-auditor.ts";
import type { Manifest } from "./types.ts";
import type { Awaitable } from "@http/route/types";

/**
 * Create a proxy route that forwards requests according to the rules of the given manifest.
 */
export function proxyRoute(
  pattern: string,
  manifest: Manifest,
): (req: Request) => Awaitable<Response | null> {
  return byPattern(
    `${pattern === "/" ? "" : pattern}/:path*`,
    async function (req, info) {
      const [roles, auditor] = await Promise.all([
        determineRoles(req, manifest),
        createAuditor(req, manifest),
      ]);

      const incomingUrl = new URL(req.url);

      // map the req url to the target url from the manifest
      const outgoingUrl = new URL(
        `${manifest.target}/${info.pathname.groups.path ?? ""}`,
      );
      outgoingUrl.search = incomingUrl.search;

      // proxy the request according to the rules in the manifest and the roles of the incoming request
      return proxyViaRules(
        new Request(outgoingUrl, req),
        manifest.routeRules ?? [],
        roles,
        auditor,
      );
    },
  );
}

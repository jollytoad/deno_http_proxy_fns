import type { RoutePattern } from "@http/route/types";
import type { HttpMethod, Role, RouteMethod, RouteRule } from "./types.ts";
import { intersect } from "@std/collections/intersect";

export function roleApplies(rule: RouteRule, roles: Role[]) {
  const ruleRoles = Array.isArray(rule.role) ? rule.role : [rule.role ?? "*"];
  return !!intersect(roles, ruleRoles).length;
}

export function methodApplies(method: RouteMethod = "*", req: Request) {
  const methods = Array.isArray(method) ? method : [method];
  return methods.includes("*") || methods.includes(req.method as HttpMethod);
}

export function patternApplies(pattern: RoutePattern = "*", req: Request) {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const pattern of patterns) {
    const match = pattern === "*" ||
      (typeof pattern === "string"
        ? new URLPattern({ pathname: pattern }).test(req.url)
        : pattern instanceof URLPattern
        ? pattern.test(req.url)
        : new URLPattern(pattern).test(req.url));

    if (match) {
      return true;
    }
  }
  return false;
}

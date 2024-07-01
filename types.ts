import type { HttpMethod, RoutePattern } from "@http/route/types";

export type { HttpMethod, RoutePattern };

/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Declare the rules for access to an API, and mapping from proxy route
 * to target route.
 *
 * eg: https://proxy.example.com/<path> -> <target>/<path>
 */
export interface Manifest {
  /**
   * The base URL of the target service
   */
  target: string;

  /**
   * A function that determines the role(s) of a request.
   */
  rolesProvider?: RolesProviderSpec;

  auditors?: AuditorSpec[];
  routeRules?: RouteRule[];
}

/**
 * One or more HTTP method names, or a wildcard. As used in a {@linkcode RouteRule}.
 */
export type RouteMethod = HttpMethod | HttpMethod[] | "*";

/**
 * One or more role names, or a wildcard. As used in a {@linkcode RouteRule}.
 */
export type RouteRole = Role | Role[] | "*";

/**
 * A rule that determines whether a particular route should be proxied based on
 * the criteria it declares, and additional headers to be set in the request.
 */
export interface RouteRule {
  /**
   * The request URL patterns to match for this rule to apply.
   */
  pattern: RoutePattern;

  /**
   * The request HTTP methods that must match for this rule to apply.
   * Defaults to "*" (all methods apply).
   */
  method?: RouteMethod;

  /**
   * The roles that must match for this rule to apply.
   *
   * The applicable roles of a request are determined by the the `rolesProvider`
   * in the manifest. Defaults to "*" (any role applies).
   */
  role?: RouteRole;

  /**
   * Whether this rule allows or denies proxying of the request.
   *
   * Defaults to false (ie. deny).
   */
  allow?: boolean;

  /**
   * Headers to be added to the proxied request when this rule applies,
   * and proxying is allowed.
   *
   * Values can contain `${VAR}` style placeholders that will be
   * substituted with environment variables.
   */
  headers?: Record<string, string>;
}

/**
 * A common interface for functions declared in the {@linkcode Manifest}.
 *
 * It may be an actual function, the specifier of a module that exports a default function,
 * the URL of an external HTTP service, or something more specific to a particular
 * extended interface.
 *
 * {@linkcode RolesProviderSpec} and {@linkcode AuditorSpec} are the more concrete
 * interfaces that extend from this, see those for their more specific behaviours.
 *
 * @template F the signature of the `fn` function or the default function of the `module`.
 */
export interface PluggableFn<F> {
  /**
   * An actual Javascript function that will be called directly.
   *
   * If set to a valid function, this takes precedence over `module` and `service`.
   */
  fn?: Awaitable<F>;

  /**
   * The specifier of a module, that can be resolved by Deno.
   *
   * A string value can contain `${VAR}` style placeholders that will be
   * substituted with environment variables. A URL object will be not substituted.
   *
   * If this is truthy (ie. not empty) after substitution it will take precedence over `service`.
   */
  module?: string | URL;

  /**
   * The URL of a regular external HTTP server, a `fetch` request will be
   * invoked on this, passing any parameters supplied in `params`.
   *
   * A string value can contain `${VAR}` style placeholders that will be
   * substituted with environment variables. A URL object will be not substituted.
   */
  service?: string | URL;

  /**
   * Additional properties/parameters passed to the function or service.
   */
  params?: Params;
}

/**
 * Parameters for a `service` URL.
 */
export type Params = Record<string, string>;

/**
 * A single role as returned by a roles provider and declared in a rule of the manifest.
 */
export type Role = string;

/**
 * A declaration of a {@linkcode RolesProvider} function within the {@linkcode Manifest}.
 *
 * It may be an actual function, the specifier of a module that exports a default function,
 * the URL of an external HTTP service, or simply hardcoded roles.
 */
export interface RolesProviderSpec extends PluggableFn<RolesProvider> {
  /**
   * Supply these hardcoded roles rather than calling a function or service.
   *
   * This is mainly for testing purposes, allowing you to test the proxy rules
   * for a given role. If this is set it will override `fn`, `module`, and `service`.
   */
  as?: Role[];
}

/**
 * A function that provides the roles determined from a Request.
 *
 * This is declared via a {@linkcode RolesProviderSpec} in the {@linkcode Manifest}.
 *
 * @param req the incoming Request
 * @param params passed from the `params` of the {@link RolesProviderSpec}
 * @returns the set of roles determined from the Request
 */
export type RolesProvider = (
  req: Request,
  params?: Params,
) => Awaitable<Role[] | undefined>;

/**
 * A declaration of an {@linkcode Auditor} function within the {@linkcode Manifest}.
 *
 * It may be an actual function, the specifier of a module that exports a default function,
 * or the URL of an external HTTP service.
 */
export interface AuditorSpec extends PluggableFn<Auditor> {
  /**
   * The kind of actions that this auditor should handle.
   *
   * Defaults to "*" (all kinds of action)
   */
  kind?: AuditKind | AuditKind[] | "*";

  /**
   * Filter actions handled by this auditor based on a URL pattern.
   */
  pattern?: RoutePattern;

  /**
   * Filter actions handled by this auditor based on the HTTP method.
   */
  method?: RouteMethod;

  /**
   * Chain of Auditors, the result of each auditor is passed to the next in the chain,
   * unless an explicit skip (null) is returned.
   * The chain will execute before the auditor defined directly in the AuditorSpec.
   */
  chain?: AuditorChainFn[];
}

/**
 * A declaration of an {@linkcode Auditor} function within a `chain` of an
 * {@linkcode AuditorSpec}.
 */
export type AuditorChainFn = PluggableFn<Auditor> | Auditor;

/**
 * The kinds of actions that can be audited.
 */
export type AuditKind =
  /**
   * When a request has been explicitly denied via an `allow: false` rule
   */
  | "denied"
  /**
   * On every allowed proxied fetch request
   */
  | "request"
  /**
   * On the response of a proxied request
   */
  | "response"
  /**
   * If the proxied fetch request throws an error
   */
  | "error"
  /**
   * If the proxied fetch request is aborted
   */
  | "aborted";

/**
 * A function that handles auditing actions emitted by the proxy.
 *
 * These are declared via {@linkcode AuditorSpec}s in the {@linkcode Manifest}.
 *
 * @param props the audit action or result from a previous auditor in a chain.
 * @returns an optional result to pass to the next auditor in a chain
 */
export type Auditor = (
  props: AuditProps,
) => Awaitable<AuditResult>;

/**
 * Properties of an auditable action, or result of an Auditor.
 */
export interface AuditProps {
  /**
   * The kind of audit
   */
  kind: AuditKind;

  /**
   * The known roles
   */
  roles?: Role[];

  /**
   * The rule that triggered the action
   */
  rule: RouteRule;

  /**
   * The incoming (if `denied` kind) or outgoing Request (for all other kinds)
   */
  request: Request;

  /**
   * The response from the target service, if we have one
   */
  response?: Response;

  /**
   * The error thrown by `fetch` (for `error` kind only)
   */
  error?: unknown;

  /**
   * The reason from an `abort` event of a `fetch` (for `aborted` kind only)
   */
  reason?: unknown;

  /**
   * The `params` passed from the {@linkcode AuditorSpec}.
   */
  params?: Params;
}

/**
 * The result of an {@linkcode Auditor} function.
 *
 * Maybe an {@linkcode AuditProps} object, which is then passed to subsequent
 * auditors in a chain, or `null` to terminate a chain of auditors, or
 * `undefined`/`void` to indicate no change in the properties, and the same action
 * will continue to be passed along the chain.
 */
export type AuditResult = void | null | AuditProps;

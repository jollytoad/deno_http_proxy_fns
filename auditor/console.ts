import type { AuditKind, AuditProps } from "../types.ts";

const kindStyles: Record<AuditKind, string> = {
  "denied": "color: red;",
  "request": "color: green;",
  "response": "color: yellow;",
  "error": "color: red;",
  "aborted": "color: orange;",
};

/**
 * Auditor that logs entries to the console.
 */
export default function auditConsole(props: AuditProps): void {
  console.log(
    `%c${props.kind} rule: "${
      props.rule.method || "*"
    } ${props.rule.pattern}", url: "${props.request.url}"`,
    kindStyles[props.kind],
  );
  const indent = " ".repeat(props.kind.length);
  if (props.reason) {
    console.log(
      `%c${indent} reason: ${props.reason}`,
      kindStyles[props.kind],
    );
  }
  if (props.params?.log === "roles") {
    console.log(
      `%c${indent} roles: ${props.roles}`,
      kindStyles[props.kind],
    );
  }
}

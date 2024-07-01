import "@std/dotenv/load";
import { withFallback } from "@http/route/with-fallback";
import { proxyRoute } from "../mod.ts";
import manifest from "./manifest.ts";

await Deno.serve(withFallback(proxyRoute("/", manifest))).finished;

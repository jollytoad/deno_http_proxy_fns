import "https://deno.land/std@0.200.0/dotenv/load.ts";
import { withFallback } from "https://deno.land/x/http_fns@v0.0.27/fallback.ts";
import { proxyRoute } from "../proxy.ts";
import manifest from "./manifest.ts";

await Deno.serve(withFallback(proxyRoute("/", manifest))).finished;

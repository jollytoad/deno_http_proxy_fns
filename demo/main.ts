import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { withFallback } from "https://deno.land/x/http_fns@v0.0.16/fallback.ts";
import { proxyRoute } from "https://deno.land/x/http_proxy_fns@v0.0.2/proxy.ts";
import manifest from "./manifest.ts";

await serve(withFallback(proxyRoute("/", manifest)));

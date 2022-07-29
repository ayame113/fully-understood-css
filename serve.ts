import { serve as sereHandler } from "https://deno.land/std@0.149.0/http/server.ts";
import * as path from "https://deno.land/std@0.149.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.150.0/media_types/mod.ts";

import { listeners } from "./listener.ts";

// export for test
export function serve() {
  const controller = new AbortController();
  const server = sereHandler(async (request) => {
    const url = new URL(request.url);

    // serving dynamic web page from listener.ts
    try {
      for (const listener of listeners) {
        if (listener.pattern.test(url)) {
          return listener.handler({ request, url });
        }
      }
    } catch {
      return new Response("500 Internal Server Error\n", { status: 500 });
    }

    // serving static web page from static folder
    try {
      return new Response(
        await Deno.readFile(
          new URL(`./static${url.pathname}`, import.meta.url),
        ),
        {
          headers: {
            "Content-Type": contentType(path.extname(request.url)) ??
              "text/plain; charset=utf-8",
          },
        },
      );
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response("404 Not Found\n", { status: 404 });
      }
      return new Response("500 Internal Server Error\n", { status: 500 });
    }
  }, controller);
  return { server, controller };
}

if (import.meta.main) {
  serve();
}

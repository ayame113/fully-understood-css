// Using dotenv only for local development.
// For deno deploy, using built-in environment variable support.
try {
  if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
    await import("https://deno.land/x/dotenv@v3.0.0/load.ts");
  }
} catch { /**/ }

interface Listener {
  pattern: URLPattern;
  handler: ((
    { request, url }: { request: Readonly<Request>; url: Readonly<URL> },
  ) => Response | Promise<Response>);
}

export const listeners: Listener[] = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    handler: async () => {
      return new Response(
        await Deno.readFile(new URL("./static/index.html", import.meta.url)),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      );
    },
  },
];

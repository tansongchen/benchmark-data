interface Env {
  BENCHMARK: KVNamespace;
}

const fetch = async (request: Request, env: Env) => {
  const { url, method } = request;
  const { pathname } = new URL(url);
  const name = pathname.slice(1);
  switch (method) {
    case "GET":
      const { keys } = await env.BENCHMARK.list({ prefix: name });
      const result: Record<string, any> = {};
      for (const key of keys) {
        const value = await env.BENCHMARK.get(key.name);
        result[key.name] = JSON.parse(value!);
      }
      return new Response(JSON.stringify(result));
    case "PUT":
      const upload = await request.json();
      const { commit } = (upload as any).context;
      const key = `${name}#${commit}`;
      await env.BENCHMARK.put(key, JSON.stringify(upload));
      return new Response(JSON.stringify({ success: true }));
    default:
      return new Response("Unknown method");
  }
};

export default { fetch };

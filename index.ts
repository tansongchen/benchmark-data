interface Env {
  BENCHMARK: D1Database;
}

interface Benchmark {
  name: string;
  commit: string;
  datetime: string;
  branch: string;
  tag?: string;
  config: object;
  result: object;
}

interface BenchmarkModel extends Omit<Benchmark, "tag" | "config" | "result"> {
  tag: string | null;
  config: string;
  result: string;
}

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const dump = (body: Benchmark) => {
  const { tag, config, result, ...rest } = body;
  return {
    ...rest,
    tag: tag || null,
    config: JSON.stringify(config),
    result: JSON.stringify(result),
  };
};

const load = (model: BenchmarkModel) => {
  const { tag, config, result, ...rest } = model;
  const body = {
    ...rest,
    config: JSON.parse(config),
    result: JSON.parse(result),
  };
  if (tag) {
    return { ...body, tag };
  }
  return body;
};

const fetch = async (request: Request, env: Env) => {
  const { url, method } = request;
  switch (method) {
    case "GET":
      const { pathname } = new URL(url);
      const [name1] = pathname.slice(1).split("/");
      if (!name1) {
        return new Response("Invalid path", { headers });
      }
      const { results } = await env.BENCHMARK.prepare(
        "SELECT * FROM benchmark WHERE name = ?"
      )
        .bind(name1)
        .all();
      const processed = (results as any[]).map(load);
      return new Response(JSON.stringify(processed), { headers });
    case "PUT":
      const { commit, datetime, name, branch, tag, config, result } = dump(
        (await request.json()) as any
      );
      await env.BENCHMARK.prepare(
        "INSERT INTO benchmark ('commit', 'datetime', 'name', 'branch', 'tag', 'config', 'result') VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(commit, datetime, name, branch, tag, config, result)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers });
    case "OPTIONS":
      return new Response(null, { headers });
    default:
      return new Response("Unknown method");
  }
};

export default { fetch };

import { readFileSync } from "fs";
import axios from "axios";

const data = JSON.parse(readFileSync("data.json", "utf-8"));

const result = [];

function process(data: Record<string, any>): any[] {
  return Object.entries(data).map(([key, value]) => {
    if ("data" in value) {
      return {
        name: key,
        ...value,
        data: process(value.data),
      };
    } else {
      return { name: key, ...value };
    }
  });
}

for (const [key, value] of Object.entries(data)) {
  const { suite, config, context } = value as any;
  context["config"] = config;
  context["name"] = "TaylorDiff.jl";
  context["result"] = process(suite.data);
  result.push(context);
}

result.forEach(async (r) => {
  await axios.put("https://benchmark-data.tansongchen.workers.dev", r);
});

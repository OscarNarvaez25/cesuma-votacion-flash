const { Redis } = require("@upstash/redis");

const OPTIONS = ["flash", "alineacion", "status"];
const KEY = "cesuma_vote_counts";

const redis = Redis.fromEnv();

async function getCounts() {
  const counts = await redis.hgetall(KEY);
  const result = { flash: 0, alineacion: 0, status: 0 };
  if (counts) {
    for (const k of OPTIONS) result[k] = Number(counts[k] || 0);
  }
  return result;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    res.status(200).json(await getCounts());
    return;
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const option = body && body.option;
    if (!OPTIONS.includes(option)) {
      res.status(400).json({ error: "invalid option" });
      return;
    }
    await redis.hincrby(KEY, option, 1);
    res.status(200).json(await getCounts());
    return;
  }

  res.status(405).json({ error: "method not allowed" });
};

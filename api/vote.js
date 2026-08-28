// Serverless function (Vercel "Other"/zero-config: any file under /api
// becomes a function automatically, Node.js runtime, no build step needed).
//
// Keeps vote counts in memory for the life of the warm serverless instance.

const OPTIONS = ["flash", "alineacion", "status"];

if (!globalThis.__cesumaVoteCounts) {
  globalThis.__cesumaVoteCounts = { flash: 0, alineacion: 0, status: 0 };
}

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    res.status(200).json(globalThis.__cesumaVoteCounts);
    return;
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const option = body && body.option;
    if (!OPTIONS.includes(option)) {
      res.status(400).json({ error: "invalid option" });
      return;
    }
    globalThis.__cesumaVoteCounts[option] += 1;
    res.status(200).json(globalThis.__cesumaVoteCounts);
    return;
  }

  res.status(405).json({ error: "method not allowed" });
};

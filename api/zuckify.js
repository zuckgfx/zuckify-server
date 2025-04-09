export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  const { image } = req.body;

  if (!image) return res.status(400).json({ error: "Missing image" });

  const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: "Token r8_bDn8FhMNeRQ35KmWnwRJx9UIPLPqZ4R14pqzS",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "7d9cfcfae2888caa2598d1e3bb5e6e0f84a7d8f3d89c875c122a9bc3312573b0",
      input: {
        image: image,
        prompt: "cyberpunk cartoon portrait of a person, digital art, ultra detailed"
      }
    }),
  });

  const replicateJson = await replicateResponse.json();

  if (!replicateJson.urls || !replicateJson.urls.get) {
    return res.status(500).json({ error: "No polling URL returned" });
  }

  let outputUrl = null;
  while (!outputUrl) {
    const pollRes = await fetch(replicateJson.urls.get, {
      headers: {
        Authorization: "Token r8_bDn8FhMNeRQ35KmWnwRJx9UIPLPqZ4R14pqzS",
      },
    });

    const pollJson = await pollRes.json();

    if (pollJson.status === "succeeded") {
      outputUrl = pollJson.output[0];
      break;
    }

    if (pollJson.status === "failed") {
      return res.status(500).json({ error: "Generation failed" });
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  res.status(200).json({ url: outputUrl });
}

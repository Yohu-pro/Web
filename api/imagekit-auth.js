import crypto from "crypto";

export default function handler(req, res) {
  try {
    const customPrivateKey = req.query.privateKey;
    const privateKey = customPrivateKey || process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return res.status(400).json({
        error: "IMAGEKIT_PRIVATE_KEY chưa được cấu hình!",
      });
    }

    const token = req.query.token || crypto.randomUUID();
    const expire =
      req.query.expire || String(Math.floor(Date.now() / 1000) + 1800);
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    res.json({ token, expire, signature });
  } catch (error) {
    res.status(500).json({ error: `Lỗi sinh chữ ký: ${error.message}` });
  }
}

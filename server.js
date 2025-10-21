// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// For serving static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// ✅ Cashfree payment verification
app.post("/verify-payment", async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) return res.status(400).json({ success: false, message: "Missing order_id" });

    const authHeader = Buffer.from(`${process.env.App_ID}:${process.env.Secret_Key}`).toString("base64");

    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${order_id}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.order_status === "PAID") {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return res.json({
        success: true,
        accessCode: `G10-${randomCode}`,
        message: "Payment verified successfully ✅",
      });
    }

    res.status(400).json({ success: false, message: "Payment not completed yet" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error verifying payment" });
  }
});

// ✅ Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

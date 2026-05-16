/**
 * keep-alive.js
 * Run this on your local machine or any free cron service
 * to prevent Render free tier from sleeping after 15 min inactivity.
 *
 * Free cron services you can use:
 * - https://cron-job.org (free, ping every 10 min)
 * - https://uptimerobot.com (free, monitors every 5 min)
 *
 * Just add your Render URL to either service — no code needed.
 * This file is just for reference if you want to run it locally.
 */

const RENDER_URL = 'https://dmrc-metro-api.onrender.com/health';
const INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes

async function ping() {
  try {
    const res = await fetch(RENDER_URL);
    const data = await res.json();
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Server alive:`, data.status);
  } catch (err) {
    console.log(`[${new Date().toLocaleTimeString()}] ❌ Server ping failed:`, err.message);
  }
}

ping();
setInterval(ping, INTERVAL_MS);

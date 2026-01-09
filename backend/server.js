const express = require("express");
const https = require("https");
const cors = require("cors");

const app = express();
const PORT = 5000;
const mockData = require("../mockData");

/* =========================
   MIDDLEWARE
========================= */
const corsOptions = {
    // origin: "https://gen-z-games.vercel.app",
    origin: "https://meta-youtube-instagram-face-git-e0bd81-vishwajeet1729s-projects.vercel.app",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
/*
https://meta-youtube-instagram-face-git-e0bd81-vishwajeet1729s-projects.vercel.app/
*/
app.use(express.json());

/* =========================
   CONFIG
========================= */
// 👉 PUT YOUR REAL API KEY HERE
// 👉 API KEYS
const TWITTER_AUTH_TOKEN = "bdebe4e7-673c-4dc8-92a0-54a33f3e478b";
const INSTAGRAM_AUTH_TOKEN = "f299f677-f27c-4021-92d6-e58f3f8be873";
const FACEBOOK_AUTH_TOKEN = "854dfe0f-ef90-4496-b1a1-c02e8029a404";

const getHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
});

/* =========================
   HELPER: DOWNLOAD SNAPSHOT
========================= */
function pollSnapshot(authToken, snapshotId, res, attempt = 1, fallbackData = []) {
    const MAX_RETRIES = 100; // 5 minutes total
    const DELAY = 3000;

    const options = {
        hostname: "api.brightdata.com",
        path: `/datasets/v3/snapshot/${snapshotId}/download`,
        method: "GET",
        headers: getHeaders(authToken)
    };

    const req = https.request(options, apiRes => {
        let raw = "";

        apiRes.on("data", chunk => (raw += chunk));

        apiRes.on("end", () => {
            try {
                // 1. Check for non-200 status
                if (apiRes.statusCode !== 200) {
                    console.log(`⚠️ Snapshot download returned status ${apiRes.statusCode}. Treating as pending.`);
                    isPending = true;
                }

                // 2. Check if raw is the "still in progress" message or HTML error
                try {
                    if (raw.trim().startsWith("<")) {
                        console.log("⚠️ Received HTML response. Content preview:", raw.substring(0, 200));
                        isPending = true;
                    } else {
                        const json = JSON.parse(raw);
                        if (json.message && (json.message.includes("in progress") || json.status === "running")) {
                            isPending = true;
                        }
                    }
                } catch (e) {
                    // Not a single JSON object, likely JSONL data
                }

                if (isPending || raw.trim().length === 0) {
                    if (attempt < MAX_RETRIES) {
                        console.log(`⏳ Snapshot not ready (or empty/HTML), retrying (${attempt}/${MAX_RETRIES})...`);
                        console.log(`⏳ Snapshot not ready (or empty/HTML), retrying (${attempt}/${MAX_RETRIES})...`);
                        return setTimeout(() => pollSnapshot(authToken, snapshotId, res, attempt + 1, fallbackData), DELAY);
                    } else {
                        console.warn("⚠️ Polling timed out. Returning MOCK DATA to ensure UI functionality.");
                        return res.json({ data: fallbackData });
                    }
                }

                console.log("📥 SNAPSHOT RAW DATA (Preview):", raw.substring(0, 100));

                // 2. Parse JSONL
                const lines = raw
                    .split("\n")
                    .map(l => l.trim())
                    .filter(Boolean);

                const parsed = lines.map(l => JSON.parse(l));
                return res.json({ data: parsed });

            } catch (err) {
                console.error("❌ Snapshot parse error:", err.message);
                // If it fails to parse, it might be empty or actually invalid
                // But if we exceeded retries, we would have exited.
                // Assuming it's a hard error now.
                return res.status(500).json({
                    error: "Failed to parse snapshot",
                    raw: raw.substring(0, 500) // Limit output
                });
            }
        });
    });

    req.on("error", err => {
        console.error("❌ Snapshot download error:", err);
        return res.status(500).json({
            error: "Snapshot download failed"
        });
    });

    req.end();
}

/* =====================================================
   🐦 TWITTER PROFILE POSTS (AUTO – LAST POSTS)
===================================================== */
app.post("/api/twitter/profile-posts", (req, res) => {
    console.log("➡️ Incoming body:", req.body);

    const { url, start_date = "", end_date = "" } = req.body;

    // ✅ Validation
    if (!url || typeof url !== "string" || !url.startsWith("https://x.com/")) {
        return res.status(400).json({
            error: "Invalid or missing Twitter profile URL",
            example: "https://x.com/BJP4Maharashtra"
        });
    }

    console.log("🚀 Starting scrape for:", url);

    const startOptions = {
        hostname: "api.brightdata.com",
        path:
            "/datasets/v3/scrape?dataset_id=gd_lwxkxvnf1cynvib9co" +
            "&notify=false&include_errors=true" +
            "&type=discover_new" +
            "&discover_by=profile_url_most_recent_posts",
        method: "POST",
        headers: getHeaders(TWITTER_AUTH_TOKEN)
    };

    const startReq = https.request(startOptions, apiRes => {
        let raw = "";

        apiRes.on("data", chunk => (raw += chunk));

        apiRes.on("end", () => {
            console.log("🧩 START RESPONSE:");
            console.log(raw);

            let parsed;
            try {
                // Check if account is inactive
                if (raw.includes("Customer is not active")) {
                    console.warn("⚠️ BrightData Account Inactive. Returning MOCK DATA.");
                    return res.json({ data: mockData.twitter });
                }

                parsed = JSON.parse(raw);
            } catch {
                console.warn("⚠️ Failed to parse response (likely HTML error page). Returning MOCK DATA.");
                return res.json({ data: mockData.twitter });
            }

            const snapshotId = parsed?.snapshot_id || parsed?.data?.[0]?.snapshot_id;

            if (!snapshotId) {
                return res.status(500).json({
                    error: "Snapshot ID not returned",
                    response: parsed
                });
            }

            console.log("🆔 Snapshot ID:", snapshotId);

            // ⏳ Start polling immediately with fallback
            // ⏳ Start polling immediately with fallback
            pollSnapshot(TWITTER_AUTH_TOKEN, snapshotId, res, 1, mockData.twitter);
        });
    });

    startReq.on("error", err => {
        console.error("❌ Start scrape error:", err);
        return res.status(500).json({
            error: "Failed to start Bright Data scrape"
        });
    });

    startReq.write(
        JSON.stringify({
            input: [{ url, start_date, end_date }]
        })
    );

    startReq.end();
});

/* =====================================================
   🐦 COLLECT POSTS BY POST URL
===================================================== */
app.post("/api/twitter/posts-by-url", (req, res) => {
    const { input } = req.body;

    if (!Array.isArray(input) || input.length === 0) {
        return res.status(400).json({
            error: "input must be an array of tweet URLs"
        });
    }

    const options = {
        hostname: "api.brightdata.com",
        path:
            "/datasets/v3/scrape?dataset_id=gd_lwxkxvnf1cynvib9co" +
            "&notify=false&include_errors=true&sync=true",
        method: "POST",
        headers: getHeaders(TWITTER_AUTH_TOKEN)
    };

    const apiReq = https.request(options, apiRes => {
        let raw = "";

        apiRes.on("data", chunk => (raw += chunk));

        apiRes.on("end", () => {
            try {
                const lines = raw
                    .split("\n")
                    .map(l => l.trim())
                    .filter(Boolean);

                const parsed = lines.map(l => JSON.parse(l));
                res.json({ data: parsed });

            } catch (err) {
                res.status(500).json({
                    error: "Failed to parse response",
                    raw
                });
            }
        });
    });

    apiReq.write(JSON.stringify({ input }));
    apiReq.end();
});

/* =======================================
   INSTAGRAM: Profile Posts (async snapshot)
========================================= */
/* =======================================
   INSTAGRAM: Profile Posts (async snapshot)
========================================= */
// Removed downloadInstagramSnapshot as we reuse pollSnapshot

app.post("/api/instagram/profile-posts", (req, res) => {
    const { url, num_of_posts = 30, start_date = "", end_date = "" } = req.body;

    if (!url || !url.startsWith("https://www.instagram.com")) {
        return res.status(400).json({
            error: "Invalid Instagram profile URL",
            example: "https://www.instagram.com/bjp4maharashtra/"
        });
    }

    console.log("➡️ Instagram profile scrape started:", url);

    const startOptions = {
        hostname: "api.brightdata.com",
        path:
            `/datasets/v3/scrape?dataset_id=gd_lyclm20il4r5helnj&notify=false&include_errors=true&type=discover_new&discover_by=url`,
        method: "POST",
        headers: getHeaders(INSTAGRAM_AUTH_TOKEN)
    };

    const startReq = https.request(startOptions, apiRes => {
        let raw = "";
        apiRes.on("data", chunk => (raw += chunk));
        apiRes.on("end", () => {
            console.log("🧩 START RESPONSE (Instagram):");
            console.log(raw);

            let parsed;
            try {
                if (raw.includes("Customer is not active")) {
                    console.warn("⚠️ BrightData Account Inactive. Returning MOCK INSTAGRAM DATA.");
                    return res.json({ data: mockData.instagram });
                }

                // 1. Try standard JSON parse (for snapshot_id)
                parsed = JSON.parse(raw);
            } catch (err) {
                // 2. If valid JSON fails, it might be JSONL (actual data stream)
                try {
                    console.log("⚠️ JSON parse failed, trying JSONL parsing...");
                    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
                    const jsonlData = lines.map(l => JSON.parse(l));

                    if (Array.isArray(jsonlData) && jsonlData.length > 0) {
                        console.log(`✅ Successfully parsed ${jsonlData.length} items from initial response.`);
                        return res.json({ data: jsonlData });
                    }
                } catch (jsonlErr) {
                    console.warn("⚠️ Failed to parse Instagram response (JSON & JSONL). Returning MOCK INSTAGRAM DATA.");
                    return res.json({ data: mockData.instagram });
                }
            }

            // If we got here, 'parsed' is a single JSON object (snapshot response)
            const snapshotId = parsed?.snapshot_id || parsed?.data?.[0]?.snapshot_id;

            if (!snapshotId) {
                console.error("❌ No snapshot_id found in JSON response", parsed);
                return res.json({ data: mockData.instagram });
            }

            console.log("📌 Instagram snapshot ID:", snapshotId);

            // Use the robust polling mechanism
            // Use the robust polling mechanism
            pollSnapshot(INSTAGRAM_AUTH_TOKEN, snapshotId, res, 1, mockData.instagram);
        });
    });

    startReq.on("error", err => {
        console.error("❌ Instagram start request error", err);
        return res.json({ data: mockData.instagram }); // Fallback on request error
    });

    startReq.write(
        JSON.stringify({
            input: [{ url, num_of_posts, start_date, end_date }]
        })
    );

    startReq.end();
});


/* ======================================
   FACEBOOK – PAGE POSTS ANALYTICS
====================================== */
app.post("/api/facebook/profile-posts", (req, res) => {
    const { url, num_of_posts = 50, start_date = "", end_date = "" } = req.body;

    if (!url || !url.includes("facebook.com")) {
        return res.status(400).json({
            error: "Invalid Facebook page URL",
            example: "https://www.facebook.com/bjpformaharashtra"
        });
    }

    console.log("➡️ Facebook page scrape started:", url);

    const startOptions = {
        hostname: "api.brightdata.com",
        path:
            "/datasets/v3/scrape?dataset_id=gd_lkaxegm826bjpoo9m5&notify=false&include_errors=true",
        method: "POST",
        headers: getHeaders(FACEBOOK_AUTH_TOKEN)
    };

    const startReq = https.request(startOptions, apiRes => {
        let raw = "";
        apiRes.on("data", chunk => (raw += chunk));
        apiRes.on("end", () => {
            console.log("🧩 START RESPONSE (Facebook):");
            console.log(raw); // Enable logging for debugging

            let parsed;
            try {
                if (raw.includes("Customer is not active")) {
                    console.warn("⚠️ BrightData Account Inactive. Returning MOCK FACEBOOK DATA.");
                    return res.json({ data: mockData.facebook });
                }

                // 1. Try standard JSON parse for snapshot_id
                parsed = JSON.parse(raw);
            } catch (err) {
                // 2. Try JSONL if standard parse fails
                try {
                    console.log("ℹ️ Received multi-line data (JSONL). Parsing items...");
                    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
                    const jsonlData = lines.map(l => {
                        try { return JSON.parse(l); } catch (e) { return null; }
                    }).filter(Boolean);

                    if (Array.isArray(jsonlData) && jsonlData.length > 0) {
                        console.log(`✅ Successfully parsed ${jsonlData.length} items (Facebook).`);

                        // Normalize data to match Frontend expectations
                        const normalizedData = jsonlData.map(item => ({
                            id: item.post_id || `fb-${Math.random().toString(36).substr(2, 9)}`,
                            date_posted: item.date_posted,
                            text: item.content || item.original_post?.content || item.link_description_text || "No content",
                            likes: item.likes || item.num_likes || 0,
                            comments: item.num_comments || 0,
                            shares: item.num_shares || 0,
                            views: item.num_views || 0,
                            url: item.url
                        }));

                        return res.json({ data: normalizedData });
                    }
                } catch (jsonlErr) {
                    console.warn("⚠️ Failed to parse Facebook response. Returning MOCK FACEBOOK DATA.");
                    return res.json({ data: mockData.facebook });
                }
            }

            const snapshotId = parsed?.snapshot_id || parsed?.data?.[0]?.snapshot_id;

            if (!snapshotId) {
                console.error("❌ No snapshot_id found in Facebook response", parsed);
                return res.json({ data: mockData.facebook });
            }

            console.log("📌 Facebook snapshot ID:", snapshotId);

            // Use the robust polling mechanism
            // Use the robust polling mechanism
            pollSnapshot(FACEBOOK_AUTH_TOKEN, snapshotId, res, 1, mockData.facebook);
        });
    });

    startReq.on("error", err => {
        console.error("❌ Facebook start request error", err);
        return res.json({ data: mockData.facebook });
    });

    startReq.write(
        JSON.stringify({
            input: [{ url, num_of_posts, start_date, end_date }]
        })
    );

    startReq.end();
});


/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

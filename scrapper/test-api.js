const https = require("https");

const data = JSON.stringify({
    input: [
        { url: "https://x.com/FabrizioRomano/status/1683559267524136962" },
        { url: "https://x.com/FabrizioRomano/status/1552015619251634176" },
        { url: "https://x.com/FabrizioRomano/status/1665296716721946625" },
        { url: "https://x.com/CNN/status/1796673270344810776" }
    ],
});

const options = {
    hostname: "api.brightdata.com",
    path: "/datasets/v3/scrape?dataset_id=gd_lwxkxvnf1cynvib9co&notify=false&include_errors=true&sync=true",
    method: "POST",
    headers: {
        "Authorization": "Bearer da1401f7-f586-46e5-a3f3-086f3261bf0c",
        "Content-Type": "application/json",
    },
};

console.log("Testing Brightdata API...");
console.log("Request options:", options);
console.log("Request data:", data);

const req = https.request(options, (res) => {
    let responseData = "";

    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);

    res.on("data", (chunk) => {
        responseData += chunk;
    });

    res.on("end", () => {
        console.log("\n=== RAW RESPONSE ===");
        console.log(responseData);
        console.log("\n=== ATTEMPTING TO PARSE ===");
        try {
            const parsed = JSON.parse(responseData);
            console.log("Parsed successfully:", JSON.stringify(parsed, null, 2));
        } catch (error) {
            console.error("Failed to parse:", error.message);
        }
    });
});

req.on("error", (error) => {
    console.error("Request error:", error);
});

req.write(data);
req.end();

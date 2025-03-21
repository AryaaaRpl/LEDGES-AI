const express = require('express');
const https = require('https');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware for parsing JSON
app.use(express.json());

// Middleware to serve static files from the main folder
app.use(express.static(path.join(__dirname)));

// Setup multer for image uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Endpoint to receive messages from the frontend (chat)
app.post('/chat', (req, res) => {
    const userInput = req.body.message;

    // Correct payload format
    const payload = JSON.stringify({
        model: "llama-3.1-8b-instant", // Replace with a valid model
        messages: [{
            role: "user",
            content: userInput
        }]
    });

    const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions', // Correct endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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` // Replace with your API key
        }
    };

    const apiRequest = https.request(options, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
            data += chunk;
        });

        apiResponse.on('end', () => {
            if (apiResponse.statusCode === 200) {
                try {
                    const parsedData = JSON.parse(data);
                    res.json({ reply: parsedData.choices[0].message.content });
                } catch (error) {
                    res.status(500).json({ error: "Failed to process API response" });
                }
            } else {
                res.status(apiResponse.statusCode).json({ error: `Error: ${data}` });
            }
        });
    });

    apiRequest.on('error', (error) => {
        res.status(500).json({ error: `Connection failed: ${error.message}` });
    });

    apiRequest.write(payload);
    apiRequest.end();
});

// Endpoint to detect uploaded images
app.post('/detect', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send({ error: "No image uploaded." });

    try {
        const imageBuffer = req.file.buffer;

        // Logic to process the image with AI (object detection)
        // For example, using an object detection API or local AI model

        const detectedObjects = "Detected objects from the image"; // Replace with detection results

        res.send({ reply: detectedObjects }); // Send detection results back to the frontend

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error processing image." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

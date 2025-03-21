const express = require('express');
const https = require('https');
const multer = require('multer'); 

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware untuk parsing JSON
app.use(express.json());
const path = require('path');

// Middleware untuk menyajikan file statis dari folder utama
app.use(express.static(path.join(__dirname)));


app.post('/chat', (req, res) => {
    const userInput = req.body.message;

    // Format payload yang benar
    const payload = JSON.stringify({
        model: "llama-3.1-8b-instant", // Ganti dengan model yang valid
        messages: [{
            role: "user",
            content: userInput
        }]
    });

    const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions', // Endpoint yang benar
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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` // Ganti dengan API key Anda
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
                    res.status(500).json({ error: "Gagal memproses respons API" });
                }
            } else {
                res.status(apiResponse.statusCode).json({ error: `Error: ${data}` });
            }
        });
    });

    apiRequest.on('error', (error) => {
        res.status(500).json({ error: `Koneksi gagal: ${error.message}` });
    });

    apiRequest.write(payload);
    apiRequest.end();
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});


// Middleware untuk parsing JSON
app.use(express.json());

// Middleware untuk menyajikan file statis dari folder utama
app.use(express.static(path.join(__dirname)));


// Setup multer untuk mengunggah gambar
const storage = multer.memoryStorage(); // Simpan file dalam memori
const upload = multer({ storage });

// Endpoint untuk menerima pesan dari frontend (chat)
app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body.message;
        // Process input...
        res.json({ reply: "Your response here" }); // Send valid JSON
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: "An error occurred while processing your request." }); // Return JSON on error
    }
});


// Endpoint untuk mendeteksi gambar yang diunggah
app.post('/detect', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send({ error: "No image uploaded." });

    try {
       const imageBuffer = req.file.buffer;

       // Logika untuk memproses gambar dengan AI (deteksi objek)
       // Misalnya menggunakan API deteksi objek atau model AI lokal

       const detectedObjects = "Detected objects from the image"; // Ganti dengan hasil deteksi

       res.send({ reply: detectedObjects }); // Kirim kembali hasil deteksi ke frontend

    } catch (error) {
       console.error(error);
       res.status(500).send({ error: "Error processing image." });
    }
    
});


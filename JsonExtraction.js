const express = require('express');
const bodyParser = require('body-parser');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || !imageBase64.startsWith("data:image/png;base64,")) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing imageBase64"
      });
    }

  
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');

 
    const filePath = path.join(__dirname, 'temp.png');
    fs.writeFileSync(filePath, base64Data, 'base64');

   
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');

   
    const cleaned = text.trim();
    const extractedData = JSON.parse(cleaned);

    
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: extractedData,
      message: "Successfully extracted JSON from image"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to extract JSON: ${error.message}`
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

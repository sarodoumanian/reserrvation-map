require("dotenv").config()
const express = require('express');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = 3000;

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });


const dataFilePath = path.join(__dirname, 'data.json');

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public')); 

const recipients = [
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_CHAT_ID_1,
    process.env.TELEGRAM_CHAT_ID_2
  ];
  
  async function sendTelegramAlert(message) {
    for (const chatId of recipients) {
      try {
        await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error(`❌ Failed to send to ${chatId}:`, err.message);
      }
    }
  }


// Load saved data
app.get('/data', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });
    res.json(JSON.parse(data || '{}'));
  });
});


app.post('/save', (req, res) => {
  const incomingData = req.body;

  const expectedKeys = [
    "table1", "table2", "table3", "table4", "table5",
    "table6", "table7", "table8", "table9", "table10",
    "table11", "table12", "table13", "table14", "table15", "table16"
  ];

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    let currentData = {};
    if (!err && data) {
      try {
        currentData = JSON.parse(data);
      } catch (e) {
        console.warn("⚠️ Corrupted JSON. Resetting.");
      }
    }

    const newData = {};
    expectedKeys.forEach(key => {
      const incoming = incomingData[key];
      if (incoming && typeof incoming === 'object') {
        newData[key] = {
          value: incoming.value || "",
          x: Boolean(incoming.x)
        };
      } else {
        newData[key] = currentData[key] || { value: "", x: false };
      }
    });

    fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), (err) => {
      if (err) {
        console.error("❌ Write error:", err);
        return res.status(500).json({ error: 'Failed to save data' });
      }
      sendTelegramAlert("New Reservation!");
      res.json({ success: true });
    });
  });
});

app.post('/update-checkbox', (req, res) => {
  const { id, x } = req.body;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Read error:', err);
      return res.status(500).json({ error: 'Failed to read file' });
    }

    let currentData = {};
    try {
      currentData = JSON.parse(data || '{}');
    } catch (e) {
      console.warn("⚠️ Corrupted JSON. Resetting.");
    }

    if (currentData[id]) {
      currentData[id].x = x;
    }

    fs.writeFile(dataFilePath, JSON.stringify(currentData, null, 2), (err) => {
      if (err) {
        console.error('❌ Write error:', err);
        return res.status(500).json({ error: 'Failed to save checkbox state' });
      }
      res.json({ success: true });
    });
  });
});

  

app.post('/reset', (req, res) => {
  const resetData = {};
  [
    "table1", "table2", "table3", "table4", "table5",
    "table6", "table7", "table8", "table9", "table10",
    "table11", "table12", "table13", "table14", "table15", "table16"
  ].forEach(key => {
    resetData[key] = { value: "", x: false };
  });

  fs.writeFile(dataFilePath, JSON.stringify(resetData, null, 2), (err) => {
    if (err) {
      console.error('❌ Failed to reset data file:', err);
      return res.status(500).json({ error: 'Failed to reset data file' });
    }

    console.log('✅ Data file reset successfully');
    res.json({ success: true });
  });
});

  


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


  
  
  
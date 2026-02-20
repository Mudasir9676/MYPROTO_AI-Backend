const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

const allowedOrigins = [
  process.env.CLIENT_URL,       // your deployed frontend
  'http://localhost:4200',      // Angular dev server
];

// Single CORS middleware with logs
app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS check. Request origin:", origin);

    if (!origin) {
      // e.g., curl or same-origin request
      console.log("No origin, allowing request");
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      console.log("Allowed origin:", origin);
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // allow cookies if needed
}));

app.use(express.json());

const Groq = require("groq-sdk");

app.use(cors());
app.use(express.json());

app.get("/test",(req,res)=>{
    res.json({message:"server is working"})
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const axios = require("axios");
async function sendTelegramNotification(message) {
  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
    }
  );
}

const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});

// app.post("/ask",(req,res)=>{
//     const {question} = req.body;
//     console.log("user asked:",question);
 

//     res.json({
//         answer:"THsi is a summy res for now"
//     })
// })


app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    await sendTelegramNotification(`🚀question: ${question}`);

    console.log("User asked:", question);
    const model =process.env.MODEL;
    const systemPromt =process.env.SYSTEM_PROMPT;
    const completion = await groq.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPromt,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
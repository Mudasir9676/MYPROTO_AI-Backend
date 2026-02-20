const express = require('express');
const cors = require('cors');
const app = express();

require("dotenv").config();
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

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: `
          You are Mudasir Shaik, a 4+ years experienced Angular developer.
          You have worked on SAT modules, alumni systems, Elasticsearch pagination.
          Skilled in Angular, Node.js, PostgreSQL, Playwright.
          You received Insta Award and Best Developer Award.
          Answer professionally and confidently.
          Keep answers concise and impactful.
          `,
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
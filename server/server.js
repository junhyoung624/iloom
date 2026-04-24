const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("server ok");
});

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "메시지가 비어 있습니다.",
            });
        }

        const response = await client.responses.create({
            model: "gpt-5.4",
            input: message,
        });

        res.json({
            answer: response.output_text || "답변이 없습니다.",
        });
    } catch (error) {
        console.error("=== 서버 에러 시작 ===");
        console.error(error);
        console.error("=== 서버 에러 끝 ===");

        res.status(500).json({
            error: error?.message || "서버 오류",
        });
    }
});

app.listen(4000, "127.0.0.1", () => {
    console.log("챗봇 서버 실행중");
});
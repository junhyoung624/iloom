import React, { useState } from "react";

export default function ChatBotTest() {
    const [answer, setAnswer] = useState("");

    const sendMessage = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "소파 추천해줘" }),
            });

            const data = await res.json();

            setAnswer(data.answer);
        } catch (error) {

            setAnswer("에러남");
        }
    };

    return (
        <div>
            <h2>챗봇 테스트</h2>
            <button onClick={sendMessage}>테스트 보내기</button>
            <p>{answer}</p>
        </div>
    );
}
import { useState } from "react";

const messages = [
  { name: "You", text: "I'm ready for next project!", self: true },
  {
    name: "Teammate",
    text: "It is good idea and how about next month to prepare?",
    self: false,
  },
  { name: "You", text: "Are you free at 2 pm?", self: true },
];

export default function QuickChatCard() {
  const [input, setInput] = useState("");
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white">
        Quick Chat
      </h3>
      <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-xl text-sm ${msg.self ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <input
          className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 focus:outline-none"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold"
        >
          Send
        </button>
      </form>
    </div>
  );
}

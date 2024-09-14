import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { Button } from "./Button";

// For demo purposes. In a real app, you'd have real user data.
const NAME = "You"; 

export default function App() {
  const messages = useQuery(api.messages.list);
  const accuracy = useQuery(api.messages.list_accuracy);
  const sendMessage = useMutation(api.messages.send);
  const updateCorrect = useMutation(api.messages.updateCorrect);
  const updateIncorrect = useMutation(api.messages.updateIncorrect);

  const [newMessageText, setNewMessageText] = useState("");

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  // 4 stages: user_input, skip_reveal, right_wrong, similar_new
  const [stage, setStage] = useState("user_input");

  return (
    <main className="chat">
      <header>
        <h1>Math Helper</h1>
      </header>

      <aside className="stats">
        <p>Correct Answers: {accuracy?.[0]?.correctAnswers ?? 0}</p>
        <p>Incorrect Answers: {accuracy?.[0]?.incorrectAnswers ?? 0}</p>
        <p>
          Percent Correct:{" "}
          {(() => {
            const correct = accuracy?.[0]?.correctAnswers ?? 0;
            const incorrect = accuracy?.[0]?.incorrectAnswers ?? 0;
            const total = correct + incorrect;
            return total > 0
              ? `${((correct / total) * 100).toFixed(2)}%`
              : "N/A";
          })()}
        </p>
      </aside>

      {messages?.map((message) => (
        <article
          key={message._id}
          className={message.author === NAME ? "message-mine" : ""}
        >
          <div>{message.author}</div>
          <p>{message.body}</p>
        </article>
      ))}
      {stage == "user_input" && 
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await sendMessage({ body: newMessageText, author: NAME });
            setNewMessageText("");
            setStage("skip_reveal");
          }}
        >
          <input
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Write a query..."
            style={{ width: '100%'}}
          />
        </form>
      }
      {stage == "skip_reveal" &&
        <div className="button-group">
          <Button
            height={3}
            width={10}
            text="New Query"
            onClick={() => {
              setStage("user_input");
            }}
          />
          <Button
            height={3}
            width={10}
            text="Similar Problem"
            onClick={() => {
              setStage("skip_reveal");
            }}
          />
          <Button
            height={3}
            width={10}
            text="Reveal Answer"
            onClick={() => {
              setStage("right_wrong");
            }}
          />
        </div>
      }
      {stage == "right_wrong" && 
        <div className="button-group">
          <Button
            height={3}
            width={10}
            text="Correct"
            background_color="green"
            onClick={() => {
              updateCorrect();
              setStage("similar_new")
            }}
            className="correct" // Add class for correct button
          />
          <Button
            height={3}
            width={10}
            text="Incorrect"
            background_color="red"
            onClick={() => {
              updateIncorrect();
              setStage("similar_new")
            }}
            className="incorrect" // Add class for incorrect button
          />
        </div>
      }
      {stage == "similar_new" && 
        <div className="button-group">
          <Button
            height={3}
            width={10}
            text="Similar Problem"
            onClick={() => {
              setStage("skip_reveal");
            }}
          />
          <Button
            height={3}
            width={10}
            text="New query"
            onClick={() => {
              setStage("user_input");
            }}
          />
        </div>
      }
    </main>
  );
}

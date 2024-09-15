import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { MathJaxContext, MathJax } from "better-react-mathjax";

// For demo purposes. In a real app, you'd have real user data.
const NAME = "You"; 

// Define the response type
interface ProblemResponse {
  problem: string;
  level: string;
  type: string;
  solution: string;
  id: string;
}

export default function App() {
  const messages = useQuery(api.messages.list);
  const accuracy = useQuery(api.messages.list_accuracy);
  const sendMessage = useMutation(api.messages.send);
  const updateCorrect = useMutation(api.messages.updateCorrect);
  const updateIncorrect = useMutation(api.messages.updateIncorrect);
  const resetStats = useMutation(api.messages.resetStats);
  const deleteAllMessages = useMutation(api.messages.deleteAllRecords);

  const [newMessageText, setNewMessageText] = useState("");

  const fetchProblemData = useCallback(async (): Promise<ProblemResponse> => {
    try {
      const response = await fetch("http://127.0.0.1:5000", {
          method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProblemResponse = await response.json();
      return data;
    } catch (error) {
      console.error("There was a problem fetching the data:", error);
      throw error;
    }
  }, []); // Empty dependency array means this function is created once and never re-created

  const [problemData, setProblemData] = useState({} as ProblemResponse);

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  // 4 stages: user_input, skip_reveal, right_wrong, similar_new
  const [stage, setStage] = useState("user_input");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const categoryOptions = [
    { value: 'All', label: 'All' },
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ];
  
  const difficultyOptions = [
    { value: 'All', label: 'All' },
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ];

  const handleClearAllMessages = async () => {
    try {
      await deleteAllMessages();
      // Optionally, you can add some user feedback here
      console.log("All messages have been deleted");
      // You might want to reset some state here
      setNewMessageText("");
      setCategory("All");
      setDifficulty("All");
      setStage("user_input");
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  return (
    <MathJaxContext config={{ tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]] } }}>
      <main className="chat">
        <header>
          <h1>Math Helper</h1>
        </header>

        <aside className="filters">
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="difficulty-select">Difficulty</label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </aside>

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

        <aside className="clear">
          <Button
            height={3}
            width={5}
            text="Clear History"
            onClick={handleClearAllMessages}
          />
          <Button
            height={3}
            width={5}
            text="Clear Stats"
            onClick={() => {
              resetStats();
            }}
          />
        </aside>


        {messages?.map((message) => {
          return (
            <article
              key={message._id}
              className={message.author === NAME ? "message-mine" : ""}
            >
              <div>{message.author}</div>
              <p>
                <MathJax>
                  {message.body}
                </MathJax>
              </p>
            </article>
          )
        })}
        {stage == "user_input" && 
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await sendMessage({ body: newMessageText, author: NAME });
              const response = await fetchProblemData(); //pass in the new Message Text
              await sendMessage({ body: response.problem, author: "Math Helper" });
              setNewMessageText("");
              setProblemData(response)
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
              onClick={async () => {
                await sendMessage({ body: problemData.solution, author: "Math Helper" });
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
              text="New Query"
              onClick={() => {
                setStage("user_input");
              }}
            />
          </div>
        }
      </main>
    </MathJaxContext>
  );
}

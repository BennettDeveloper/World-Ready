import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import InterviewScreen, { QUESTIONS } from "./pages/InterviewScreen";
import ResultsScreen from "./pages/ResultsScreen";
import "./App.css";

const PHASES = { LANDING: "landing", INTERVIEW: "interview", RESULTS: "results" };

function generateScores() {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 31) + 65);
}

export default function App() {
  const [phase, setPhase] = useState(PHASES.LANDING);
  const [region, setRegion] = useState(null);
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);
  const [scores, setScores] = useState([]);

  function handleBegin(selectedRegion, selectedRole) {
    setRegion(selectedRegion);
    setRole(selectedRole);
    setMessages([{ from: "interviewer", text: QUESTIONS[0] }]);
    setPhase(PHASES.INTERVIEW);
  }

  function handleSubmitAnswer(answer, nextQuestion) {
    const updated = [...messages, { from: "user", text: answer }];
    if (nextQuestion) {
      updated.push({ from: "interviewer", text: nextQuestion });
    } else {
      updated.push({
        from: "interviewer",
        text: "Thank you for your time. That concludes our interview — we'll be in touch soon.",
      });
    }
    setMessages(updated);
  }

  function handleFinish() {
    setScores(generateScores());
    setPhase(PHASES.RESULTS);
  }

  function handleRestart() {
    setPhase(PHASES.LANDING);
    setRegion(null);
    setRole("");
    setMessages([]);
    setScores([]);
  }

  function handleShare() {
    const text = `I just completed a ${region} interview simulation as a ${role} on World Ready! 🌐`;
    if (navigator.share) {
      navigator.share({ title: "World Ready Results", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  }

  return (
    <div className="app">
      {phase === PHASES.LANDING && (
        <LandingPage onBegin={handleBegin} />
      )}
      {phase === PHASES.INTERVIEW && (
        <InterviewScreen
          region={region}
          role={role}
          messages={messages}
          onSubmitAnswer={handleSubmitAnswer}
          onFinish={handleFinish}
        />
      )}
      {phase === PHASES.RESULTS && (
        <ResultsScreen
          region={region}
          role={role}
          scores={scores}
          onRestart={handleRestart}
          onShare={handleShare}
        />
      )}
    </div>
  );
}

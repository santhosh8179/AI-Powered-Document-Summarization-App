import { Routes, Route, NavLink } from "react-router-dom";
import Summarize from "./pages/Summarize";
import Chat from "./pages/Chat";
import History from "./pages/History";
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">DocSum AI</div>
        <div className="nav-links">
          <NavLink to="/" end>Summarize</NavLink>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/history">History</NavLink>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Summarize />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

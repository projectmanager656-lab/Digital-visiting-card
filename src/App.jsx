import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CardForm from "./pages/CardForm";
import PublicCard from "./pages/PublicCard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<CardForm />} />
        <Route path="/edit/:id" element={<CardForm />} />
        <Route path="/card/:slug" element={<PublicCard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

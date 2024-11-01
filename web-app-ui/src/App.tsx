import { Route, Routes } from "react-router-dom";
import IndexPage from "@/pages/index";
import AllProblemsPage from "@/pages/allproblems";
import ProblemPage from "./pages/problempage";
import StatsPage from "./pages/stats";
function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<AllProblemsPage />} path="/problems" />
      <Route element={<ProblemPage />} path="/problems/:id" />
      <Route element={<StatsPage/>} path="/stats" />
    </Routes>
  );
}

export default App;

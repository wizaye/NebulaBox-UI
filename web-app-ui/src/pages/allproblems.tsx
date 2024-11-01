import { useState, useEffect } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import { Tabs, Tab, Spinner, Pagination } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { SearchIcon } from "@/components/icons";
import { NavLink } from "react-router-dom";

function extractDifficulty(problem) {
  return problem.difficulty || "Unknown";
}

function formatProblems(data) {
  return data.map((problem) => ({
    id: problem.id,
    title: problem.title,
    difficulty: extractDifficulty(problem),
    description: problem.description,
    solutions: problem.solutions,
    date: new Date(problem.date).toLocaleDateString(),
  }));
}

const difficultyColors = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
  Unknown: "text-gray-500",
};

export default function AllProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const rowsPerPage = 8; // Number of problems per page

  useEffect(() => {
    async function loadProblems() {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/problems`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const formattedProblems = formatProblems(data);
        setProblems(formattedProblems);
      } catch (error) {
        console.error("Error fetching problem data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProblems();
  }, []);

  const handleSort = (field) => {
    const sortedProblems = [...problems].sort((a, b) => {
      const valueA = field === "title" ? a.title.toLowerCase() : a[field];
      const valueB = field === "title" ? b.title.toLowerCase() : b[field];

      return sortOrder === "asc"
        ? valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        : valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    });
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
    setProblems(sortedProblems);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProblems = (filteredProblems) => {
    return filteredProblems.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  };

  const searchInput = (
    <div className="mb-4">
      <Input
        aria-label="Search"
        classNames={{ inputWrapper: "bg-default-100", input: "text-sm" }}
        endContent={<Kbd className="hidden lg:inline-block" keys={["command"]}>K</Kbd>}
        labelPlacement="outside"
        placeholder="Search..."
        startContent={<SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />}
        type="search"
        onChange={handleSearch}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderProblemTable = (problemList) => (
    <Table aria-label="Problems" bordered>
      <TableHeader>
        <TableColumn onClick={() => handleSort("title")}>
          Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableColumn>
        <TableColumn onClick={() => handleSort("difficulty")}>
          Difficulty {sortField === "difficulty" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableColumn>
        <TableColumn onClick={() => handleSort("date")}>
          Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </TableColumn>
        <TableColumn>Action</TableColumn>
      </TableHeader>
      <TableBody>
        {problemList.map((problem) => (
          <TableRow key={problem.id}>
            <TableCell>{problem.title}</TableCell>
            <TableCell className={difficultyColors[problem.difficulty]}>
              {problem.difficulty}
            </TableCell>
            <TableCell>{problem.date}</TableCell>
            <TableCell>
              <NavLink to={`/problems/${problem.id}`} className="text-blue-500">View</NavLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Calculate pages for each difficulty level
  const totalPagesAll = Math.ceil(filteredProblems.length / rowsPerPage);
  const totalPagesEasy = Math.ceil(filteredProblems.filter(problem => problem.difficulty === "Easy").length / rowsPerPage);
  const totalPagesMedium = Math.ceil(filteredProblems.filter(problem => problem.difficulty === "Medium").length / rowsPerPage);
  const totalPagesHard = Math.ceil(filteredProblems.filter(problem => problem.difficulty === "Hard").length / rowsPerPage);

  const currentProblems = {
    all: paginatedProblems(filteredProblems),
    easy: paginatedProblems(filteredProblems.filter(problem => problem.difficulty === "Easy")),
    medium: paginatedProblems(filteredProblems.filter(problem => problem.difficulty === "Medium")),
    hard: paginatedProblems(filteredProblems.filter(problem => problem.difficulty === "Hard")),
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-start justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center mb-4">
          <h1 className={title()}>All Problems</h1>
        </div>
        {searchInput}
      </section>
      <div className="flex w-full">
        <div className="flex-1">
          <Tabs
            aria-label="Problem Difficulty"
            className="flex flex-col"
            variant="underlined"
            selectedValue={activeTab}
            onSelectionChange={setActiveTab}
          >
            <Tab key="all" title="All">
              {renderProblemTable(currentProblems.all)}
              {totalPagesAll > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPagesAll}
                    onChange={setPage}
                  />
                </div>
              )}
            </Tab>
            <Tab key="easy" title="Easy">
              {renderProblemTable(currentProblems.easy)}
              {totalPagesEasy > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPagesEasy}
                    onChange={setPage}
                  />
                </div>
              )}
            </Tab>
            <Tab key="medium" title="Medium">
              {renderProblemTable(currentProblems.medium)}
              {totalPagesMedium > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPagesMedium}
                    onChange={setPage}
                  />
                </div>
              )}
            </Tab>
            <Tab key="hard" title="Hard">
              {renderProblemTable(currentProblems.hard)}
              {totalPagesHard > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPagesHard}
                    onChange={setPage}
                  />
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      </div>
    </DefaultLayout>
  );
}

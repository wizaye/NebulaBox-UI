import { useParams } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react"; // Import Spinner

// Define types for the fetched problem structure
interface Solution {
  language: string;
  content: string;
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  solutions: Solution[];
  date: string;
}

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cache, setCache] = useState<Record<number, Problem | null>>({}); // Cache for problems

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const problemId = parseInt(id || '0');

      // Check if problem data is already cached
      if (cache[problemId]) {
        setProblem(cache[problemId]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/problems/${problemId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const selectedProblem: Problem = await response.json();

        // Update cache
        setCache((prev) => ({ ...prev, [problemId]: selectedProblem }));
        setProblem(selectedProblem);
      } catch (error) {
        console.error("Error fetching problem data:", error);
        setProblem(null); // Handle not found case
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Removed cache from dependencies

  if (loading) return (
    <DefaultLayout>
      <section className="p-8 flex justify-center items-center h-screen">
        <Spinner size="lg" /> {/* Use the Next UI Spinner component */}
      </section>
    </DefaultLayout>
  );

  if (!problem) return <div>Problem not found</div>;

  // Group solutions by language
  const groupedSolutions = problem.solutions.reduce((acc, solution) => {
    (acc[solution.language] = acc[solution.language] || []).push(solution);
    return acc;
  }, {} as Record<string, Solution[]>);

  return (
    <DefaultLayout>
      <section className="p-8">
        <h1 className="text-3xl font-bold">{problem.title}</h1>
        <p className="text-gray-600 mb-4">Difficulty: {problem.difficulty}</p>

        <Tabs aria-label="Problem Details">
          {/* Description Tab */}
          <Tab key="description" title="Description">
            <Card>
              <CardBody>
                <div dangerouslySetInnerHTML={{ __html: problem.description }} />
              </CardBody>
            </Card>
          </Tab>

          {/* Solutions Tab */}
          <Tab key="solutions" title="Solutions">
            <Tabs aria-label="Languages">
              {Object.entries(groupedSolutions).map(([language, solutions]) => (
                <Tab key={language} title={language}>
                  <Card>
                    <CardBody>
                      {solutions.map((solution, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="font-semibold">Solution {index + 1}</h3>
                          <div className="p-2 border rounded-md">
                            <pre className="whitespace-pre-wrap overflow-auto text-sm">
                              {solution.content}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </Tab>
              ))}
            </Tabs>
          </Tab>
        </Tabs>
      </section>
    </DefaultLayout>
  );
}

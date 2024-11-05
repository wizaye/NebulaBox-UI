import { useParams } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import { Tabs, Tab, Card, CardBody, Chip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';

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
  const [cache, setCache] = useState<Record<number, Problem | null>>({});
  const [processedSolutions, setProcessedSolutions] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const problemId = parseInt(id || '0');

      if (cache[problemId]) {
        setProblem(cache[problemId]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/problems/${problemId}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const selectedProblem: Problem = await response.json();
        setCache((prev) => ({ ...prev, [problemId]: selectedProblem }));
        setProblem(selectedProblem);
      } catch (error) {
        console.error("Error fetching problem data:", error);
        setProblem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cache]);

  useEffect(() => {
    const processSolutions = async () => {
      if (problem) {
        const newProcessedSolutions = new Map();

        for (const solution of problem.solutions) {
          const processedCode = await renderCode(solution.content, solution.language);
          newProcessedSolutions.set(solution.language, processedCode);
        }

        setProcessedSolutions(newProcessedSolutions);
      }
    };

    processSolutions();
  }, [problem]);

  const renderCode = async (content: string, language: string) => {
    // Normalize the language names
    switch (language) {
      case 'Java':
        language = 'java'; // Update the language to lowercase
        break;
      case 'Python':
        language = 'python'; // Update the language to lowercase
        break;
      case 'C++':
        language = 'cpp'; // Update the language to lowercase
        break;
      default:
        // You can handle additional languages or keep it as is
        break;
    }

    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypePrettyCode, {
        transformers: [
          transformerCopyButton({
            visibility: 'always',
            feedbackDuration: 3_000,
          }),
        ],
      })
      .use(rehypeStringify)
      .process(`\`\`\`${language}\n${content}\n\`\`\``); // Ensure language is correctly formatted here

    return String(file);
  };

  if (loading) return (
    <DefaultLayout>
      <section className="p-4 flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </section>
    </DefaultLayout>
  );

  if (!problem) return <div>Problem not found</div>;

  // Group solutions by language
  const groupedSolutions = problem.solutions.reduce((acc, solution) => {
    (acc[solution.language] = acc[solution.language] || []).push(solution);
    return acc;
  }, {} as Record<string, Solution[]>);

  // Function to determine badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <DefaultLayout>
      <section className="p-3 sm:p-4 md:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{problem.title}</h1>
        
        {/* Difficulty badge */}
        <Chip color={getDifficultyColor(problem.difficulty)} variant="flat" className="mb-2 sm:mb-4 text-sm sm:text-base">
          {problem.difficulty}
        </Chip>

        <Tabs aria-label="Problem Details" className="w-full overflow-x-auto">
          <Tab key="description" title="Description">
            <Card className="my-2 md:my-4 shadow-md">
              <CardBody>
                <div className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: problem.description }} />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="solutions" title="Solutions">
            <Tabs aria-label="Languages" className="w-full overflow-x-auto">
              {Object.entries(groupedSolutions).map(([language, solutions]) => (
                <Tab key={language} title={language}>
                  {solutions.map((solution, index) => (
                    <Card key={index} className="my-2 md:my-4 shadow-md">
                      <CardBody>
                        <div className="mb-4">
                          <h3 className="font-semibold text-base sm:text-lg md:text-xl mt-2 mb-2">
                            Solution {index + 1} :
                          </h3>
                          <div className="p-1 border rounded-sm overflow-auto max-h-64">
                            <div className="overflow-auto whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: processedSolutions.get(solution.language) || '' }} />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </Tab>
              ))}
            </Tabs>
          </Tab>
        </Tabs>
      </section>
    </DefaultLayout>
  );
}

import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Spinner } from "@nextui-org/react"; // Import the Spinner component

interface Stats {
  solved: number;
  activeDays: number;
}

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ solved: 0, activeDays: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProblemsData = async () => {
      try {
        const response = await fetch("http://localhost:3000/problems"); // Adjust the URL as needed
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const problems = await response.json();
        const solvedCount = problems.length; // Assuming each entry is a solved problem
        const activeDays = calculateActiveDays(problems); // Implement this function based on your criteria

        setStats({ solved: solvedCount, activeDays });
      } catch (error) {
        console.error("Error fetching problems data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemsData();
  }, []);

  const calculateActiveDays = (problems: any[]): number => {
    // Implement logic to calculate active days, e.g., based on problem submission dates
    // For demonstration, let's return a static number
    return problems.length > 0 ? 30 : 0; // Replace with actual calculation
  };

  if (loading) {
    return (
      <DefaultLayout>
        <section className="p-8 flex justify-center items-center h-screen">
          <Spinner size="lg" /> {/* Use the Next UI Spinner component */}
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="p-8">
        <h1 className="text-3xl font-bold">User Statistics</h1>
        <PieChart width={400} height={400}>
          <Pie
            data={[
              { name: "Problems Solved", value: stats.solved },
              { name: "Days Active", value: stats.activeDays },
            ]}
            cx={200}
            cy={200}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill="#42A5F5" />
            <Cell fill="#66BB6A" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </section>
    </DefaultLayout>
  );
};

export default StatsPage;

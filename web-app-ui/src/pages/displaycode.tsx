import { Card, CardBody } from "@nextui-org/react";
import { useTheme } from "@/hooks/use-theme";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { useEffect, useState } from "react";

export default function CodeDisplay() {
    const codeString = `
        function add(a, b) {
            return a + b;
        }
        console.log(add(2, 3)); // Output: 5
    `;

    const { isDark } = useTheme(); // Get the current theme state
    const [processedHTML, setProcessedHTML] = useState<string>("");

    useEffect(() => {
        const processCode = async () => {
            const result = await unified()
                .use(rehypeParse, { fragment: true })
                .use(rehypePrettyCode, {
                    keepBackground: true,
                })
                .use(rehypeStringify)
                .process(`<pre><code class="language-javascript">${codeString}</code></pre>`);

            setProcessedHTML(String(result));
        };

        processCode();
    }, [codeString, isDark]);

    const codeLines = codeString.trim().split("\n");

    return (
        <Card className="my-4 shadow-md max-w-md">
            <CardBody>
                <div className="relative overflow-auto">
                    <div className="flex">
                        {/* Render line numbers */}
                        <div className="pr-4 text-right text-gray-500">
                            {codeLines.map((_, index) => (
                                <div key={index} className="select-none">
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                        {/* Render syntax-highlighted code */}
                        <div
                            className="overflow-auto"
                            dangerouslySetInnerHTML={{ __html: processedHTML }}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

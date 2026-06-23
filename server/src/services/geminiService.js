import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Helper to call content generation with fallback models to ensure robust execution.
 * Tries the available models in order: gemini-2.5-flash, gemini-3.1-flash-lite, etc.
 * @param {string} prompt - The prompt text to evaluate
 * @returns {Promise<string>} The generated text response
 */
const callGeminiWithFallback = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = [
        "gemini-2.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest"
    ];

    let lastError = null;
    for (const modelName of models) {
        try {
            console.log(`[Gemini] Attempting content generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                },
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text) {
                console.log(`[Gemini] Successfully generated content using model: ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`[Gemini] Model ${modelName} failed:`, error.message || error);
            lastError = error;
        }
    }
    throw lastError || new Error("All Gemini models failed to generate content.");
};

/**
 * Sends resume text to Gemini for ATS scoring and extraction.
 * @param {string} resumeText - Parsed text from the resume PDF
 * @param {string} [targetRole] - Optional target job role
 * @param {string} [targetDescription] - Optional target job description
 * @returns {Promise<object>} The extracted and evaluated resume data
 */
export const analyzeResumeContent = async (resumeText, targetRole = "", targetDescription = "") => {
    try {
        const prompt = `
You are an expert HR recruiter and ATS (Applicant Tracking System) optimization specialist.
Analyze the following resume text. Optionally, evaluate it against the target role and job description provided below.

Resume Text:
"""
${resumeText}
"""

Target Role: ${targetRole || "General Software/Technology Professional"}
Target Job Description: ${targetDescription || "General Software/Technology Industry standards"}

Your goal is to parse the resume, extract key details, calculate a realistic ATS score (0 to 100) reflecting how well the resume matches the target role and description, identify missing skills needed for the target role/description, and provide actionable, professional feedback.

Return ONLY a JSON object with the following exact keys and structure:
{
  "atsScore": 85,
  "extractedSkills": ["Skill1", "Skill2"],
  "extractedProjects": [
    {
      "title": "Project Name",
      "description": "Short summary of what was done",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "extractedExperience": [
    {
      "role": "Job Role",
      "company": "Company Name",
      "duration": "Start Date - End Date (e.g. June 2024 - Present)",
      "description": "Short summary of responsibilities and achievements"
    }
  ],
  "missingSkills": ["SkillA", "SkillB"],
  "feedback": "Detailed, professional feedback explaining why the score was given, and offering specific recommendations to improve the resume."
}
`;

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini AI Analysis Error:", error);
        throw error;
    }
};

/**
 * Generate Interview Questions
 */
export const generateInterviewQuestions = async (
    role,
    domain,
    difficulty,
    type = "interview",
    mode = "technical",
    questionCount = 5
) => {
    try {
        let prompt = "";
        if (type === "coding") {
            prompt = `
You are an expert technical interviewer and software engineering lead.
Generate ${questionCount} UNIQUE coding questions or coding tasks for technology/domain: ${domain}, difficulty: ${difficulty}.

Rules:
- Questions must be purely code-writing, database query writing, or algorithmic challenges (e.g. "Write a function to...", "Write a SQL query that...", "Implement a React component that...").
- Do NOT include theory or general conceptual questions.
- Every session should have different challenges.

Return ONLY a JSON array of ${questionCount} strings.
Example (for a count of 2):
[
  "Write a function in JavaScript to check if a string is a palindrome.",
  "Write a SQL query to find the second highest salary from an Employee table."
]
`;
        } else if (type === "interview" && mode === "executive") {
            prompt = `
You are an expert Executive and HR Interviewer at Google, Meta, Amazon, and Microsoft.
Generate ${questionCount} UNIQUE behavioral, leadership, HR, and managerial questions for a candidate targetting the role of ${role}.

Rules:
- Focus on leadership, conflict resolution, dealing with failures, teamwork, professional growth, and standard behavioral rounds.
- Do NOT include any technical coding questions or code writing tasks.
- Keep questions realistic, placement-focused, and clear.

Return ONLY a JSON array of ${questionCount} strings.
Example (for a count of 2):
[
  "Tell me about yourself.",
  "Describe a time you had a conflict with a teammate and how you resolved it."
]
`;
        } else {
            prompt = `
You are a Senior Technical Interviewer.
Generate ${questionCount} UNIQUE conceptual, theoretical, or project-based technical interview questions for role: ${role}, technology/domain: ${domain}, difficulty: ${difficulty}.

Rules:
- Questions must focus on core concepts, system design, architectural choices, and conceptual understanding (e.g. "What is React Virtual DOM?", "Difference between SQL and NoSQL databases", "Explain how useState works").
- Do NOT include coding exercises, code-writing tasks, or syntax-writing questions (do NOT ask them to write code).
- Keep questions brief, realistic, and conceptual.

Return ONLY a JSON array of ${questionCount} strings.
Example (for a count of 2):
[
  "What is the difference between state and props in React?",
  "Explain the event loop in JavaScript."
]
`;
        }

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error(
            "Gemini Question Generation Error:",
            error
        );

        const fallbackQuestions = [];
        for (let i = 0; i < questionCount; i++) {
            if (type === "coding") {
                fallbackQuestions.push(`Write a function demonstrating ${domain || "a basic algorithm"} (Task ${i + 1}).`);
            } else if (type === "interview" && mode === "executive") {
                const defaults = [
                    "Tell me about yourself.",
                    `Why should we hire you as a ${role}?`,
                    "Describe a challenge you solved in a project.",
                    "How do you handle conflict or differences of opinion within a team?",
                    "What are your greatest professional strengths and weaknesses?"
                ];
                fallbackQuestions.push(defaults[i % defaults.length] + (i >= 5 ? ` (Part ${Math.floor(i/5) + 1})` : ""));
            } else {
                const defaults = [
                    `What is ${domain}?`,
                    `Explain the core concepts of ${domain}.`,
                    `Describe a project using ${domain}.`,
                    `What are challenges in ${domain}?`,
                    `How does ${domain} compare to alternative technologies?`
                ];
                fallbackQuestions.push(defaults[i % defaults.length] + (i >= 5 ? ` (Part ${Math.floor(i/5) + 1})` : ""));
            }
        }
        return fallbackQuestions;
    }
};

/**
 * Evaluate Interview Answer
 */
export const evaluateAnswer = async (
    question,
    answer,
    type = "interview",
    mode = "technical"
) => {
    try {
        let evaluationPrompt = "";
        if (type === "coding") {
            evaluationPrompt = `
You are a Senior Technical Lead and Code Reviewer at Google, Amazon, Microsoft, and Meta.
Evaluate the candidate's coding solution to the following programming challenge:

Question:
${question}

Candidate's Code Solution:
${answer}

Important Evaluation Rules:
1. Evaluate based on correctness, code logic, time/space complexity, and clean code conventions.
2. If the code is correct and optimized: Score between 8-10.
3. If the code is correct but not optimized or has style/naming issues: Score between 6-8.
4. If the code is partially correct or contains syntax/logical errors: Score between 4-6.
5. If the code shows a basic draft but doesn't work: Score between 3-5.
6. Only give 0-2 when completely wrong, irrelevant, or empty answer.
7. In "correctAnswer", provide a concise, readable reference implementation or direct correction. Keep the explanation/model answer extremely concise (1-2 sentences or comments).
8. Scoring Guide:
   - 0-2: Wrong
   - 3-4: Weak
   - 5-6: Basic Understanding
   - 7-8: Good Interview Answer
   - 9-10: Excellent Interview Answer

Provide:
* score (0-10)
* confidenceLevel (Low/Medium/High) - reflecting code efficiency confidence
* feedback - detailed code review feedback
* strengths - what is good about the implementation
* improvement - how to optimize or clean up the code
* correctAnswer - the optimal reference implementation in code format

Return ONLY JSON:
{
  "score": 0,
  "confidenceLevel": "Medium",
  "feedback": "",
  "strengths": "",
  "improvement": "",
  "correctAnswer": ""
}
`;
        } else if (type === "interview" && mode === "executive") {
            evaluationPrompt = `
You are a Senior HR and Executive Interviewer at Google, Meta, Amazon, and Microsoft.
Evaluate the candidate's response to the following behavioral/leadership question:

Question:
${question}

Candidate Answer:
${answer}

Important Evaluation Rules:
1. Evaluate based on communication skill, confidence, leadership qualities, clarity, and articulation.
2. Do NOT penalize candidates heavily for short answers. If the answer is brief but conveys the correct professional attitude and clear concept, give positive credit (score 7-8). Focus on concept clarity and practical thinking.
3. If the answer is articulate, mature, and displays strong leadership/conflict resolution: Score between 8-10.
4. If the answer is correct and positive but brief: Score between 7-8.
5. If the answer is partially fitting or lacks confidence: Score between 4-6.
6. If the answer shows some effort but is weak, vague, or defensive: Score between 3-5.
7. Only give 0-2 when completely wrong, irrelevant, or empty answer.
8. In "correctAnswer", provide a concise, recruiter-style model answer in a single line or 2 short bullet points, demonstrating how to answer this question using the STAR method without theoretical paragraphs.
9. Scoring Guide:
   - 0-2: Wrong
   - 3-4: Weak
   - 5-6: Basic Understanding
   - 7-8: Good Interview Answer
   - 9-10: Excellent Interview Answer

Provide:
* score (0-10)
* confidenceLevel (Low/Medium/High) - reflecting candidate delivery confidence
* feedback - detailed behavioral coaching feedback
* strengths - strengths in communication/confidence
* improvement - tips to improve leadership presence or structure
* correctAnswer - a model answer demonstrating how to answer this question using the STAR method

Return ONLY JSON:
{
  "score": 0,
  "confidenceLevel": "Medium",
  "feedback": "",
  "strengths": "",
  "improvement": "",
  "correctAnswer": ""
}
`;
        } else {
            evaluationPrompt = `
You are a Senior Technical Interviewer at Google, Meta, Amazon, and Microsoft.
Evaluate the candidate's response to the following technical concept/theory question:

Question:
${question}

Candidate Answer:
${answer}

Important Evaluation Rules:
1. Do NOT penalize candidates heavily for short answers. If the answer is technically correct but brief, score between 7-8. (For example, 'A JavaScript library used to build user interfaces' for 'What is React?' is a 8/10 score). Focus on concept clarity and practical thinking.
2. If the answer is correct and well explained: Score between 8-10.
3. If the answer is partially correct: Score between 4-6.
4. If the answer contains some understanding but lacks clarity: Score between 3-5.
5. Only give 0-2 when completely wrong, irrelevant, or empty answer.
6. Evaluate based on correctness, conceptual understanding, confidence, and communication.
7. In "correctAnswer", provide a concise, recruiter-style model answer in a single line or a short bulleted list of 1-2 sentences. Avoid theoretical paragraphs.
8. Scoring Guide:
   - 0-2: Wrong
   - 3-4: Weak
   - 5-6: Basic Understanding
   - 7-8: Good Interview Answer
   - 9-10: Excellent Interview Answer

Provide:
* score (0-10)
* confidenceLevel (Low/Medium/High)
* feedback
* strengths
* improvement
* correctAnswer - a concise and clear explanation of the concept

Return ONLY JSON:
{
  "score": 0,
  "confidenceLevel": "Medium",
  "feedback": "",
  "strengths": "",
  "improvement": "",
  "correctAnswer": ""
}
`;
        }

        const text = await callGeminiWithFallback(evaluationPrompt);
        return JSON.parse(text);
    } catch (error) {
        console.error(
            "Gemini Answer Evaluation Error:",
            error
        );

        return {
            score: 0,
            confidenceLevel: "Low",
            feedback: "Unable to evaluate answer.",
            strengths: "",
            improvement: "Try giving a more detailed answer.",
            correctAnswer: "Correct answer unavailable.",
        };
    }
};

/**
 * Generate Final Executive Assessment Report
 */
export const generateFinalInterviewReport = async (interview) => {
    try {
        const qasBlock = interview.answers.map((ans, idx) => {
            return `Question ${idx + 1}: ${ans.question}
Candidate Answer: ${ans.isSkipped ? "[SKIPPED]" : ans.answer}
Score Given: ${ans.isSkipped ? "0 (Skipped)" : ans.score + "/10"}
Feedback: ${ans.feedback || ""}`;
        }).join("\n\n");

        const prompt = `
You are an expert recruitment manager and executive talent evaluator.
Review the following complete transcript and scores from a candidate's mock interview/practice session:

Role: ${interview.role}
Domain: ${interview.domain}
Difficulty: ${interview.difficulty}
Session Type: ${interview.type} (either interview or coding)
Session Mode: ${interview.mode} (either technical or executive)

Transcript:
${qasBlock}

Provide a structured, final placement-focused evaluation of this candidate.
Rate the following four categories as either "Excellent", "Good", "Basic", or "Needs Improvement":
1. "technicalKnowledge" (Rate "N/A" if it was a pure Executive behavioral round)
2. "communication" (For coding, rate how well their code represents clean logic and clear style)
3. "confidence" (Self-assurance, speed of execution/response)
4. "hrReadiness" (For coding, rate how close they are to solving enterprise coding standards)

Additionally, provide:
- "accuracyScore": A number between 0 and 10 representing the conceptual correctness and accuracy of the answered questions. (Skipped questions should be excluded from this calculation or treated neutrally, so accuracy reflects only the quality of the candidate's active responses).
- "strengthsSummary": A paragraph summarizing the candidate's core strengths shown in this session.
- "improvementAreasSummary": A paragraph describing critical areas where the candidate needs to focus, improve, or study.
- "recommendedTopics": An array of 2-3 specific technical or behavioral topics/topics tags the candidate should revise.
- "resultStatus": Set to "Interview Ready" if the average score is 6 or above and type is "interview", "Code Ready" if average score is 6 or above and type is "coding", else set to "Needs Practice".

Return ONLY JSON:
{
  "technicalKnowledge": "Good",
  "communication": "Excellent",
  "confidence": "Good",
  "hrReadiness": "Excellent",
  "accuracyScore": 8.5,
  "strengthsSummary": "Strengths description...",
  "improvementAreasSummary": "Improvement areas description...",
  "recommendedTopics": ["Topic A", "Topic B"],
  "resultStatus": "Interview Ready"
}
`;

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Final Report Generation Error:", error);
        return {
            technicalKnowledge: interview.type === "coding" ? "Basic" : "Good",
            communication: "Good",
            confidence: "Good",
            hrReadiness: "Basic",
            accuracyScore: 6.0,
            strengthsSummary: "Candidate showed standard comprehension of concepts.",
            improvementAreasSummary: "Candidate should practice structuring short, punchy answers and avoiding syntax slips.",
            recommendedTopics: [interview.domain || "General Concepts"],
            resultStatus: interview.type === "coding" ? "Code Ready" : "Interview Ready",
        };
    }
};

/**
 * Text-only generator for standard chat (markdown/text output rather than structured JSON)
 */
export const callGeminiTextWithFallback = async (prompt, systemInstruction = "") => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = [
        "gemini-2.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest"
    ];

    let lastError = null;
    for (const modelName of models) {
        try {
            console.log(`[Gemini Text] Attempting content generation with model: ${modelName}`);
            const modelConfig = { model: modelName };
            if (systemInstruction) {
                modelConfig.systemInstruction = systemInstruction;
            }
            const model = genAI.getGenerativeModel(modelConfig);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text) {
                console.log(`[Gemini Text] Successfully generated content using model: ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`[Gemini Text] Model ${modelName} failed:`, error.message || error);
            lastError = error;
        }
    }
    throw lastError || new Error("All Gemini text models failed to generate content.");
};

/**
 * Sends chatbot history and a new prompt to Gemini.
 */
export const generateChatResponse = async (chatHistory, newPrompt) => {
    try {
        const systemInstruction = "You are Praveen Tech Assistant, a helpful, encouraging, and highly knowledgeable AI Career Assistant and placement preparation coach. Help candidates with resume enhancement suggestions, career roadmaps, technical and behavioral interview guidance, and explanation of coding/theory concepts. Keep responses structured and easy to read using markdown formatting.";

        let formattedPrompt = "";
        if (chatHistory && chatHistory.length > 0) {
            formattedPrompt += "Previous Conversation:\n";
            chatHistory.forEach(msg => {
                const prefix = msg.sender === "user" ? "Candidate" : "Praveen Tech Assistant";
                formattedPrompt += `${prefix}: ${msg.text}\n`;
            });
            formattedPrompt += "\n";
        }
        formattedPrompt += `Candidate's New Message:\n${newPrompt}\n\nPraveen Tech Assistant:`;

        const responseText = await callGeminiTextWithFallback(formattedPrompt, systemInstruction);
        return responseText;
    } catch (error) {
        console.error("Gemini Chat Response Error:", error);
        return "I apologize, but I am having trouble connecting to my brain right now. How else can I help you today?";
    }
};

/**
 * Generates prep roadmap and materials (questions, resources)
 */
export const generateRoadmapAndMaterials = async (topic, role, company, difficulty) => {
    try {
        const prompt = `
You are an expert technical interviewer and syllabus designer.
Generate a structured learning roadmap and preparation questions for:
Topic: ${topic}
Target Role: ${role || "N/A"}
Target Company: ${company || "N/A"}
Difficulty: ${difficulty}

Return ONLY a JSON object with the following exact keys and structure:
{
  "roadmap": [
    {
      "phase": "Phase 1: Title",
      "description": "Short summary of what to study",
      "resources": ["Resource Name/Link 1", "Resource Name/Link 2"]
    }
  ],
  "questions": [
    {
      "type": "CODING",
      "title": "Question Title",
      "description": "Question details and prompt",
      "difficulty": "Easy",
      "source": "LeetCode",
      "url": "https://leetcode.com",
      "correctAnswer": "Brief reference solution/explanation"
    },
    {
      "type": "THEORY",
      "title": "Question Title",
      "description": "Question details",
      "difficulty": "Medium",
      "source": "Praveen Tech AI",
      "url": "",
      "correctAnswer": "Reference answer explanation"
    }
  ]
}

Rules:
1. Roadmap should have exactly 4 phases.
2. Questions array should contain exactly 6 questions total:
   - 2 CODING questions (with external url if applicable, e.g. LeetCode/HackerRank, or blank)
   - 2 THEORY questions
   - 1 INTERVIEW question
   - 1 BEHAVIORAL question
3. Question difficulties must match the overall difficulty requested.
4. Avoid markdown syntax wrappers around the JSON block. Return ONLY the JSON object.
`;

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Roadmap & Materials Error:", error);
        // Return dummy default roadmap matching schema
        return {
            roadmap: [
                { phase: "Phase 1: Fundamentals", description: `Learn basics of ${topic}`, resources: ["GeeksforGeeks", "MDN / Official docs"] },
                { phase: "Phase 2: Core Concepts", description: `Explore intermediate items of ${topic}`, resources: ["TutorialsPoint", "Medium articles"] },
                { phase: "Phase 3: Deep Dive & Troubleshooting", description: `Advanced operations and practices`, resources: ["StackOverflow", "YouTube courses"] },
                { phase: "Phase 4: Interview & Practice", description: `Mock interview and problem solving`, resources: ["LeetCode", "Praveen Tech Mock Interview"] }
            ],
            questions: [
                { type: "THEORY", title: `What is ${topic}?`, description: `Explain core concepts of ${topic}.`, difficulty: "Easy", source: "Praveen Tech AI", url: "", correctAnswer: `Detailed overview of ${topic}.` },
                { type: "CODING", title: `Reverse/Implement ${topic}`, description: `Write a simple program demonstrating ${topic}.`, difficulty: "Easy", source: "Praveen Tech AI", url: "", correctAnswer: "Code demonstration." },
                { type: "THEORY", title: `Common pitfalls in ${topic}`, description: `List 3 common problems when using ${topic}.`, difficulty: "Medium", source: "Praveen Tech AI", url: "", correctAnswer: "Pitfalls overview." },
                { type: "CODING", title: `Optimize ${topic} algorithm`, description: `Given a bottleneck, optimize the usage of ${topic}.`, difficulty: "Medium", source: "Praveen Tech AI", url: "", correctAnswer: "Optimized code snippet." },
                { type: "INTERVIEW", title: `How does ${topic} compare?`, description: `Explain differences between ${topic} and other paradigms.`, difficulty: "Medium", source: "Praveen Tech AI", url: "", correctAnswer: " Paradigms comparison." },
                { type: "BEHAVIORAL", title: "Tell me about a time you solved a problem", description: `Describe a scenario where you had to apply ${topic} under tight deadline.`, difficulty: "Medium", source: "Praveen Tech AI", url: "", correctAnswer: "STAR method behavioral sample answer." }
            ]
        };
    }
};

/**
 * Generates MCQs for study quizzes
 */
export const generateQuizQuestions = async (topic, difficulty) => {
    try {
        const prompt = `
You are an expert academic evaluator.
Generate 5 Multiple-Choice Questions (MCQs) for testing knowledge on:
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY a JSON array of questions, matching this exact structure:
[
  {
    "questionText": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B"
  }
]

Rules:
1. Options must contain exactly 4 choices.
2. "correctAnswer" MUST match one of the items inside "options" exactly.
3. Questions must be highly conceptual and challenging.
`;

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Quiz Questions Error:", error);
        return [
            {
                questionText: `What is the primary purpose of ${topic}?`,
                options: ["Option A: Basic use case", "Option B: Secondary benefit", "Option C: Irrelevant action", "Option D: None of the above"],
                correctAnswer: "Option A: Basic use case"
            },
            {
                questionText: `Which of the following is true regarding ${topic}?`,
                options: ["It is synchronous only", "It is used widely in modern engineering", "It is deprecated", "It has no performance cost"],
                correctAnswer: "It is used widely in modern engineering"
            },
            {
                questionText: `Which difficulty level matches this ${topic} quiz?`,
                options: ["Beginner", "Intermediate", "Advanced", "Selected: " + difficulty],
                correctAnswer: "Selected: " + difficulty
            },
            {
                questionText: `What is a common helper when debugging ${topic}?`,
                options: ["Print logs", "Restart machine", "Delete repository", "Ignore errors"],
                correctAnswer: "Print logs"
            },
            {
                questionText: `Why is ${topic} essential in software development?`,
                options: ["Boosts performance and structure", "It is not essential", "It adds code lines", "It is only for backend"],
                correctAnswer: "Boosts performance and structure"
            }
        ];
    }
};

/**
 * Generates personalized week-by-week study plan
 */
export const generatePersonalizedStudyPlan = async (role, timeline, skills) => {
    try {
        const prompt = `
You are an expert career planner and academic advisor.
Create a weekly preparation roadmap to help a candidate land a role as a ${role} in ${timeline}.
Candidate's Current Skills: ${skills.length > 0 ? skills.join(", ") : "None specified"}

Return ONLY a JSON object matching this exact structure:
{
  "roadmap": [
    {
      "week": 1,
      "title": "Week 1: Focus Area",
      "tasks": [
        { "text": "Task description 1" },
        { "text": "Task description 2" }
      ]
    }
  ],
  "milestones": [
    {
      "title": "Milestone Title",
      "daysFromStart": 7
    }
  ]
}

Rules:
1. Divide the plan into weeks based on the timeline (e.g. 4 Weeks => 4 roadmap items, 12 Weeks => 12 items). Limit to maximum 8 weeks for sizing constraints if timeline is longer.
2. Each week should contain 3-4 specific tasks.
3. Provide exactly 3 milestones. The "daysFromStart" should indicate the target day of accomplishment (e.g., 7 for Week 1, 14 for Week 2, etc.).
`;

        const text = await callGeminiWithFallback(prompt);
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Study Plan Error:", error);
        return {
            roadmap: [
                { week: 1, title: "Week 1: Core Fundamentals & Syntax", tasks: [{ text: "Revise core concepts of the role" }, { text: "Solve 5 beginner coding problems" }, { text: "Review interview behavioral questions" }] },
                { week: 2, title: "Week 2: Advanced Topics & Projects", tasks: [{ text: "Build a prototype/project using key tech" }, { text: "Solve 5 medium coding problems" }, { text: "Take a mock interview session" }] },
                { week: 3, title: "Week 3: System Design & Frameworks", tasks: [{ text: "Learn system architecture foundations" }, { text: "Improve resume ATS compatibility rating" }, { text: "Study top 20 theoretical interview questions" }] },
                { week: 4, title: "Week 4: Final Rehearsal & Mock Practice", tasks: [{ text: "Take 2 technical mock interviews" }, { text: "Fine-tune LinkedIn and portfolio details" }, { text: "Do full revision quizzes" }] }
            ],
            milestones: [
                { title: "Complete Core Fundamentals Review", daysFromStart: 7 },
                { title: "Perform Project Integration & Initial Mock Test", daysFromStart: 14 },
                { title: "Complete Advanced Practice & Portfolio Polish", daysFromStart: 28 }
            ]
        };
    }
};


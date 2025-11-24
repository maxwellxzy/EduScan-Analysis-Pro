
import { Question, AnalysisTags, StudentAnswer, ExamData, StudentResult } from '../types';

const DELAY_MS = 1000; // Simulate network latency

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a placeholder image with text to simulate a math diagram
const mathImageUrl = (text: string, color: string = "4f46e5") => 
  `https://placehold.co/800x250/${color}/ffffff/png?text=${encodeURIComponent(text)}`;

// High School Math Data Sources (New Curriculum Standard)
const mockChapters = [
  "必修第一册 第3章 - 函数的概念与性质",
  "必修第一册 第4章 - 指数函数与对数函数",
  "必修第二册 第6章 - 平面向量及其应用",
  "必修第二册 第8章 - 立体几何初步",
  "选择性必修第一册 第2章 - 直线和圆的方程",
  "选择性必修第一册 第3章 - 圆锥曲线的方程",
  "选择性必修第二册 第4章 - 数列",
  "选择性必修第二册 第5章 - 一元函数导数及其应用",
  "选择性必修第三册 第7章 - 随机变量及其分布"
];

const mockKnowledge = [
  "利用导数研究函数的单调性", "椭圆的标准方程", "直线与圆锥曲线的位置关系", 
  "二面角", "线面垂直的判定", "正弦定理与余弦定理", 
  "离散型随机变量的期望与方差", "等差数列的前n项和", "函数的零点"
];

const mockMethods = [
  "数形结合思想", "分类讨论思想", "函数与方程思想", 
  "转化与化归思想", "特殊值法", "待定系数法", "坐标法"
];

const mockCompetencies = [
  "数学抽象", "逻辑推理", "数学建模", 
  "直观想象", "数学运算", "数据分析"
];

// Predefined Realistic High School Math Questions
const PREDEFINED_QUESTIONS = [
  {
    content: "**第 1 题（三角函数）：**\n在 $\\triangle ABC$ 中，角 $A, B, C$ 所对的边分别为 $a, b, c$。已知 $2b \\cos C = 2a - c$。\n(1) 求角 $B$ 的大小；\n(2) 若 $b=3$，$\\triangle ABC$ 的面积 for $\\frac{3\\sqrt{3}}{4}$，求 $a+c$ 的值。",
    imgText: "三角形示意图",
    defaultDifficulty: 4,
    tags: {
      chapter: "必修第二册 第6章 - 平面向量及其应用",
      kps: ["正弦定理与余弦定理", "三角形面积公式"],
      methods: ["转化与化归思想"],
      comps: ["数学运算", "逻辑推理"]
    }
  },
  {
    content: "**第 2 题（立体几何）：**\n如图，在四棱锥 $P-ABCD$ 中，底面 $ABCD$ 是矩形，$PA \\perp$ 平面 $ABCD$，$PA=AD=2$，点 $E$ 是棱 $PD$ 的中点。\n(1) 证明：$AE \\perp$ 平面 $PCD$；\n(2) 求直线 $PC$ 与平面 $ACE$ 所成角的正弦值。",
    imgText: "四棱锥P-ABCD立体图",
    defaultDifficulty: 6,
    tags: {
      chapter: "必修第二册 第8章 - 立体几何初步",
      kps: ["线面垂直的判定", "线面角的计算", "空间向量的应用"],
      methods: ["坐标法", "数形结合思想"],
      comps: ["直观想象", "逻辑推理"]
    }
  },
  {
    content: "**第 3 题（概率统计）：**\n某工厂生产某种零件，现有甲、乙两条生产线。为了检测生产质量，从甲、乙线各随机抽取 100 个零件进行检测。规定尺寸在 $[20, 30]$ 内为合格品。统计数据如下表所示...\n(1) 试分别估计甲、乙两线生产的零件为合格品的概率；\n(2) 已知合格品每件获利 50 元，不合格品亏损 10 元。若从乙线抽出 2 件，求利润 $X$ 的分布列和数学期望。",
    imgText: "频率分布直方图/表格",
    defaultDifficulty: 5,
    tags: {
      chapter: "选择性必修第三册 第7章 - 随机变量及其分布",
      kps: ["离散型随机变量的期望与方差", "古典概型"],
      methods: ["数学建模"],
      comps: ["数据分析", "数学运算"]
    }
  },
  {
    content: "**第 4 题（数列）：**\n已知数列 $\\{a_n\\}$ 的前 $n$ 项和为 $S_n$，且满足 $S_n = 2a_n - 2$。\n(1) 求数列 $\\{a_n\\}$ 的通项公式；\n(2) 设 $b_n = \\log_2 a_n$，求数列 $\\{\\frac{1}{b_n b_{n+1}}\\}$ 的前 $n$ 项和 $T_n$。",
    imgText: "数列递推公式",
    defaultDifficulty: 6,
    tags: {
      chapter: "选择性必修第二册 第4章 - 数列",
      kps: ["等比数列的通项公式", "裂项相消法求和"],
      methods: ["转化与化归思想", "公式法"],
      comps: ["数学运算", "逻辑推理"]
    }
  },
  {
    content: "**第 5 题（圆锥曲线）：**\n已知椭圆 $C: \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 (a>b>0)$ 的离心率为 $\\frac{\\sqrt{2}} {2}$，且过点 2, $\\sqrt{2}$。\n(1) 求椭圆 $C$ 的方程；\n(2) 设直线 $l$ 不经过点 $P(0,1)$ 且与椭圆 $C$ 相交于 $A, B$ 两点。若直线 $PA$ 与 $PB$ 的斜率之和为 -1，证明直线 $l$ 过定点。",
    imgText: "椭圆与直线相交",
    defaultDifficulty: 9,
    tags: {
      chapter: "选择性必修第一册 第3章 - 圆锥曲线的方程",
      kps: ["椭圆的标准方程", "直线与圆锥曲线的位置关系", "定点问题"],
      methods: ["设而不求", "坐标法", "函数与方程思想"],
      comps: ["数学运算", "逻辑推理"]
    }
  },
  {
    content: "**第 6 题（导数）：**\n已知函数 $f(x) = x \\ln x - ax$。\n(1) 当 $a=1$ 时，求 $f(x)$ 的极值；\n(2) 若 $f(x)$ 有两个零点，求实数 $a$ 的取值范围。",
    imgText: "函数 f(x) 图像",
    defaultDifficulty: 8,
    tags: {
      chapter: "选择性必修第二册 第5章 - 一元函数导数及其应用",
      kps: ["利用导数研究函数的单调性", "利用导数研究函数的极值", "函数的零点"],
      methods: ["分类讨论思想", "数形结合思想"],
      comps: ["数学抽象", "逻辑推理", "数学运算"]
    }
  }
];

/**
 * 1. split_exam (Mock Endpoint)
 * Accepts a POST request (simulated) with an image.
 * Returns: JSON object containing a list of base64 encoded images and markdown content.
 */
export const splitExamApi = async (file: File): Promise<Partial<Question>[]> => {
  await delay(DELAY_MS);
  
  // Return the predefined questions
  return PREDEFINED_QUESTIONS.map((q, i) => ({
    id: `q-${Date.now()}-${i}`,
    number: i + 1,
    imageUrl: `https://3zc4sx.dongshan.tech/images/${i + 1}.jpeg`, 
    contentMd: q.content,
    analysis: null,
    isAnalyzing: true 
  }));
};

/**
 * 2. analyze_question (Mock Endpoint)
 * Accepts: Question image and markdown.
 * Returns: JSON object with analysis results.
 */
export const analyzeQuestionApi = async (questionId: string, contentMd: string): Promise<AnalysisTags> => {
  await delay(800 + Math.random() * 1500); 
  
  // Find the predefined tag based on content match (simplified logic)
  const template = PREDEFINED_QUESTIONS.find(p => contentMd.includes(p.content.substring(0, 10)));

  if (template) {
     return {
         chapter: template.tags.chapter,
         difficulty: template.defaultDifficulty,
         knowledgePoints: template.tags.kps,
         methods: template.tags.methods,
         competencies: template.tags.comps
     };
  }

  // Fallback random generation if not found (shouldn't happen with this flow)
  return {
    chapter: mockChapters[Math.floor(Math.random() * mockChapters.length)],
    difficulty: 5, 
    knowledgePoints: [mockKnowledge[0], mockKnowledge[1]],
    methods: [mockMethods[0]],
    competencies: [mockCompetencies[0]],
  };
};

/**
 * 3. split_student_exam (Mock Helper)
 * Simulates cutting up the student answer sheet.
 */
export const splitStudentExamApi = async (file: File, examQuestions: Question[]): Promise<Partial<StudentAnswer>[]> => {
  await delay(DELAY_MS);

  const studentAnswers = [
      "解：(1) 由正弦定理得 $2\\sin B \\cos C = 2\\sin A - \\sin C$...",
      "证明：(1) 取 $AD$ 中点 $F$，连接 $EF$。因为 $E$ 为 $PD$ 中点...",
      "解：(1) 甲线合格概率 $P_1 = \\frac{96}{100} = 0.96$...",
      "解：(1) 当 $n=1$ 时，$S_1 = 2a_1 - 2$，解得 $a_1=2$...",
      "解：(1) 设椭圆方程为 $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$。因为 $e = \\frac{c}{a} = \\frac{\\sqrt{2}}{2}$...",
      "解：定义域为 $(0, +\\infty)$。求导得 $f'(x) = \\ln x + 1 - a$..."
  ];

  return examQuestions.map((q, i) => ({
    questionId: q.id,
    imageUrl: q.imageUrl, // Use the original question image instead of generated placeholder
    studentAnswerMd: studentAnswers[i] || "（学生未作答）",
    isAnalyzing: true
  }));
};

/**
 * 4. analyze_student_answer (Mock Endpoint)
 * Accepts: Student answer image, markdown, and original question analysis.
 * Returns: Analysis of student's mastery.
 */
export const analyzeStudentAnswerApi = async (question: Question, answerMd: string): Promise<Omit<StudentAnswer, 'questionId' | 'imageUrl' | 'studentAnswerMd' | 'isAnalyzing'>> => {
  await delay(1000 + Math.random() * 2000);
  
  // Simulation Logic: 
  // Q1, Q3, Q4 are correct.
  // Q2 (Geometry) has missing logic.
  // Q5 (Conics) calculation error.
  // Q6 (Derivative) incomplete classification.
  
  const qNum = question.number;
  let isCorrect = true;
  let score = question.analysis?.difficulty || 5; 
  let feedback = "步骤清晰，逻辑严密，得数正确。";
  
  // Customizing results based on Question Number to simulate a realistic student
  if (qNum === 2) {
      isCorrect = false;
      score = 4;
      feedback = "第(1)问证明过程正确；第(2)问建系坐标计算有误，导致法向量求错，后续结果均不正确。";
  } else if (qNum === 5) {
      isCorrect = false;
      score = 2;
      feedback = "第(1)问方程求对。第(2)问在联立直线与椭圆方程时，韦达定理符号写反，导致无法证明定点。";
  } else if (qNum === 6) {
      isCorrect = false;
      score = 6;
      feedback = "第(1)问正确。第(2)问分类讨论遗漏了 $a \\le 0$ 的情况，定义域考虑不周全。";
  } else {
      // Full marks for others
      score = 10 + (Math.random() > 0.5 ? 0 : 2); // Randomize max score slightly
      if (score > 12) score = 12;
  }

  const maxScore = 12; // Standard hard question score

  const knowledge = question.analysis?.knowledgePoints || [];
  const methods = question.analysis?.methods || [];

  return {
    isCorrect,
    score: isCorrect ? maxScore : score,
    maxScore,
    feedback,
    masteredPoints: isCorrect ? knowledge : [knowledge[0] || ""].filter(Boolean),
    missingPoints: isCorrect ? [] : knowledge.slice(1),
    masteredMethods: isCorrect ? methods : [],
    missingMethods: isCorrect ? [] : methods
  };
};

/**
 * Batch Processing for multiple files
 */
export const batchProcessStudentExamsApi = async (files: FileList, questions: Question[]): Promise<StudentResult[]> => {
  await delay(2000); // Simulate processing delay

  const results: StudentResult[] = [];
  const names = ["李华", "王伟", "张敏", "刘洋", "陈静", "杨强", "赵丽", "孙凯", "周杰", "吴娜"];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const studentName = names[i % names.length] + (i >= names.length ? ` ${i + 1}` : "");
    
    // Create random answers for this student
    const answers: StudentAnswer[] = [];
    const missingKPs = new Set<string>();

    for (const q of questions) {
      // Randomize correctness (approx 60% correct rate)
      const isCorrect = Math.random() > 0.4;
      
      const knowledge = q.analysis?.knowledgePoints || [];
      const methods = q.analysis?.methods || [];
      
      if (!isCorrect) {
        knowledge.slice(1).forEach(k => missingKPs.add(k));
      }

      answers.push({
        questionId: q.id,
        imageUrl: q.imageUrl, // Use original question image
        studentAnswerMd: isCorrect ? "解：步骤略，结果正确。" : "解：尝试推导公式，但计算过程出现偏差...",
        isCorrect,
        score: isCorrect ? 10 : Math.floor(Math.random() * 5),
        maxScore: 10,
        feedback: isCorrect ? "回答正确。" : "关键步骤缺失，需加强练习。",
        missingPoints: isCorrect ? [] : knowledge.slice(1),
        masteredPoints: isCorrect ? knowledge : [knowledge[0] || ""].filter(Boolean),
        missingMethods: isCorrect ? [] : methods,
        masteredMethods: isCorrect ? methods : [],
        isAnalyzing: false, // Return fully analyzed
        isVerified: false
      });
    }

    results.push({
      studentName,
      answers,
      overallMastery: "待定",
      overallGaps: Array.from(missingKPs)
    });
  }

  return results;
};

/**
 * 5. add_to_knowledge_graph (Mock Endpoint)
 * Pushes analysis data to the Knowledge Graph API.
 */
export const addToKnowledgeGraphApi = async (data: any): Promise<boolean> => {
  await delay(1500); // Simulate API latency
  console.log("Adding to Knowledge Graph:", data);
  return true;
};

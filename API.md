# EduScan API 接口文档

本文档定义了前端与后端交互的 RESTful API 接口规范。

**基本约定**：
*   所有接口前缀建议为 `/api/v1`。
*   请求和响应数据格式默认为 JSON（文件上传除外）。
*   后端应当处理跨域 (CORS) 请求。

---

## 1. 试卷处理

### 1.1 分割原始试卷 (Split Exam)

将上传的整张试卷图片或 PDF 切割成独立的题目。

*   **URL**: `/exam/split`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`

**请求参数 (Request)**:

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `file` | File | 是 | 试卷文件（支持 .jpg, .png, .pdf） |

**响应数据 (Response)**:

```json
[
  {
    "id": "q-1715001",           // 题目唯一ID
    "number": 1,                 // 题号
    "imageUrl": "https://...",   // 分割后的题目图片URL
    "contentMd": "**第1题：** 已知集合 A = {x | x > 1}..." // 题目内容的Markdown文本 (OCR结果)
  },
  {
    "id": "q-1715002",
    "number": 2,
    "imageUrl": "https://...",
    "contentMd": "..."
  }
]
```

---

### 1.2 分析单道题目 (Analyze Question)

对单道题目进行深度分析，提取知识点、方法和核心素养。

*   **URL**: `/question/analyze`
*   **Method**: `POST`
*   **Content-Type**: `application/json`

**请求参数 (Request)**:

```json
{
  "questionId": "q-1715001",
  "contentMd": "**第1题：** 已知集合 A = {x | x > 1}...",
  "imageUrl": "https://..." // 可选，如果后端需要重新分析图片
}
```

**响应数据 (Response)**:

```json
{
  "chapter": "必修第一册 第1章 - 集合与常用逻辑用语", // 教材章节
  "difficulty": 3,                                // 难度系数 (1-10)
  "knowledgePoints": ["集合的交并补运算", "不等式解法"], // 知识点列表
  "methods": ["数形结合思想"],                      // 解题方法列表
  "competencies": ["数学运算", "逻辑推理"]          // 核心素养列表
}
```

---

## 2. 学生答卷处理

### 2.1 分割学生答卷 (Split Student Exam)

上传学生的答题纸，根据原试卷的结构进行切割，提取每道题的学生作答内容。

*   **URL**: `/student/exam/split`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`

**请求参数 (Request)**:

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `file` | File | 是 | 学生答题纸图片或扫描件 |
| `examId` | String | 是 | 关联的原始试卷ID (可选，视后端实现而定) |
| `questions`| String | 否 | JSON字符串，包含原题结构信息，辅助切割定位 |

**响应数据 (Response)**:

```json
[
  {
    "questionId": "q-1715001",     // 对应原题ID
    "imageUrl": "https://...",     // 学生手写区域切图URL
    "studentAnswerMd": "解：由题意得 A ∩ B = {2, 3}..." // 手写文字OCR识别后的Markdown
  },
  {
    "questionId": "q-1715002",
    "imageUrl": "https://...",
    "studentAnswerMd": "..."
  }
]
```

---

### 2.2 分析学生作答 (Analyze Student Answer)

对比原题分析与学生作答，给出评分、评语及漏洞诊断。

*   **URL**: `/student/answer/analyze`
*   **Method**: `POST`
*   **Content-Type**: `application/json`

**请求参数 (Request)**:

```json
{
  "questionId": "q-1715001",
  "studentAnswerMd": "解：...", // 学生的作答内容
  "questionContentMd": "...",  // 原题内容
  "analysis": {                // 原题的标准分析数据
    "knowledgePoints": [...],
    "methods": [...]
  }
}
```

**响应数据 (Response)**:

```json
{
  "isCorrect": false,              // 是否基本正确
  "score": 8,                      // 学生得分
  "maxScore": 12,                  // 本题满分
  "feedback": "思路大体正确，但在求解不等式时符号方向弄反了。", // AI评语
  "masteredPoints": ["集合的定义"], // 判定为已掌握的知识点
  "missingPoints": ["不等式解法"],  // 判定为缺失/错误的知识点
  "masteredMethods": [],
  "missingMethods": ["数形结合思想"],
  "reviewChapter": "必修第一册 第1章" // 推荐复习章节 (可选)
}
```

---

## 3. 知识图谱集成

### 3.1 加入学生知识图谱 (Add to Knowledge Graph)

将本次考试的分析结果汇总推送到学生个人知识图谱。

*   **URL**: `/knowledge-graph/add`
*   **Method**: `POST`
*   **Content-Type**: `application/json`

**请求参数 (Request)**:

```json
{
  "studentName": "张三",
  "examTitle": "2024年高一数学期中模拟卷",
  "score": 85,          // 总得分
  "totalScore": 100,    // 卷面总分
  "knowledgePoints": {
    "mastered": ["集合运算", "函数定义域", ...],
    "missing": ["立体几何辅助线", "导数分类讨论", ...]
  },
  "methods": {
    "mastered": ["待定系数法"],
    "missing": ["特殊值法"]
  }
}
```

**响应数据 (Response)**:

```json
{
  "success": true,
  "message": "Data successfully integrated into knowledge graph.",
  "recordId": "kg-record-998877"
}
```

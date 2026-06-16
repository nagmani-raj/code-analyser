# ⚡ DSA Code Analyzer

> A production-ready Chrome Extension that **automatically analyzes DSA code** on LeetCode, GeeksforGeeks, HackerRank, and Codeforces — detecting language, algorithmic approach, time/space complexity, and optimization status in real time.

![DSA Analyzer](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

---

## 🏗 Architecture

```
dsa-code-analyzer/
├── apps/
│   ├── extension/          # Chrome Extension (React + Vite + Tailwind + MV3)
│   └── backend/            # NestJS REST API
├── packages/
│   ├── analyzer/           # Core AST analysis engine (reusable)
│   └── shared/             # Shared TypeScript types & constants
└── turbo.json              # Turborepo orchestration
```

### Key Design Decisions
- **Local analysis by default** — runs in the extension without needing a server
- **No auth required for MVP** — anonymous analysis saved locally
- **Reusable analyzer** — can be used in VSCode extension, web app, or backend
- **AST-lite analysis** — multi-pass heuristic analysis without WASM tree-sitter for browser compatibility

---

## 🎯 Features

### Supported Platforms
| Platform | Code Editor | Language Detection |
|----------|-------------|-------------------|
| LeetCode | Monaco Editor | ✅ |
| GeeksforGeeks | CodeMirror | ✅ |
| HackerRank | CodeMirror | ✅ |
| Codeforces | Textarea / Ace | ✅ |

### Supported Languages
C++, Java, Python, JavaScript, TypeScript, Go

### Detected Approaches (21 total)
| Category | Approaches |
|----------|-----------|
| Traversal | DFS, BFS, Backtracking, Recursion |
| Array | Two Pointer, Sliding Window, Binary Search |
| Data Structures | Hashing, Stack, Queue, Heap, Trie, Segment Tree, Union Find |
| Graph | Graph, Tree |
| Optimization | Dynamic Programming, Greedy, Bit Manipulation, Divide and Conquer |

### Complexity Classes
**Time:** O(1), O(log n), O(n), O(n log n), O(n²), O(n³), O(2^n), O(n!)  
**Space:** O(1), O(log n), O(n), O(n²)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (only for backend)

### 1. Install dependencies
```bash
cd d:\project\extension
npm install
```

### 2. Build packages
```bash
npm run build
```

### 3. Load the extension in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select `apps/extension/dist/`

### 4. (Optional) Start the backend
```bash
# Copy and fill in your DB credentials
cp apps/backend/.env.example apps/backend/.env

# Run database migrations
cd apps/backend
npx prisma migrate dev --name init

# Start the server
npm run dev
```

---

## 🔧 Development

```bash
# Watch-mode build for extension
cd apps/extension
npm run dev

# Reload the extension in Chrome after each build:
# chrome://extensions → click ↺ on "DSA Code Analyzer"

# Run backend in dev mode
cd apps/backend
npm run dev

# Run analyzer unit tests
cd packages/analyzer
npm test
```

---

## 🧪 Running Tests

```bash
# All packages
npm run test

# Analyzer unit tests only
cd packages/analyzer && npm test -- --coverage
```

Tests cover:
- Language auto-detection (C++, Java, Python)
- Approach detection (Hashing, Binary Search, DP, BFS, Union Find, etc.)
- Complexity estimation (loop nesting, recursion, memoization)
- Optimization evaluation (Optimized, Can Be Optimized, Not Optimized)
- Edge cases (empty code, too-short snippets)

---

## 📡 API Reference

### `POST /analyze`
Analyze code and return DSA report.

**Request:**
```json
{
  "code": "...",
  "language": "cpp",
  "platform": "leetcode"
}
```

**Response:**
```json
{
  "id": "clx...",
  "language": "C++",
  "approach": "Two Pointer",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "optimization": "Optimized",
  "confidence": 0.85,
  "analyzedAt": "2024-01-01T00:00:00.000Z",
  "details": {
    "loopDepth": 1,
    "hasRecursion": false,
    "dataStructures": [],
    "patterns": ["Single loop over input → linear time"]
  }
}
```

### `GET /history?limit=20&offset=0`
Retrieve paginated analysis history.

### `GET /stats`
Get aggregate stats (top approaches, languages).

### `GET /health`
Health check endpoint.

**Swagger UI:** `http://localhost:3001/api/docs`

---

## 🎨 Extension UI

- **Popup** — Click the extension icon to see the analysis panel
- **Floating Panel** — Draggable, collapsible panel injected into the coding site
- **Analysis Tab** — Current analysis with metrics
- **History Tab** — Last 50 analyses
- **Settings Tab** — Toggle local vs backend analysis, auto-analyze

---

## 📊 Database Schema

```prisma
model User {
  id        String            @id @default(cuid())
  email     String            @unique
  analyses  AnalysisHistory[]
}

model AnalysisHistory {
  id              String   @id @default(cuid())
  userId          String?
  code            String   @db.Text
  language        String
  approach        String
  timeComplexity  String
  spaceComplexity String
  optimization    String
  platform        String?
  confidence      Float
  createdAt       DateTime @default(now())
}
```

---

## 🔌 Extending the Analyzer

The `@dsa-analyzer/analyzer` package is framework-agnostic:

```typescript
import { analyzeCode } from '@dsa-analyzer/analyzer';

const result = await analyzeCode(`
  vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
      int comp = target - nums[i];
      if (mp.count(comp)) return {mp[comp], i};
      mp[nums[i]] = i;
    }
    return {};
  }
`, { language: 'cpp' });

// Result:
// { language: 'C++', approach: 'Hashing', timeComplexity: 'O(n)', ... }
```

---

## 🗂 Monorepo Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run dev` | Watch all packages |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript check all |
| `npm run clean` | Clean all build artifacts |

---

## 📁 Full Project Structure

```
apps/
  extension/
    manifest.json                    # Chrome MV3 manifest
    vite.config.ts                   # Multi-entry Vite build
    tailwind.config.js               # Dark theme config
    src/
      popup/
        index.html                   # Popup entry HTML
        main.tsx                     # React root
        App.tsx                      # Main popup app (3 tabs)
      panel/
        index.html                   # Panel entry HTML
        Panel.tsx                    # Floating draggable panel
      content/
        index.ts                     # Content script (platform detector)
        extractors/
          leetcode.ts                # Monaco/CodeMirror extractor
          geeksforgeeks.ts           # GFG CodeMirror extractor
          hackerrank.ts              # HR CodeMirror extractor
          codeforces.ts              # CF textarea/Ace extractor
      background/
        service-worker.ts            # MV3 service worker
      components/
        AnalysisReport.tsx           # Analysis display component
        LoadingState.tsx             # Skeleton loading state
        ErrorState.tsx               # Error with retry button
      styles/
        index.css                    # Global Tailwind CSS

  backend/
    prisma/
      schema.prisma                  # User + AnalysisHistory models
    src/
      main.ts                        # Bootstrap (CORS + Swagger)
      app.module.ts                  # Root module
      prisma/
        prisma.service.ts            # Prisma client singleton
        prisma.module.ts             # Global Prisma module
      analysis/
        analysis.controller.ts       # POST /analyze, GET /history, GET /stats
        analysis.service.ts          # Analysis logic + DB persistence
        analysis.module.ts
        dto/
          analyze.dto.ts             # Request validation DTO
      health/
        health.controller.ts         # GET /health

packages/
  shared/
    src/
      types.ts                       # All shared TypeScript types
      constants.ts                   # Platform maps, config values
      index.ts

  analyzer/
    src/
      index.ts                       # Main analyzeCode() export
      language-detector.ts           # Code-based language detection
      ast-parser.ts                  # Feature extraction (loop depth, DS usage)
      approach-detector.ts           # 21 algorithmic approaches
      complexity-estimator.ts        # Time & space complexity estimation
      optimization-evaluator.ts      # Optimization status rules engine
      __tests__/
        analyzer.test.ts             # Unit tests with real DSA snippets
```

---

## 📝 License

MIT

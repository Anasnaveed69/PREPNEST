import type { Question, Difficulty, Confidence } from '../types';

const STORAGE_KEY = 'prepnest_questions_vault';

// High-quality industry seed questions
const SEED_QUESTIONS: Question[] = [
  {
    id: 'seed-1',
    question: 'What is the "N+1 Query Problem" in databases/ORMs, and how do you resolve it?',
    answer: 'The **N+1 Query Problem** occurs when an application makes 1 initial query to fetch N parent records, and then executes N subsequent queries to fetch child data for each parent record. This leads to N+1 database roundtrips, causing severe performance bottlenecks.\n\n### Example:\nFetching 50 blog posts, and then doing a separate query for each post to get its author details.\n\n### Solutions:\n1. **Eager Loading (Join Fetching):** Fetch both parent and child data in a single query using a `JOIN`.\n2. **Batch Fetching:** Query parent records, collect their child foreign keys, and fetch all child records in one query with `IN (child_ids)`.\n3. **Select Related / Prefetch Related:** Utilizing ORM specific eager-loading features (e.g., Django\'s `select_related` or Hibernate\'s `@BatchSize`).',
    topic: 'DBMS',
    difficulty: 'Medium',
    confidence: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'seed-2',
    question: 'Explain the React Fiber Architecture and how it improves rendering performance.',
    answer: '**React Fiber** is the reconciliation engine introduced in React 16. Its primary goal is to enable **incremental rendering**—the ability to split rendering work into chunks and spread it out over multiple frames.\n\n### Key Mechanics:\n- **Pause & Resume Work:** Fiber allows React to pause rendering work, yield to the browser main thread to handle user inputs or animations, and then resume rendering.\n- **Priority Levels:** Updates are categorized by priority (e.g., discrete interactions like clicks have higher priority than network data updates).\n- **Dual Buffering:** React maintains two fiber trees: a `current` tree (displayed on screen) and a `workInProgress` tree. Updates are prepared off-screen on the `workInProgress` tree and then atomicly swapped when complete, avoiding partial rendering glitches.',
    topic: 'React',
    difficulty: 'Hard',
    confidence: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'seed-3',
    question: 'How do JavaScript Closures work? Provide a classic code example demonstrating their usage.',
    answer: 'A **closure** is the combination of a function bundled together with references to its surrounding state (the **lexical environment**). In other words, a closure gives an inner function access to the outer function\'s scope even after the outer function has returned.\n\n### Code Example:\n```javascript\nfunction createCounter() {\n  let count = 0; // Private state\n  \n  return {\n    increment: function() {\n      count++;\n      return count;\n    },\n    decrement: function() {\n      count--;\n      return count;\n    },\n    getCount: function() {\n      return count;\n    }\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment()); // 1\nconsole.log(counter.increment()); // 2\nconsole.log(counter.getCount());    // 2\n// count variable is inaccessible from global scope!\n```',
    topic: 'JavaScript',
    difficulty: 'Easy',
    confidence: 'High',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'seed-4',
    question: 'What are the SOLID principles in Object-Oriented Design? Provide a brief summary of each.',
    answer: 'The **SOLID principles** are five design principles intended to make software designs more understandable, flexible, and maintainable:\n\n1. **S - Single Responsibility Principle (SRP):** A class should have only one reason to change (only one job/responsibility).\n2. **O - Open/Closed Principle (OCP):** Software entities should be open for extension but closed for modification. Extend behavior using polymorphism, not by rewriting classes.\n3. **L - Liskov Substitution Principle (LSP):** Subtypes must be substitutable for their base types without breaking application correctness.\n4. **I - Interface Segregation Principle (ISP):** Clients should not be forced to depend on interfaces they do not use. Split fat interfaces into smaller, cohesive ones.\n5. **D - Dependency Inversion Principle (DIP):** Depend on abstractions (interfaces), not concrete implementations. High-level modules should not depend on low-level modules.',
    topic: 'OOP',
    difficulty: 'Medium',
    confidence: 'Medium',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'seed-5',
    question: 'Design a highly available URL shortening service (like Bit.ly) at scale. What are the key bottlenecks?',
    answer: 'Designing a URL Shortener requires addressing both read-heavy workloads and high write volumes.\n\n### Core System Components:\n1. **Hash Generator:** Convert the original URL to a short alphanumeric key (e.g. Base62). To avoid collisions across distributed servers, use a **Range Keeper Service** (using Apache ZooKeeper) to hand out coordinate segments of IDs.\n2. **Storage:** NoSQL databases (like Cassandra or MongoDB) are perfect here because they scale horizontally. We only need a simple key-value look up: `short_url_hash -> original_url`.\n3. **Caching Layer:** Reads will be 100x writes. Use **Redis** caching with an LRU (Least Recently Used) eviction policy for popular shortened links to avoid hammering database storage.\n\n### Bottlenecks & Solutions:\n- **API Rate Limiting:** Prevent DDoS attacks by putting token-bucket rate limiters at the API gateway layer.\n- **Analytics Write Spikes:** Logging clicks/metrics synchronously slows redirections. Solve this by pushing telemetry events to a message queue (**Apache Kafka**) and processing them asynchronously.',
    topic: 'System Design',
    difficulty: 'Hard',
    confidence: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

export const loadQuestions = (): Question[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First load: seed with high-quality defaults
      saveQuestions(SEED_QUESTIONS);
      return SEED_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SEED_QUESTIONS;
    }
    // Clean parsed items using basic schema checks
    return parsed.map((item: any) => ({
      id: String(item.id || Math.random().toString(36).substring(2, 9)),
      question: String(item.question || ''),
      answer: String(item.answer || ''),
      topic: String(item.topic || 'General'),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? (item.difficulty as Difficulty) : 'Medium',
      confidence: ['Low', 'Medium', 'High'].includes(item.confidence) ? (item.confidence as Confidence) : 'Low',
      createdAt: String(item.createdAt || new Date().toISOString()),
      updatedAt: String(item.updatedAt || new Date().toISOString()),
    }));
  } catch (e) {
    console.error('Failed to parse localStorage questions vault', e);
    return SEED_QUESTIONS;
  }
};

export const saveQuestions = (questions: Question[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to write questions vault to localStorage', e);
  }
};

export const exportBackup = async (questions: Question[]): Promise<void> => {
  const jsonString = JSON.stringify(questions, null, 2);

  // Use standard File System Access API if supported (standard on modern Chrome/Edge).
  // This opens a native OS Save Dialog, bypassing browser-level enterprise UUID renames!
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `prepnest_backup_${new Date().toISOString().split('T')[0]}.json`,
        types: [{
          description: 'PrepNest JSON Backup',
          accept: {
            'application/json': ['.json']
          }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      return;
    } catch (e: any) {
      // If user aborted/cancelled the picker, stop.
      if (e.name === 'AbortError') {
        return;
      }
      console.warn('showSaveFilePicker declined, falling back to anchor download:', e);
    }
  }

  // Fallback anchor method for Firefox/Safari/Legacy browsers
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `prepnest_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  
  // Defer cleanup to allow browser's async download manager to safely resolve the Blob metadata
  setTimeout(() => {
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }, 100);
};

export const validateAndImportBackup = (jsonString: string): Question[] => {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid backup format: root elements must be an array of questions.');
  }

  const validated: Question[] = [];
  for (const item of parsed) {
    if (!item.question || typeof item.question !== 'string') {
      throw new Error('Invalid backup item: "question" field is required and must be a string.');
    }
    if (!item.answer || typeof item.answer !== 'string') {
      throw new Error('Invalid backup item: "answer" field is required and must be a string.');
    }

    validated.push({
      id: item.id && typeof item.id === 'string' ? item.id : Math.random().toString(36).substring(2, 9),
      question: item.question.trim(),
      answer: item.answer.trim(),
      topic: item.topic && typeof item.topic === 'string' ? item.topic.trim() : 'General',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? (item.difficulty as Difficulty) : 'Medium',
      confidence: ['Low', 'Medium', 'High'].includes(item.confidence) ? (item.confidence as Confidence) : 'Low',
      createdAt: item.createdAt && typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return validated;
};

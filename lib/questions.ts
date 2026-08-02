export type Question = {
  id: number
  category: 'hr' | 'technical' | 'dsa'
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint: string
}

export const questions: Question[] = [
  // HR Questions
  {
    id: 1,
    category: 'hr',
    question: 'Tell me about yourself and your journey as a developer.',
    difficulty: 'easy',
    hint: 'Cover your education, key projects, and what drives you technically.',
  },
  {
    id: 2,
    category: 'hr',
    question: 'Describe a challenging project you worked on and how you overcame the obstacles.',
    difficulty: 'medium',
    hint: 'Use the STAR method: Situation, Task, Action, Result.',
  },
  {
    id: 3,
    category: 'hr',
    question: 'Where do you see yourself in 5 years?',
    difficulty: 'easy',
    hint: "Align your goals with the company's vision and your technical growth.",
  },
  {
    id: 4,
    category: 'hr',
    question: 'Tell me about a time you worked in a team and faced a conflict. How did you resolve it?',
    difficulty: 'medium',
    hint: 'Focus on communication and collaborative problem solving.',
  },
  {
    id: 5,
    category: 'hr',
    question: 'What is your biggest weakness and what are you doing to improve it?',
    difficulty: 'medium',
    hint: 'Be honest but show self-awareness and active improvement.',
  },

  // Technical Questions
  {
    id: 6,
    category: 'technical',
    question: 'Explain the difference between REST and GraphQL. When would you choose one over the other?',
    difficulty: 'medium',
    hint: 'Think about over-fetching, under-fetching, and use cases.',
  },
  {
    id: 7,
    category: 'technical',
    question: 'What is the virtual DOM in React and how does it improve performance?',
    difficulty: 'easy',
    hint: 'Explain diffing algorithm and reconciliation.',
  },
  {
    id: 8,
    category: 'technical',
    question: 'Explain how you would design a URL shortener system like bit.ly.',
    difficulty: 'hard',
    hint: 'Cover hashing, database design, scalability, and redirects.',
  },
  {
    id: 9,
    category: 'technical',
    question: 'What are the differences between SQL and NoSQL databases? When would you use each?',
    difficulty: 'medium',
    hint: 'Cover ACID, scalability, and real-world use cases.',
  },
  {
    id: 10,
    category: 'technical',
    question: 'How does JWT authentication work? What are its advantages and limitations?',
    difficulty: 'medium',
    hint: 'Explain header.payload.signature and stateless auth.',
  },

  // DSA Questions
  {
    id: 11,
    category: 'dsa',
    question: 'Explain how a HashMap works internally. What happens during a collision?',
    difficulty: 'medium',
    hint: 'Cover hashing function, chaining vs open addressing.',
  },
  {
    id: 12,
    category: 'dsa',
    question: 'What is the difference between BFS and DFS? Give real-world use cases for each.',
    difficulty: 'easy',
    hint: 'Think about shortest path vs exhaustive search scenarios.',
  },
  {
    id: 13,
    category: 'dsa',
    question: 'Explain dynamic programming with an example. How do you identify if a problem needs DP?',
    difficulty: 'hard',
    hint: 'Cover overlapping subproblems and optimal substructure.',
  },
  {
    id: 14,
    category: 'dsa',
    question: 'What is the time and space complexity of QuickSort? When does it perform worst?',
    difficulty: 'medium',
    hint: 'Cover average O(n log n), worst O(n²), and pivot selection.',
  },
  {
    id: 15,
    category: 'dsa',
    question: 'Explain binary search and when you would use it over linear search.',
    difficulty: 'easy',
    hint: 'Cover sorted array requirement and O(log n) complexity.',
  },
]

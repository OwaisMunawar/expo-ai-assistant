/** Starter prompts shown on an empty chat. */
export type Prompt = {
  id: string;
  title: string;
  subtitle: string;
  text: string;
};

export const PROMPTS: readonly Prompt[] = [
  {
    id: 'explain',
    title: 'Explain simply',
    subtitle: 'A hard idea in plain words',
    text: 'Explain how on-device machine learning works on a phone, as if I were a smart 12-year-old.',
  },
  {
    id: 'plan',
    title: 'Plan my week',
    subtitle: 'Turn goals into a schedule',
    text: 'Help me plan a focused week. Ask me three questions about my goals first, then propose a day-by-day plan.',
  },
  {
    id: 'code',
    title: 'Review code',
    subtitle: 'Find bugs, suggest fixes',
    text: 'Review this React Native hook for bugs and performance issues:\n\n```ts\nfunction useTimer() {\n  const [t, setT] = useState(0);\n  useEffect(() => { setInterval(() => setT(t + 1), 1000); }, []);\n  return t;\n}\n```',
  },
  {
    id: 'email',
    title: 'Draft an email',
    subtitle: 'Clear, friendly, short',
    text: 'Draft a short, friendly email to a client proposing we move our weekly check-in from Monday to Tuesday.',
  },
] as const;

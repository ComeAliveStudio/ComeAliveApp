// What the "email me the guide" message says for each tool. The text is written here, on the server,
// and the page only sends a short key (for example "loop"), so nobody can use the form to send
// their own text through our domain.

export const TOOLS = {
  'overthinking-score': {
    title: 'Overthinking Score',
    book: 'Stop Thinking Negative',
    url: '/overthinking-score/',
    results: {
      loop: { name: 'The Replay Loop', tip: 'Give the replay a fixed slot: 10 minutes a day. If it starts outside that slot, write "parked for 6 pm". At 6 pm decide one thing only: is there an action? If yes, schedule it. If no, close it.' },
      worst: { name: 'The Worst-Case Rehearser', tip: 'Write the worst case, the best case and the most likely case, then the next smallest action. Aim at "most likely", not at "worst".' },
      control: { name: 'The Certainty Seeker', tip: 'Decide in advance how much information is "good enough", set a timer and choose when it rings. Make small decisions in under 2 minutes this week.' },
      self: { name: 'The Inner Critic', tip: 'When the critic speaks, ask: "Would I say this to a friend?" Then rewrite the sentence in the voice you would use for a friend. Do it three times a day.' },
    },
    steps: [
      'Pick one pattern and one exercise. Not all of them.',
      'Repeat it for seven days, at the same time each day.',
      'On day seven, retake the score and compare.',
    ],
  },
  'thought-reframer': {
    title: 'Thought Reframer',
    book: 'Stop Thinking Negative',
    url: '/thought-reframer/',
    results: {},
    steps: [
      'Write down the thought exactly as your mind says it.',
      'List the evidence for it and the evidence against it.',
      'Write a balanced version, not a positive one: "Maybe..., and...".',
    ],
  },
  'procrastination-breaker': {
    title: 'Procrastination Breaker',
    book: 'Coach Yourself to Mastery',
    url: '/procrastination-breaker/',
    results: {
      fear: { name: 'Fear of judgement', tip: 'Make the first version private and imperfect on purpose. Share it with one safe person before anyone else. Mistakes found early are cheap.' },
      perfect: { name: 'Perfectionism', tip: 'Set a timer for 10 minutes and make the worst possible version. Then improve it. Decide in advance what "done" looks like, and stop there.' },
      overwhelm: { name: 'Overwhelm', tip: 'Cut the task into pieces that take 10 minutes or less. Write only the first piece on a card. Do that piece, nothing else.' },
      clarity: { name: 'Low clarity', tip: 'Write in one sentence why this task matters and what happens if it stays undone. Then set a deadline and tell one person.' },
    },
    steps: [
      'Choose the task you have avoided longest.',
      'Do only the first 10 minutes, today, at a fixed time.',
      'Tomorrow, repeat. Momentum does the rest.',
    ],
  },
  'action-planner': {
    title: '30-Day Action Planner',
    book: 'Coach Yourself to Mastery',
    url: '/action-planner/',
    results: {},
    steps: [
      'Do the 10-minute first action from your plan today.',
      'Look at the plan every Sunday and adjust the next week only.',
      'On day 30, write what worked, then choose the next wish.',
    ],
  },
}

export const questionsArray = [
  {
    "id": 1,
    "type": "true_false",
    "question": [
      { "type": "text", "content": "According to Rolle's Theorem, if a function " },
      { "type": "latex", "content": "f" },
      { "type": "text", "content": " is continuous on " },
      { "type": "latex", "content": "[a, b]" },
      { "type": "text", "content": ", differentiable on " },
      { "type": "latex", "content": "(a, b)" },
      { "type": "text", "content": ", and " },
      { "type": "latex", "content": "f(a) = f(b)" },
      { "type": "text", "content": ", then there exists at least one " },
      { "type": "latex", "content": "c" },
      { "type": "text", "content": " in " },
      { "type": "latex", "content": "(a, b)" },
      { "type": "text", "content": " such that " },
      { "type": "latex", "content": "f'(c) = 0" },
      { "type": "text", "content": "." }
    ],
    "answer": "true",
    "graphs": []
  },
  {
    "id": 2,
    "type": "mcq",
    "question": [
      { "type": "text", "content": "Which of the following functions satisfies the conditions of Rolle's Theorem on the interval " },
      { "type": "latex", "content": "[0, 2]?" }
    ],
    "options": [
      [
        { "type": "latex", "content": "f(x) = x^2 - 2x" }
      ],
      [
        { "type": "latex", "content": "f(x) = |x - 1|" }
      ],
      [
        { "type": "latex", "content": "f(x) = \\frac{1}{x}" }
      ],
      [
        { "type": "latex", "content": "f(x) = \\sqrt{x}" }
      ]
    ],
    "answer": [
      { "type": "latex", "content": "f(x) = x^2 - 2x" }
    ],
    "graphs": [
      {
        "type": "function",
        "fn": "x^2 - 2x",
        "range": [0, 2],
        "color": "blue"
      }
    ]
  },
  {
    "id": 3,
    "type": "short_answer",
    "question": [
      { "type": "text", "content": "Find the value of " },
      { "type": "latex", "content": "c" },
      { "type": "text", "content": " in the interval " },
      { "type": "latex", "content": "[1, 3]" },
      { "type": "text", "content": " that satisfies the conclusion of the Mean Value Theorem for the function " },
      { "type": "latex", "content": "f(x) = x^3 - 4x" },
      { "type": "text", "content": "." }
    ],
    "answer": [
      { "type": "latex", "content": "c = \\sqrt{\\frac{10}{3}}" }
    ],
    "graphs": [
      {
        "type": "function",
        "fn": "x^3 - 4x",
        "range": [1, 3],
        "color": "green"
      }
    ]
  },
  {
    "id": 4,
    "type": "word_problem",
    "question": [
      { "type": "text", "content": "A car travels along a straight road. Its position at time " },
      { "type": "latex", "content": "t" },
      { "type": "text", "content": " (in hours) is given by " },
      { "type": "latex", "content": "s(t) = t^3 - 6t^2 + 9t" },
      { "type": "text", "content": " kilometers. Show that there is at least one time " },
      { "type": "latex", "content": "c" },
      { "type": "text", "content": " in the interval " },
      { "type": "latex", "content": "[1, 4]" },
      { "type": "text", "content": " where the car's instantaneous velocity equals its average velocity over this interval." }
    ],
    "answer": [
      { "type": "text", "content": "The average velocity over " },
      { "type": "latex", "content": "[1, 4]" },
      { "type": "text", "content": " is " },
      { "type": "latex", "content": "\\frac{s(4) - s(1)}{4 - 1} = \\frac{(64 - 96 + 36) - (1 - 6 + 9)}{3} = \\frac{4 - 4}{3} = 0" },
      { "type": "text", "content": ". The derivative " },
      { "type": "latex", "content": "s'(t) = 3t^2 - 12t + 9" },
      { "type": "text", "content": " equals 0 when " },
      { "type": "latex", "content": "3t^2 - 12t + 9 = 0" },
      { "type": "text", "content": ", which simplifies to " },
      { "type": "latex", "content": "t^2 - 4t + 3 = 0" },
      { "type": "text", "content": ". The solutions are " },
      { "type": "latex", "content": "t = 1" },
      { "type": "text", "content": " and " },
      { "type": "latex", "content": "t = 3" },
      { "type": "text", "content": ", both in " },
      { "type": "latex", "content": "[1, 4]" },
      { "type": "text", "content": "." }
    ],
    "graphs": [
      {
        "type": "function",
        "fn": "t^3 - 6t^2 + 9t",
        "range": [1, 4],
        "color": "red"
      }
    ]
  },
  {
    "id": 5,
    "type": "short_answer",
    "question": [
      { "type": "text", "content": "Let " },
      { "type": "latex", "content": "f(x) = \\sin(x) - \\cos(x)" },
      { "type": "text", "content": " on the interval " },
      { "type": "latex", "content": "[0, \\pi]" },
      { "type": "text", "content": ". Find all values of " },
      { "type": "latex", "content": "c" },
      { "type": "text", "content": " in " },
      { "type": "latex", "content": "(0, \\pi)" },
      { "type": "text", "content": " that satisfy the conclusion of the Mean Value Theorem." }
    ],
    "answer": [
      { "type": "latex", "content": "c = \\frac{\\pi}{4}" }
    ],
    "graphs": [
      {
        "type": "function",
        "fn": "sin(x) - cos(x)",
        "range": [0, 3.14],
        "color": "purple"
      }
    ]
  }
]
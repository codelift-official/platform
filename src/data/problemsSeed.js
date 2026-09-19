// ── Python Progressive Journey — Coding Arena Seed ──────────────────────────
// A carefully ordered, production-grade progression for Python learners.
// Every problem includes a precise specification, multiple hints, and honest
// test cases covering positive, negative, boundary and edge scenarios.
//
//   Phase A — Foundations & Control Flow       (#1 – #11)
//   Phase B — Lists & Iteration                (#12 – #31)
//   Phase C — Strings, Dicts & Classic Algos   (#32 – #42)
//   Phase D — Search, DP & Algorithms          (#43 – #50)
//   Phase E — Advanced Data Structures & Prod  (#51 – #55)
//
// NOTE: ids are stable forever — renaming or reordering the array must never
// change an existing id, because URLs, saved attempts and legacy links depend
// on them. Titles are numbered to match the array index so the arena sequence
// stays aligned (orderIndex is derived from the array position).

export const SEED_PROBLEMS = [
  // ═══════════════════════════════════════════════════════════════════════
  // PHASE A — FOUNDATIONS & CONTROL FLOW
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "prob-hello-world",
    title: "1. Hello, World! (Strings & Functions)",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `say_hello(name='World')` that returns the string `'Hello, <name>!'`. If `name` is omitted or an empty string, it must default to `'World'`, producing `'Hello, World!'`. This is your first lesson in function parameters, default arguments and f-string formatting.",
    starterCode: "def say_hello(name='World'):\n    # Return the greeting string\n    pass\n",
    hints: [
      "Use an f-string: `return f\"Hello, {name}!\"`.",
      "Handle falsy names: `if not name: name = 'World'` before formatting.",
      "Default arguments are evaluated at definition time — `name='World'` covers omitted calls; the falsy check covers empty-string calls."
    ],
    testCases: [
      { input: "say_hello('Alice')", expected: "'Hello, Alice!'", internalInput: "Alice" },
      { input: "say_hello('CodeLift')", expected: "'Hello, CodeLift!'", internalInput: "CodeLift" },
      { input: "say_hello()", expected: "'Hello, World!'", internalInput: "" },
      { input: "say_hello('')", expected: "'Hello, World!'", internalInput: "" }
    ]
  },
  {
    id: "prob-greeting-formatter",
    title: "2. Personalized Greeting Builder",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `greet(name, greeting='Hello')` that returns the string `'<greeting>, <name>!'`. The `greeting` parameter is optional and defaults to `'Hello'`. Lesson: default arguments and combining two values into one formatted string.",
    starterCode: "def greet(name, greeting='Hello'):\n    # Return f\"{greeting}, {name}!\"\n    pass\n",
    hints: [
      "Return exactly `f\"{greeting}, {name}!\"` — watch the comma and the exclamation mark.",
      "The default argument `greeting='Hello'` is used only when the caller omits the second argument."
    ],
    testCases: [
      { input: "greet('Ada')", expected: "'Hello, Ada!'", internalInput: "Ada" },
      { input: "greet('Ada', 'Hi')", expected: "'Hi, Ada!'", internalInput: "Ada" },
      { input: "greet('Kai', 'Good morning')", expected: "'Good morning, Kai!'", internalInput: "Kai" },
      { input: "greet('')", expected: "'Hello, !'", internalInput: "" }
    ]
  },
  {
    id: "prob-even-or-odd",
    title: "3. Even or Odd Checker",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `is_even(n)` that returns `True` if `n` is an even integer and `False` otherwise. Works for positive, negative and zero. Lesson: the modulo operator `%` and boolean returns.",
    starterCode: "def is_even(n):\n    # Return True if n is even, else False\n    pass\n",
    hints: [
      "A number is even when `n % 2 == 0`.",
      "In Python, `-7 % 2 == 1` and `0 % 2 == 0` — modulo behaviour is well-defined for negatives."
    ],
    testCases: [
      { input: "is_even(4)", expected: "True", internalInput: 4 },
      { input: "is_even(7)", expected: "False", internalInput: 7 },
      { input: "is_even(0)", expected: "True", internalInput: 0 },
      { input: "is_even(-7)", expected: "False", internalInput: -7 },
      { input: "is_even(-2)", expected: "True", internalInput: -2 }
    ]
  },
  {
    id: "prob-leap-year",
    title: "4. Leap Year Detector",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `is_leap_year(year)` that returns `True` if `year` is a leap year under the Gregorian calendar rules: a year is a leap year if it is divisible by 4, except if it is divisible by 100 — unless it is also divisible by 400. `year` is always a positive integer. Lesson: compound boolean logic and the exact order of the checks.",
    starterCode: "def is_leap_year(year):\n    # Apply the Gregorian leap-year rule\n    pass\n",
    hints: [
      "One-liner: `return year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)`.",
      "Common failure: marking every century year as a leap year. 1900 is NOT a leap year; 2000 IS."
    ],
    testCases: [
      { input: "is_leap_year(2020)", expected: "True", internalInput: 2020 },
      { input: "is_leap_year(2023)", expected: "False", internalInput: 2023 },
      { input: "is_leap_year(1900)", expected: "False", internalInput: 1900 },
      { input: "is_leap_year(2000)", expected: "True", internalInput: 2000 },
      { input: "is_leap_year(4)", expected: "True", internalInput: 4 }
    ]
  },
  {
    id: "prob-grade-classifier",
    title: "5. Exam Grade Classifier",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `grade_classifier(score)` that maps a numeric score to a letter grade using these exact boundaries: 90-100 → `'A'`, 80-89 → `'B'`, 70-79 → `'C'`, 60-69 → `'D'`, 0-59 → `'F'`. If `score` is outside 0-100, return `'Invalid'`. Lesson: `if`/`elif` chains where boundary values must be tested carefully.",
    starterCode: "def grade_classifier(score):\n    # Return 'A'/'B'/'C'/'D'/'F' or 'Invalid'\n    pass\n",
    hints: [
      "Check the out-of-range case first, then go from the highest grade to the lowest.",
      "Boundary scores belong to the higher grade on the tie line: 89 → 'B', 90 → 'A', 80 → 'B', 70 → 'C', 60 → 'D'."
    ],
    testCases: [
      { input: "grade_classifier(95)", expected: "'A'", internalInput: 95 },
      { input: "grade_classifier(89)", expected: "'B'", internalInput: 89 },
      { input: "grade_classifier(80)", expected: "'B'", internalInput: 80 },
      { input: "grade_classifier(70)", expected: "'C'", internalInput: 70 },
      { input: "grade_classifier(61)", expected: "'D'", internalInput: 61 },
      { input: "grade_classifier(59)", expected: "'F'", internalInput: 59 },
      { input: "grade_classifier(0)", expected: "'F'", internalInput: 0 },
      { input: "grade_classifier(101)", expected: "'Invalid'", internalInput: 101 },
      { input: "grade_classifier(-1)", expected: "'Invalid'", internalInput: -1 }
    ]
  },
  {
    id: "prob-factorial-calc",
    title: "6. Factorial Calculator",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `factorial(n)` that returns the factorial of a non-negative integer `n`, defined as `n! = n * (n-1) * ... * 2 * 1`, with `0! = 1`. Python integers never overflow, so large results are exact. Lesson: loop-based accumulation and the base case.",
    starterCode: "def factorial(n):\n    # Return n! (0! = 1)\n    pass\n",
    hints: [
      "Initialize `result = 1`, then loop `for i in range(2, n + 1): result *= i`.",
      "`range(2, n + 1)` is empty for n = 0 and n = 1, so both correctly return 1."
    ],
    testCases: [
      { input: "factorial(5)", expected: "120", internalInput: 5 },
      { input: "factorial(0)", expected: "1", internalInput: 0 },
      { input: "factorial(1)", expected: "1", internalInput: 1 },
      { input: "factorial(7)", expected: "5040", internalInput: 7 }
    ]
  },
  {
    id: "prob-sum-digits",
    title: "7. Sum of Digits",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `sum_digits(n)` that returns the sum of the decimal digits of a non-negative integer `n`. For example, `sum_digits(1234) == 10`. Lesson: extracting digits with string iteration or `%`/`//` arithmetic.",
    starterCode: "def sum_digits(n):\n    # Return the sum of the digits of n\n    pass\n",
    hints: [
      "Simplest: `sum(int(d) for d in str(n))`.",
      "Arithmetic way: repeatedly take `n % 10` and discard the last digit with `n //= 10` while `n > 0`."
    ],
    testCases: [
      { input: "sum_digits(1234)", expected: "10", internalInput: 1234 },
      { input: "sum_digits(999)", expected: "27", internalInput: 999 },
      { input: "sum_digits(0)", expected: "0", internalInput: 0 },
      { input: "sum_digits(7)", expected: "7", internalInput: 7 }
    ]
  },
  {
    id: "prob-reverse-number",
    title: "8. Reverse an Integer",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `reverse_number(n)` that returns the integer formed by reading the digits of `n` backwards. The sign must be preserved, and leading zeros that appear after reversal must be dropped (e.g. `reverse_number(1200) == 21`). Lesson: string conversion plus sign handling, and the difference between leading zeros and trailing zeros.",
    starterCode: "def reverse_number(n):\n    # Preserve sign and drop leading zeros after reversal\n    pass\n",
    hints: [
      "Convert to a string, reverse with slicing `[::-1]`, then convert back to `int` to drop leading zeros automatically.",
      "Handle the sign separately: remember it, reverse the absolute value, then reapply the sign."
    ],
    testCases: [
      { input: "reverse_number(123)", expected: "321", internalInput: 123 },
      { input: "reverse_number(-456)", expected: "-654", internalInput: -456 },
      { input: "reverse_number(1000)", expected: "1", internalInput: 1000 },
      { input: "reverse_number(0)", expected: "0", internalInput: 0 },
      { input: "reverse_number(1203400)", expected: "43021", internalInput: 1203400 }
    ]
  },
  {
    id: "prob-count-vowels",
    title: "9. Vowel Counter",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_vowels(s)` that counts how many vowels (`a, e, i, o, u`) appear in the string `s`, case-insensitively (`'A'` counts). Non-letter characters are ignored. Lesson: iterating strings and membership tests with a set.",
    starterCode: "def count_vowels(s):\n    # Count vowels case-insensitively\n    pass\n",
    hints: [
      "Use a set: `vowels = set('aeiouAEIOU')`.",
      "Count with a loop or the generator expression `sum(1 for c in s if c in vowels)`."
    ],
    testCases: [
      { input: "count_vowels('Hello World')", expected: "3", internalInput: "Hello World" },
      { input: "count_vowels('CodeLift Platform')", expected: "5", internalInput: "CodeLift Platform" },
      { input: "count_vowels('')", expected: "0", internalInput: "" },
      { input: "count_vowels('rhythm')", expected: "0", internalInput: "rhythm" },
      { input: "count_vowels('AEIOUaeiou')", expected: "10", internalInput: "AEIOUaeiou" }
    ]
  },
  {
    id: "prob-reverse-string",
    title: "10. Reverse a String",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `reverse_string(s)` that returns a new string with the characters of `s` in reverse order, preserving case. Works for empty and single-character strings too. Lesson: slicing, immutability and the fastest idiomatic Python idiom `s[::-1]`.",
    starterCode: "def reverse_string(s):\n    # Return s reversed\n    pass\n",
    hints: [
      "`s[::-1]` uses a step of -1 to read the string from right to left.",
      "A manual approach: join characters collected from `range(len(s) - 1, -1, -1)`.",
      "Empty and single-character inputs reverse trivially — no special casing needed."
    ],
    testCases: [
      { input: "reverse_string('python')", expected: "'nohtyp'", internalInput: "python" },
      { input: "reverse_string('CodeLift')", expected: "'tfiLedoC'", internalInput: "CodeLift" },
      { input: "reverse_string('')", expected: "''", internalInput: "" },
      { input: "reverse_string('a')", expected: "'a'", internalInput: "a" }
    ]
  },
  {
    id: "prob-fizzbuzz",
    title: "11. Classic FizzBuzz Generator",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `fizzbuzz(n)` that returns a list of strings for every number from 1 to `n` (inclusive), where multiples of 3 become `'Fizz'`, multiples of 5 become `'Buzz'`, multiples of both 3 and 5 become `'FizzBuzz'`, and everything else stays the number as a string. Lesson: the golden rule of FizzBuzz — test divisibility by 15 BEFORE 3 or 5.",
    starterCode: "def fizzbuzz(n):\n    # Build the 1..n FizzBuzz list\n    pass\n",
    hints: [
      "Check `i % 15 == 0` first — a number divisible by both 3 and 5 is divisible by 15.",
      "Append `str(i)` for ordinary numbers so the list contains strings only.",
      "For `n = 0` the loop `range(1, n + 1)` produces an empty list — that is correct."
    ],
    testCases: [
      { input: "fizzbuzz(5)", expected: "['1', '2', 'Fizz', '4', 'Buzz']", internalInput: 5 },
      { input: "fizzbuzz(15)[-1]", expected: "'FizzBuzz'", internalInput: 15 },
      { input: "fizzbuzz(1)", expected: "['1']", internalInput: 1 },
      { input: "fizzbuzz(3)", expected: "['1', '2', 'Fizz']", internalInput: 3 }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════
  // PHASE B — LISTS & ITERATION
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "prob-find-max",
    title: "12. Find Maximum in a List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `find_max(numbers)` that returns the maximum number in a non-empty list of integers. Ties are fine — any occurrence of the maximum is the same value. Lesson: single-pass iteration while tracking one piece of state.",
    starterCode: "def find_max(numbers):\n    # Return the largest element\n    pass\n",
    hints: [
      "Initialize a tracker with the FIRST element: `max_val = numbers[0]`.",
      "Scan the rest and update the tracker whenever a bigger value appears.",
      "Starting the tracker at 0 is a classic bug — it breaks for all-negative lists."
    ],
    testCases: [
      { input: "find_max([3, 7, 2, 9, 5])", expected: "9", internalInput: [3, 7, 2, 9, 5] },
      { input: "find_max([-10, -3, -50])", expected: "-3", internalInput: [-10, -3, -50] },
      { input: "find_max([5])", expected: "5", internalInput: [5] },
      { input: "find_max([10, 10])", expected: "10", internalInput: [10, 10] }
    ]
  },
  {
    id: "prob-sum-list",
    title: "13. Sum of All Elements in a List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `sum_list(numbers)` that returns the sum of every element in a list of numbers using an explicit loop. The empty list sums to 0. Negative elements reduce the total, zero elements are neutral. Lesson: the accumulator pattern and why starting from 0 matters.",
    starterCode: "def sum_list(numbers):\n    # Accumulate the total with a for loop\n    pass\n",
    hints: [
      "Initialize `total = 0` before the loop and add every element inside it.",
      "An empty list must return 0 — the accumulator already covers that.",
      "There is no need to special-case `len(numbers) == 1`."
    ],
    testCases: [
      { input: "sum_list([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])", expected: "55", internalInput: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { input: "sum_list([45, 12, 8])", expected: "65", internalInput: [45, 12, 8] },
      { input: "sum_list([])", expected: "0", internalInput: [] },
      { input: "sum_list([7])", expected: "7", internalInput: [7] },
      { input: "sum_list([0, -5, 10])", expected: "5", internalInput: [0, -5, 10] },
      { input: "sum_list([-1, -2, -3, -4, -5])", expected: "-15", internalInput: [-1, -2, -3, -4, -5] }
    ]
  },
  {
    id: "prob-count-evens",
    title: "14. Count Even Numbers in a List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_evens(numbers)` that returns how many elements of the list are even. Zero is even, and negative evens like `-2` count too. An empty list has zero evens. Lesson: counting inside a loop with a conditional.",
    starterCode: "def count_evens(numbers):\n    # Count elements where num % 2 == 0\n    pass\n",
    hints: [
      "Use `num % 2 == 0` — Python's modulo handles negative numbers correctly.",
      "Keep a `count = 0` and increment only when the condition holds."
    ],
    testCases: [
      { input: "count_evens([2, 5, 8, 11, 14, 17, 20, 23, 26, 29])", expected: "5", internalInput: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29] },
      { input: "count_evens([1, 3, 5])", expected: "0", internalInput: [1, 3, 5] },
      { input: "count_evens([])", expected: "0", internalInput: [] },
      { input: "count_evens([0])", expected: "1", internalInput: [0] },
      { input: "count_evens([-2, 3, -4])", expected: "2", internalInput: [-2, 3, -4] }
    ]
  },
  {
    id: "prob-count-occurrences",
    title: "15. Count Occurrences of a Value",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_occurrences(items, value)` that returns how many times `value` appears in `items`, using a loop rather than the built-in `.count()`. If `value` never appears the answer is 0. Lesson: equality comparisons and counters.",
    starterCode: "def count_occurrences(items, value):\n    # Count how many times value appears\n    pass\n",
    hints: [
      "Increment a counter every time an element equals `value` with `==`.",
      "Works for any comparable type — strings, numbers, etc."
    ],
    testCases: [
      { input: "count_occurrences([1, 2, 3, 2, 4, 2, 5], 2)", expected: "3", internalInput: [[1, 2, 3, 2, 4, 2, 5], 2] },
      { input: "count_occurrences([1, 2, 3], 9)", expected: "0", internalInput: [[1, 2, 3], 9] },
      { input: "count_occurrences([], 5)", expected: "0", internalInput: [[], 5] },
      { input: "count_occurrences([1, 1, 1, 1], 1)", expected: "4", internalInput: [[1, 1, 1, 1], 1] },
      { input: "count_occurrences(['a', 'b', 'a'], 'a')", expected: "2", internalInput: [['a', 'b', 'a'], 'a'] }
    ]
  },
  {
    id: "prob-find-index",
    title: "16. Find Index of an Element",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `find_index(items, value)` that returns the position of `value` in `items`, or `-1` if it does not appear. When the value appears more than once, return the FIRST matching index. Do NOT use the built-in `.index()` — use a loop with `enumerate`. Lesson: index tracking and early returns.",
    starterCode: "def find_index(items, value):\n    # Return first index of value, or -1 when absent\n    pass\n",
    hints: [
      "`for i, item in enumerate(items):` gives both the position and the element.",
      "Return `i` immediately on the first match; return `-1` after the loop ends."
    ],
    testCases: [
      { input: "find_index([10, 20, 30, 40], 30)", expected: "2", internalInput: [[10, 20, 30, 40], 30] },
      { input: "find_index([10, 20, 30, 40], 99)", expected: "-1", internalInput: [[10, 20, 30, 40], 99] },
      { input: "find_index([1, 2, 1], 1)", expected: "0", internalInput: [[1, 2, 1], 1] },
      { input: "find_index([], 5)", expected: "-1", internalInput: [[], 5] },
      { input: "find_index(['x', 'y'], 'y')", expected: "1", internalInput: [['x', 'y'], 'y'] }
    ]
  },
  {
    id: "prob-find-second-largest",
    title: "17. Second Largest Distinct Value",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `second_largest(numbers)` that returns the second largest DISTINCT value in the list, or `None` when fewer than two distinct values exist. For example, `second_largest([10, 10, 5])` is `5` and `second_largest([7, 7, 7])` is `None`. Lesson: tracking two pieces of state in one pass without sorting.",
    starterCode: "def second_largest(numbers):\n    # Return second largest distinct value, or None\n    pass\n",
    hints: [
      "Walk the list tracking `largest` and `second` simultaneously.",
      "Distinct handling: when a value is bigger than `largest`, the old largest becomes the second; when it is strictly between the two, update only `second`.",
      "Initialize both to `None` and update them carefully so duplicates never inflate the second."
    ],
    testCases: [
      { input: "second_largest([10, 45, 78, 23, 56])", expected: "56", internalInput: [10, 45, 78, 23, 56] },
      { input: "second_largest([5, 1, 8, 3])", expected: "5", internalInput: [5, 1, 8, 3] },
      { input: "second_largest([10, 10, 5])", expected: "5", internalInput: [10, 10, 5] },
      { input: "second_largest([7, 7, 7])", expected: "None", internalInput: [7, 7, 7] },
      { input: "second_largest([7])", expected: "None", internalInput: [7] },
      { input: "second_largest([])", expected: "None", internalInput: [] }
    ]
  },
  {
    id: "prob-is-sorted",
    title: "18. Check if a List is Sorted",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `is_sorted(numbers)` that returns `True` if the list is sorted in non-decreasing (ascending) order, meaning every element is ≤ its right neighbour. Equal neighbours are allowed. An empty or single-element list is trivially sorted. Lesson: comparing adjacent elements and deciding the answer from ANY violation.",
    starterCode: "def is_sorted(numbers):\n    # Return True if ascending (equal neighbours allowed)\n    pass\n",
    hints: [
      "Loop over `range(len(numbers) - 1)` and compare `numbers[i]` with `numbers[i + 1]`.",
      "Return `False` as soon as you find `numbers[i] > numbers[i + 1]` — no need to keep scanning after a violation.",
      "If the loop completes without a violation, return `True`."
    ],
    testCases: [
      { input: "is_sorted([1, 3, 5, 7, 9])", expected: "True", internalInput: [1, 3, 5, 7, 9] },
      { input: "is_sorted([1, 5, 2, 7, 9])", expected: "False", internalInput: [1, 5, 2, 7, 9] },
      { input: "is_sorted([])", expected: "True", internalInput: [] },
      { input: "is_sorted([3, 3, 3])", expected: "True", internalInput: [3, 3, 3] },
      { input: "is_sorted([4, 3, 2, 1])", expected: "False", internalInput: [4, 3, 2, 1] },
      { input: "is_sorted([3, 3, 4, 5, 5])", expected: "True", internalInput: [3, 3, 4, 5, 5] }
    ]
  },
  {
    id: "prob-remove-negatives",
    title: "19. Remove Negative Numbers",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `remove_negatives(numbers)` that returns a NEW list containing every non-negative element (0 and positive) in their original relative order, with all negative numbers removed. Lesson: filtering by building a new list instead of deleting in place.",
    starterCode: "def remove_negatives(numbers):\n    # Build a new list keeping num >= 0\n    pass\n",
    hints: [
      "Keep only elements where `num >= 0`.",
      "Deleting while iterating forward shifts indices and causes skipped elements — build a fresh list instead."
    ],
    testCases: [
      { input: "remove_negatives([5, -2, 8, -6, 3, -1])", expected: "[5, 8, 3]", internalInput: [5, -2, 8, -6, 3, -1] },
      { input: "remove_negatives([-1, -5, 0, 2])", expected: "[0, 2]", internalInput: [-1, -5, 0, 2] },
      { input: "remove_negatives([])", expected: "[]", internalInput: [] },
      { input: "remove_negatives([-1, -2])", expected: "[]", internalInput: [-1, -2] },
      { input: "remove_negatives([0, 0])", expected: "[0, 0]", internalInput: [0, 0] }
    ]
  },
  {
    id: "prob-squares-list",
    title: "20. Squares of 1 to n",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `squares_up_to(n)` that uses a while loop to build a list of the squares of the integers from 1 to `n` inclusive. For `n = 0` (or any `n <= 0`) the result is the empty list, and `1**2` is always the first element for `n >= 1`. Lesson: while-loop induction with a manual counter.",
    starterCode: "def squares_up_to(n):\n    # Build [1*1, 2*2, ..., n*n] with a while loop\n    pass\n",
    hints: [
      "Start `i = 1` and loop while `i <= n`, appending `i * i` each round.",
      "Remember to increment `i` inside the loop — forgetting this causes an infinite loop.",
      "The while condition naturally yields `[]` when `n < 1`."
    ],
    testCases: [
      { input: "squares_up_to(10)", expected: "[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]", internalInput: 10 },
      { input: "squares_up_to(4)", expected: "[1, 4, 9, 16]", internalInput: 4 },
      { input: "squares_up_to(0)", expected: "[]", internalInput: 0 },
      { input: "squares_up_to(1)", expected: "[1]", internalInput: 1 }
    ]
  },
  {
    id: "prob-multiply-list",
    title: "21. Multiply Each Element by a Factor",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `multiply_list(numbers, factor)` that returns a list where every element of `numbers` has been multiplied by `factor`. The factor can be negative or zero — the empty list maps to itself. Lesson: list transformation via a mapping loop.",
    starterCode: "def multiply_list(numbers, factor):\n    # Return [num * factor for each num]\n    pass\n",
    hints: [
      "Build a fresh result: `result.append(num * factor)`.",
      "A list comprehension `[n * factor for n in numbers]` is the idiomatic one-liner."
    ],
    testCases: [
      { input: "multiply_list([1, 2, 3, 4], 2)", expected: "[2, 4, 6, 8]", internalInput: [[1, 2, 3, 4], 2] },
      { input: "multiply_list([3, 5], 10)", expected: "[30, 50]", internalInput: [[3, 5], 10] },
      { input: "multiply_list([], 3)", expected: "[]", internalInput: [[], 3] },
      { input: "multiply_list([0, 1], 0)", expected: "[0, 0]", internalInput: [[0, 1], 0] },
      { input: "multiply_list([-2, 3], -1)", expected: "[2, -3]", internalInput: [[-2, 3], -1] }
    ]
  },
  {
    id: "prob-swap-ends",
    title: "22. Swap First and Last Elements",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `swap_ends(items)` that returns the list with the first and last elements swapped in place. Lists with fewer than two elements are returned unchanged. Lesson: tuple assignment and negative indexing.",
    starterCode: "def swap_ends(items):\n    # Swap items[0] and items[-1] in place\n    pass\n",
    hints: [
      "`items[0], items[-1] = items[-1], items[0]` swaps without a temporary variable.",
      "For length < 2 the swap touches the same element — the list stays unchanged naturally."
    ],
    testCases: [
      { input: "swap_ends([10, 20, 30, 40, 50])", expected: "[50, 20, 30, 40, 10]", internalInput: [10, 20, 30, 40, 50] },
      { input: "swap_ends([1, 2])", expected: "[2, 1]", internalInput: [1, 2] },
      { input: "swap_ends([9])", expected: "[9]", internalInput: [9] },
      { input: "swap_ends([])", expected: "[]", internalInput: [] }
    ]
  },
  {
    id: "prob-rotate-left",
    title: "23. Rotate List Left by One",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `rotate_left(numbers)` that rotates the list left by exactly one position: the first element moves to the end and every other element shifts one spot towards the front. Lists of length 0 or 1 are unchanged. Lesson: manual shifting with a while loop.",
    starterCode: "def rotate_left(numbers):\n    # Move first element to the end, shift the rest left\n    pass\n",
    hints: [
      "Save the first element, then shift `numbers[i] = numbers[i + 1]` from front to back, then place the saved element at the end.",
      "Walk indices with a while loop from 0 to `len(numbers) - 2`.",
      "Guard the length-1 case so the shift loop does not index out of range."
    ],
    testCases: [
      { input: "rotate_left([1, 2, 3, 4, 5])", expected: "[2, 3, 4, 5, 1]", internalInput: [1, 2, 3, 4, 5] },
      { input: "rotate_left([8, 9])", expected: "[9, 8]", internalInput: [8, 9] },
      { input: "rotate_left([])", expected: "[]", internalInput: [] },
      { input: "rotate_left([7])", expected: "[7]", internalInput: [7] }
    ]
  },
  {
    id: "prob-reverse-list",
    title: "24. Reverse a List Without reverse()",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `reverse_list(items)` that uses a while loop to build a NEW list containing the elements in reverse order. You may NOT use `reverse()`, `reversed()`, or slicing `[::-1]`. Lesson: reverse traversal with a descending index.",
    starterCode: "def reverse_list(items):\n    # Build the reversed list using a while loop\n    pass\n",
    hints: [
      "Start an index at `len(items) - 1` and decrement while it is >= 0, appending each visited element.",
      "Empty and single-element lists reverse to themselves — the loop handles them naturally."
    ],
    testCases: [
      { input: "reverse_list([10, 20, 30, 40, 50])", expected: "[50, 40, 30, 20, 10]", internalInput: [10, 20, 30, 40, 50] },
      { input: "reverse_list([1, 2, 3])", expected: "[3, 2, 1]", internalInput: [1, 2, 3] },
      { input: "reverse_list([])", expected: "[]", internalInput: [] },
      { input: "reverse_list([5])", expected: "[5]", internalInput: [5] },
      { input: "reverse_list([1, 1, 2])", expected: "[2, 1, 1]", internalInput: [1, 1, 2] }
    ]
  },
  {
    id: "prob-remove-all-occurrences",
    title: "25. Remove All Occurrences of a Value",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `remove_value(numbers, value)` that returns a list with EVERY occurrence of `value` removed, preserving the relative order of the remaining elements. If `value` never appears, the list is returned unchanged. Lesson: safe removal — either build a fresh list or iterate backwards while deleting.",
    starterCode: "def remove_value(numbers, value):\n    # Return list with every occurrence of value removed\n    pass\n",
    hints: [
      "Easiest correct approach: build a new list keeping only elements that do not equal `value`.",
      "If you delete in place with `list.remove()`, loop `while value in numbers:` — O(N^2) but correct.",
      "If you delete by index, iterate from the END towards the front so shifting indices never skip an element."
    ],
    testCases: [
      { input: "remove_value([1, 2, 3, 2, 4, 2, 5], 2)", expected: "[1, 3, 4, 5]", internalInput: [[1, 2, 3, 2, 4, 2, 5], 2] },
      { input: "remove_value([7, 7, 7], 7)", expected: "[]", internalInput: [[7, 7, 7], 7] },
      { input: "remove_value([], 3)", expected: "[]", internalInput: [[], 3] },
      { input: "remove_value([1, 2, 3], 9)", expected: "[1, 2, 3]", internalInput: [[1, 2, 3], 9] },
      { input: "remove_value(['a', 'b', 'a'], 'a')", expected: "['b']", internalInput: [['a', 'b', 'a'], 'a'] }
    ]
  },
  {
    id: "prob-split-odd-even",
    title: "26. Split List into Odd and Even",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `split_odd_even(numbers)` that separates numbers into evens and odds and returns them as `[evens, odds]` — a two-element list of lists. Zero is even. Relative order inside each group is preserved. Lesson: partitioning into buckets.",
    starterCode: "def split_odd_even(numbers):\n    # Return [evens, odds]\n    pass\n",
    hints: [
      "Build two lists and append to the correct one for each number using `% 2`.",
      "Remember the return shape is a LIST OF TWO LISTS — `[evens, odds]`.",
      "The empty list partitions to `[[], []]`."
    ],
    testCases: [
      { input: "split_odd_even([1, 2, 3, 4, 5, 6, 7, 8, 9])", expected: "[[2, 4, 6, 8], [1, 3, 5, 7, 9]]", internalInput: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { input: "split_odd_even([4, 7])", expected: "[[4], [7]]", internalInput: [4, 7] },
      { input: "split_odd_even([])", expected: "[[], []]", internalInput: [] },
      { input: "split_odd_even([0])", expected: "[[0], []]", internalInput: [0] },
      { input: "split_odd_even([-1, -2, -3])", expected: "[[-2], [-1, -3]]", internalInput: [-1, -2, -3] }
    ]
  },
  {
    id: "prob-sum-digits-list",
    title: "27. Sum of Digits of All Numbers",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `sum_digits_list(numbers)` that returns a NEW list where each element is the sum of the digits of the corresponding element of `numbers`. For example, `[12, 34, 56]` becomes `[3, 7, 11]`. Zero has digit-sum 0. Lesson: nested loops — one over the list and one over the digits.",
    starterCode: "def sum_digits_list(numbers):\n    # Return [digit-sum per element]\n    pass\n",
    hints: [
      "For each number, total its digits using `% 10` and `// 10` in an inner while loop.",
      "`str()` conversion inside a comprehension also works: `[sum(int(d) for d in str(n)) for n in numbers]`."
    ],
    testCases: [
      { input: "sum_digits_list([12, 34, 56])", expected: "[3, 7, 11]", internalInput: [12, 34, 56] },
      { input: "sum_digits_list([123, 5])", expected: "[6, 5]", internalInput: [123, 5] },
      { input: "sum_digits_list([])", expected: "[]", internalInput: [] },
      { input: "sum_digits_list([0, 100])", expected: "[0, 1]", internalInput: [0, 100] }
    ]
  },
  {
    id: "prob-merge-unique",
    title: "28. Merge Two Lists Without Duplicates",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `merge_unique(list_a, list_b)` that combines every element from `list_a` followed by every element of `list_b` into a single list containing no duplicates. The FIRST occurrence of every value wins its position. Lesson: deduplication with a seen-set while preserving order.",
    starterCode: "def merge_unique(list_a, list_b):\n    # Merge both lists, dropping later duplicates\n    pass\n",
    hints: [
      "Keep a `seen = set()` and a result list; append only items not already in `seen`.",
      "Iterate `list_a` first, then `list_b` — order of first occurrence determines the result."
    ],
    testCases: [
      { input: "merge_unique([1, 3, 5, 7, 9], [3, 6, 7, 9, 12])", expected: "[1, 3, 5, 7, 9, 6, 12]", internalInput: [[1, 3, 5, 7, 9], [3, 6, 7, 9, 12]] },
      { input: "merge_unique([1, 2], [2, 3])", expected: "[1, 2, 3]", internalInput: [[1, 2], [2, 3]] },
      { input: "merge_unique([], [])", expected: "[]", internalInput: [[], []] },
      { input: "merge_unique([1], [1])", expected: "[1]", internalInput: [[1], [1]] },
      { input: "merge_unique(['a'], ['b'])", expected: "['a', 'b']", internalInput: [['a'], ['b']] }
    ]
  },
  {
    id: "prob-longest-word",
    title: "29. Longest Word in a Sentence",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `longest_word(sentence)` that splits the sentence on spaces with `.split()` and returns the LONGEST word. When several words tie for the longest length, return the FIRST one encountered. An empty sentence returns an empty string. Lesson: splitting text and tie-breaking.",
    starterCode: "def longest_word(sentence):\n    # Split and return the first longest word\n    pass\n",
    hints: [
      "`words = sentence.split()` returns the word list.",
      "Track the longest word seen so far with `len()` and only replace it when a STRICTLY longer word appears — this keeps the first one on ties."
    ],
    testCases: [
      { input: "longest_word('Python is a powerful language')", expected: "'powerful'", internalInput: "Python is a powerful language" },
      { input: "longest_word('I love code')", expected: "'love'", internalInput: "I love code" },
      { input: "longest_word('')", expected: "''", internalInput: "" },
      { input: "longest_word('single')", expected: "'single'", internalInput: "single" },
      { input: "longest_word('ab cd ef')", expected: "'ab'", internalInput: "ab cd ef" }
    ]
  },
  {
    id: "prob-avg-above-threshold",
    title: "30. Average Above a Threshold",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `avg_above_threshold(numbers, threshold)` that returns the average (a float) of all elements strictly greater than `threshold`. If no element qualifies, return `0` (an integer). Empty input also returns `0`. Lesson: conditional aggregation and floating-point division.",
    starterCode: "def avg_above_threshold(numbers, threshold):\n    # Return mean of numbers > threshold, or 0\n    pass\n",
    hints: [
      "Accumulate a running `total` and a `count` of qualifying elements only.",
      "Divide with true division `total / count` so the result is a float like `40.0`.",
      "Guard `count == 0` BEFORE dividing — division by zero raises."
    ],
    testCases: [
      { input: "avg_above_threshold([10, 20, 30, 40, 50], 25)", expected: "40.0", internalInput: [[10, 20, 30, 40, 50], 25] },
      { input: "avg_above_threshold([5, 15, 8], 10)", expected: "15.0", internalInput: [[5, 15, 8], 10] },
      { input: "avg_above_threshold([], 5)", expected: "0", internalInput: [[], 5] },
      { input: "avg_above_threshold([1, 2, 3], 10)", expected: "0", internalInput: [[1, 2, 3], 10] },
      { input: "avg_above_threshold([40, 50], 45)", expected: "50.0", internalInput: [[40, 50], 45] },
      { input: "avg_above_threshold([5, 6], 4)", expected: "5.5", internalInput: [[5, 6], 4] }
    ]
  },
  {
    id: "prob-list-deduplicate",
    title: "31. Deduplicate List Preserving Order",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `remove_duplicates(items)` that returns a list with all duplicates removed while keeping the FIRST occurrence order. For example, `[1, 2, 2, 3, 4, 3, 1]` becomes `[1, 2, 3, 4]`. Lesson: the classic seen-set idiom.",
    starterCode: "def remove_duplicates(items):\n    # Drop later duplicates, keep first-occurrence order\n    pass\n",
    hints: [
      "Use `seen = set()` and only append elements not already in it.",
      "Sets have O(1) membership checks, so the whole pass stays linear."
    ],
    testCases: [
      { input: "remove_duplicates([1, 2, 2, 3, 4, 3, 1])", expected: "[1, 2, 3, 4]", internalInput: [1, 2, 2, 3, 4, 3, 1] },
      { input: "remove_duplicates([])", expected: "[]", internalInput: [] },
      { input: "remove_duplicates([5, 5, 5, 5])", expected: "[5]", internalInput: [5, 5, 5, 5] },
      { input: "remove_duplicates(['a', 'b', 'a'])", expected: "['a', 'b']", internalInput: ['a', 'b', 'a'] }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════
  // PHASE C — STRINGS, DICTS & CLASSIC PATTERNS
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "prob-palindrome-number",
    title: "32. Palindrome Number (Loop, No Strings)",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `is_palindrome_number(num)` that returns `True` when `num` is a palindrome — it reads the same forwards and backwards. You may NOT convert to a string; use arithmetic only. Every negative number is `False` (the minus sign would only appear at the front). Zero is `True`. Lesson: reversing a number digit by digit.",
    starterCode: "def is_palindrome_number(num):\n    # Check palindrome using only arithmetic\n    pass\n",
    hints: [
      "Negative numbers are never palindromes — return `False` immediately.",
      "Reverse `num` by peeling off the last digit with `% 10` and re-shaping it with `rev = rev * 10 + digit`.",
      "Compare the rebuilt reverse with the original value.",
      "Careful: 121 reversed is 121, but 1210 reversed is 121 — so the comparison must be numeric equality, not string equality."
    ],
    testCases: [
      { input: "is_palindrome_number(121)", expected: "True", internalInput: 121 },
      { input: "is_palindrome_number(12345)", expected: "False", internalInput: 12345 },
      { input: "is_palindrome_number(0)", expected: "True", internalInput: 0 },
      { input: "is_palindrome_number(-121)", expected: "False", internalInput: -121 },
      { input: "is_palindrome_number(7)", expected: "True", internalInput: 7 },
      { input: "is_palindrome_number(123321)", expected: "True", internalInput: 123321 }
    ]
  },
  {
    id: "prob-palindrome-check",
    title: "33. Palindrome String Check",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `is_palindrome(text)` that returns `True` when `text` reads the same forwards and backwards. An empty string is a palindrome, and case matters (`'Aa'` is NOT a palindrome). No spaces are removed — treat the string literally. Lesson: comparing a sequence with its reverse and the classic two-pointer idea.",
    starterCode: "def is_palindrome(text):\n    # Return True if text reads the same both ways\n    pass\n",
    hints: [
      "Slicing comparison `text == text[::-1]` is concise and correct.",
      "Or use two pointers: compare `text[left]` and `text[right]`, moving inward while `left < right`."
    ],
    testCases: [
      { input: "is_palindrome('radar')", expected: "True", internalInput: "radar" },
      { input: "is_palindrome('hello')", expected: "False", internalInput: "hello" },
      { input: "is_palindrome('')", expected: "True", internalInput: "" },
      { input: "is_palindrome('a')", expected: "True", internalInput: "a" },
      { input: "is_palindrome('Aa')", expected: "False", internalInput: "Aa" },
      { input: "is_palindrome('step on no pets')", expected: "True", internalInput: "step on no pets" },
      { input: "is_palindrome('12321')", expected: "True", internalInput: "12321" }
    ]
  },
  {
    id: "prob-anagram-check",
    title: "34. Anagram Checker",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `is_anagram(word_a, word_b)` that returns `True` when the two words contain exactly the same characters with exactly the same frequencies (anagrams). Comparison is case-sensitive and includes spaces, so `'listen'` and `'silent'` are anagrams but `'Listen'` is not one of them. Different lengths can never be anagrams. Lesson: counting characters with a dictionary.",
    starterCode: "def is_anagram(word_a, word_b):\n    # Return True if char frequencies match exactly\n    pass\n",
    hints: [
      "Sorting trick: `sorted(word_a) == sorted(word_b)`.",
      "Or count characters into two dicts and compare them.",
      "A quick negative check: `len(word_a) != len(word_b)` can never be anagrams."
    ],
    testCases: [
      { input: "is_anagram('listen', 'silent')", expected: "True", internalInput: ['listen', 'silent'] },
      { input: "is_anagram('listens', 'silent')", expected: "False", internalInput: ['listens', 'silent'] },
      { input: "is_anagram('', '')", expected: "True", internalInput: ['', ''] },
      { input: "is_anagram('Listen', 'silent')", expected: "False", internalInput: ['Listen', 'silent'] },
      { input: "is_anagram('car', 'rat')", expected: "False", internalInput: ['car', 'rat'] },
      { input: "is_anagram('aabb', 'abab')", expected: "True", internalInput: ['aabb', 'abab'] }
    ]
  },
  {
    id: "prob-char-frequency",
    title: "35. Character Frequency Counter",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `char_frequency(text)` that returns a dictionary mapping each character (keys in order of first appearance) to how many times it occurs in `text`. An empty string yields an empty dict. Lesson: building a frequency dictionary idiomatically.",
    starterCode: "def char_frequency(text):\n    # Return {char: count} in first-appearance order\n    pass\n",
    hints: [
      "Use `freq = {}` and the pattern `freq[ch] = freq.get(ch, 0) + 1` per character.",
      "Python dicts preserve insertion order, so first-appearance order comes for free."
    ],
    testCases: [
      { input: "char_frequency('abracadabra')", expected: "{'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1}", internalInput: "abracadabra" },
      { input: "char_frequency('')", expected: "{}", internalInput: "" },
      { input: "char_frequency('aaa')", expected: "{'a': 3}", internalInput: "aaa" },
      { input: "char_frequency('mississippi')", expected: "{'m': 1, 'i': 4, 's': 4, 'p': 2}", internalInput: "mississippi" },
      { input: "char_frequency('hello world')", expected: "{'h': 1, 'e': 1, 'l': 3, 'o': 2, ' ': 1, 'w': 1, 'r': 1, 'd': 1}", internalInput: "hello world" }
    ]
  },
  {
    id: "prob-string-compression",
    title: "36. Run-Length String Compression",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `compress_string(text)` that performs run-length encoding: consecutive runs of the same character are replaced by that character followed by the run COUNT (as a digit string). Example: `'aabcccccaaa'` becomes `'a2b1c5a3'`. An empty string stays empty. Lesson: the two-pointer / anchor technique for scanning runs.",
    starterCode: "def compress_string(text):\n    # Run-length encode: 'aabcccccaaa' -> 'a2b1c5a3'\n    pass\n",
    hints: [
      "Walk the string with a while loop; for each run, count how many equal characters follow.",
      "Append `char` and `str(run_length)` for every run — identical characters in separate runs must each appear.",
      "Single-occurrence characters still get the `1`: `'ab'` compresses to `'a1b1'`.",
      "The empty-string base case returns `''` without touching the loop."
    ],
    testCases: [
      { input: "compress_string('aabcccccaaa')", expected: "'a2b1c5a3'", internalInput: "aabcccccaaa" },
      { input: "compress_string('ab')", expected: "'a1b1'", internalInput: "ab" },
      { input: "compress_string('')", expected: "''", internalInput: "" },
      { input: "compress_string('a')", expected: "'a1'", internalInput: "a" },
      { input: "compress_string('zzzz')", expected: "'z4'", internalInput: "zzzz" },
      { input: "compress_string('aba')", expected: "'a1b1a1'", internalInput: "aba" }
    ]
  },
  {
    id: "prob-flatten-nested-list",
    title: "37. Flatten a Nested List",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `flatten(nested)` that returns a flat list of all the numbers contained in the nested list, iterating depth-first. The nested list uses nested Python lists — like `[[1, [2, 3]], [4], 5]`. Only numbers are leaves; there are no other container types. Lesson: recursion on a recursive data structure.",
    starterCode: "def flatten(nested):\n    # Flatten arbitrarily nested lists into one list\n    pass\n",
    hints: [
      "For each element: if it is a list, recurse into it and extend your result; otherwise append it.",
      "Use `isinstance(item, list)` for the check.",
      "Sketch a small example on paper first — `[[1, 2], [3, [4]]]` should give `[1, 2, 3, 4]`."
    ],
    testCases: [
      { input: "flatten([[1, 2], [3], [4, 5]])", expected: "[1, 2, 3, 4, 5]", internalInput: [[1, 2], [3], [4, 5]] },
      { input: "flatten([[1, [2, 3]], [4], 5])", expected: "[1, 2, 3, 4, 5]", internalInput: [[1, [2, 3]], [4], 5] },
      { input: "flatten([])", expected: "[]", internalInput: [] },
      { input: "flatten([1, 2, 3])", expected: "[1, 2, 3]", internalInput: [1, 2, 3] },
      { input: "flatten([[[]]])", expected: "[]", internalInput: [[[]]] },
      { input: "flatten([[[1], 2], [3, [4]]])", expected: "[1, 2, 3, 4]", internalInput: [[[1], 2], [3, [4]]] }
    ]
  },
  {
    id: "prob-two-sum",
    title: "38. Two Sum",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `two_sum(numbers, target)` that returns the indices (a two-element list) of the two numbers that add up to `target`. Assume exactly one solution exists. You may not use the same element twice, so `two_sum([3, 3], 6)` is `[0, 1]`, and `two_sum([5, 2, 3], 8)` returns `[0, 2]` since `5 + 3 = 8`. Order the indices from smallest to largest. Lesson: the complement map — the classic dictionary-powered O(n) technique.",
    starterCode: "def two_sum(numbers, target):\n    # Return indices of the pair summing to target\n    pass\n",
    hints: [
      "For each number, its required partner is `target - num` — the complement.",
      "Store `{number: index}` in a dict as you scan, and check whether the complement was already seen.",
      "The complement check must use a value stored BEFORE the current index, so you never pair an element with itself.",
      "Return `[index_of_complement, current_index]`, sorted ascending."
    ],
    testCases: [
      { input: "two_sum([2, 7, 11, 15], 9)", expected: "[0, 1]", internalInput: [[2, 7, 11, 15], 9] },
      { input: "two_sum([5, 2, 3], 8)", expected: "[0, 2]", internalInput: [[5, 2, 3], 8] },
      { input: "two_sum([3, 3], 6)", expected: "[0, 1]", internalInput: [[3, 3], 6] },
      { input: "two_sum([1, 2, 3], 5)", expected: "[1, 2]", internalInput: [[1, 2, 3], 5] },
      { input: "two_sum([4], 8)", expected: "None", internalInput: [[4], 8] }
    ]
  },
  {
    id: "prob-valid-parentheses",
    title: "39. Valid Parentheses",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `is_valid_parentheses(s)` that returns `True` when the string contains only properly balanced and correctly NESTED brackets from the set `()`, `[]`, `{}`. An empty string is valid. `'(]'` and `'([)]'` are invalid because of wrong nesting; `'()[]{}'` is valid. Lesson: the stack pattern — the foundation of parsing.",
    starterCode: "def is_valid_parentheses(s):\n    # Balanced and correctly nested brackets?\n    pass\n",
    hints: [
      "Push every opening bracket onto a stack; pop and verify against every closing bracket.",
      "Use a dict `{')': '(', ']': '[', '}': '{'}` so the check is a lookup.",
      "Mismatched close or leftover stack at the end both mean `False`.",
      "An odd-length string can never be valid."
    ],
    testCases: [
      { input: "is_valid_parentheses('()[]{}')", expected: "True", internalInput: "()[]{}" },
      { input: "is_valid_parentheses('([{}])')", expected: "True", internalInput: "([{}])" },
      { input: "is_valid_parentheses('(]')", expected: "False", internalInput: "(]" },
      { input: "is_valid_parentheses('([)]')", expected: "False", internalInput: "([)]" },
      { input: "is_valid_parentheses('')", expected: "True", internalInput: "" },
      { input: "is_valid_parentheses('(')", expected: "False", internalInput: "(" },
      { input: "is_valid_parentheses(']')", expected: "False", internalInput: "]" }
    ]
  },
  {
    id: "prob-move-zeroes",
    title: "40. Move Zeroes to the End",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `move_zeroes(numbers)` that moves ALL zeroes to the end while keeping every non-zero element in its original relative order. Zeros at the start or in the middle must all be pushed past the non-zero values. The operation happens in place on the list (you may return it too). All-zero or zero-free lists are unchanged. Lesson: the partition / two-pointer pattern.",
    starterCode: "def move_zeroes(numbers):\n    # Push zeroes to the end while keeping relative order\n    pass\n",
    hints: [
      "Keep a `next_nonzero = 0` pointer; whenever you find a non-zero, swap it into that slot and advance the pointer.",
      "Swapping — not pushing — is the trick that preserves the order of the non-zero values.",
      "Test mentally with `[0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`."
    ],
    testCases: [
      { input: "move_zeroes([0, 1, 0, 3, 12])", expected: "[1, 3, 12, 0, 0]", internalInput: [0, 1, 0, 3, 12] },
      { input: "move_zeroes([0, 0, 0, 5, 6])", expected: "[5, 6, 0, 0, 0]", internalInput: [0, 0, 0, 5, 6] },
      { input: "move_zeroes([])", expected: "[]", internalInput: [] },
      { input: "move_zeroes([0, 0, 0])", expected: "[0, 0, 0]", internalInput: [0, 0, 0] },
      { input: "move_zeroes([1, 2, 3])", expected: "[1, 2, 3]", internalInput: [1, 2, 3] },
      { input: "move_zeroes([1, 0, 2, 0, 3])", expected: "[1, 2, 3, 0, 0]", internalInput: [1, 0, 2, 0, 3] }
    ]
  },
  {
    id: "prob-longest-common-prefix",
    title: "41. Longest Common Prefix",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `longest_common_prefix(strings)` that returns the longest string which is a PREFIX of every word in the list. If no common prefix exists, return an empty string. An empty list returns an empty string. Lesson: vertical character comparison across strings.",
    starterCode: "def longest_common_prefix(strings):\n    # Longest string that prefixes every word, or ''\n    pass\n",
    hints: [
      "Compare character by character across every word at each position until they disagree.",
      "Stop early when you reach the end of the shortest word.",
      "You can compare against the FIRST word as the base and shrink it: `prefix = prefix[:len(prefix) - 1]`."
    ],
    testCases: [
      { input: "longest_common_prefix(['flower', 'flow', 'flight'])", expected: "'fl'", internalInput: ['flower', 'flow', 'flight'] },
      { input: "longest_common_prefix(['dog', 'racecar', 'car'])", expected: "''", internalInput: ['dog', 'racecar', 'car'] },
      { input: "longest_common_prefix(['interspecies', 'interstellar', 'interstate'])", expected: "'inters'", internalInput: ['interspecies', 'interstellar', 'interstate'] },
      { input: "longest_common_prefix(['same'])", expected: "'same'", internalInput: ['same'] },
      { input: "longest_common_prefix([])", expected: "''", internalInput: [] },
      { input: "longest_common_prefix(['abc', 'abc'])", expected: "'abc'", internalInput: ['abc', 'abc'] }
    ]
  },
  {
    id: "prob-group-anagrams",
    title: "42. Group Anagrams",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `group_anagrams(words)` that groups words into a list of groups, where every member of a group is an anagram of the others. The order of groups may vary, but each group keeps its words in the order they first appear. Comparison is case-sensitive. Lesson: using a canonical key (sorted letters) to bucket anagrams.",
    starterCode: "def group_anagrams(words):\n    # Return list of anagram groups, preserving word order\n    pass\n",
    hints: [
      "The sorted character tuple `tuple(sorted(word))` is the canonical key for all anagrams of `word`.",
      "Use a dict keyed by that canonical key accumulating word lists.",
      "Return `list(dict.values())` — in Python 3.7+ dict order follows first-insertion order."
    ],
    testCases: [
      { input: "group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])", expected: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]", internalInput: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
      { input: "group_anagrams(['abc', 'cab', 'abc'])", expected: "[['abc', 'cab', 'abc']]", internalInput: ['abc', 'cab', 'abc'] },
      { input: "group_anagrams([])", expected: "[]", internalInput: [] },
      { input: "group_anagrams(['a'])", expected: "[['a']]", internalInput: ['a'] },
      { input: "group_anagrams(['Ab', 'bA', 'ba'])", expected: "[['Ab', 'bA'], ['ba']]", internalInput: ['Ab', 'bA', 'ba'] }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════
  // PHASE D — ALGORITHMS & OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "prob-merge-sorted-lists",
    title: "43. Merge Two Sorted Lists",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `merge_sorted(list_a, list_b)` that merges two ALREADY sorted lists (each ascending, values may repeat) into one ascending list containing every element. Use a two-pointer merge — do NOT call `.sort()` and do NOT concatenate then sort. Lesson: the merge step of merge sort, O(n + m).",
    starterCode: "def merge_sorted(list_a, list_b):\n    # Merge two sorted lists into one sorted list\n    pass\n",
    hints: [
      "Walk both lists with two indices and always append the smaller current element.",
      "When one list runs out, extend the result with the remainder of the other.",
      "Handle the empty-list edge: merging `[]` with anything returns that other list."
    ],
    testCases: [
      { input: "merge_sorted([1, 3, 5, 7, 9], [2, 4, 6, 8, 10])", expected: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", internalInput: [[1, 3, 5, 7, 9], [2, 4, 6, 8, 10]] },
      { input: "merge_sorted([1, 2, 3], [])", expected: "[1, 2, 3]", internalInput: [[1, 2, 3], []] },
      { input: "merge_sorted([], [4, 5])", expected: "[4, 5]", internalInput: [[], [4, 5]] },
      { input: "merge_sorted([], [])", expected: "[]", internalInput: [[], []] },
      { input: "merge_sorted([1, 3, 3, 5], [3, 4])", expected: "[1, 3, 3, 3, 4, 5]", internalInput: [[1, 3, 3, 5], [3, 4]] },
      { input: "merge_sorted([2], [1])", expected: "[1, 2]", internalInput: [[2], [1]] }
    ]
  },
  {
    id: "prob-binary-search",
    title: "44. Binary Search",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `binary_search(numbers, target)` that finds `target` in a SORTED ascending list and returns its index — or `-1` if it is absent. Your solution must run in O(log n) by repeatedly halving the search range. Lesson: the single most important divide-and-conquer algorithm; watch the classic off-by-one and overflow-friendly midpoint.",
    starterCode: "def binary_search(numbers, target):\n    # Find index of target in sorted list, else -1\n    pass\n",
    hints: [
      "Maintain `low` and `high` inclusive bounds; loop while `low <= high`.",
      "Take `mid = (low + high) // 2` and compare `numbers[mid]` with the target.",
      "Too small → search right half (`low = mid + 1`); too big → left half (`high = mid - 1`).",
      "Return `-1` when the loop ends without a match — the classic linear-fallback mistake is O(n); the whole point is the halving."
    ],
    testCases: [
      { input: "binary_search([1, 3, 5, 7, 9, 11, 13], 7)", expected: "3", internalInput: [[1, 3, 5, 7, 9, 11, 13], 7] },
      { input: "binary_search([2, 4, 6], 5)", expected: "-1", internalInput: [[2, 4, 6], 5] },
      { input: "binary_search([1], 1)", expected: "0", internalInput: [[1], 1] },
      { input: "binary_search([1], 2)", expected: "-1", internalInput: [[1], 2] },
      { input: "binary_search([1, 3, 5, 7, 9, 11, 13], 1)", expected: "0", internalInput: [[1, 3, 5, 7, 9, 11, 13], 1] },
      { input: "binary_search([1, 3, 5, 7, 9, 11, 13], 13)", expected: "6", internalInput: [[1, 3, 5, 7, 9, 11, 13], 13] },
      { input: "binary_search([1, 4, 4], 4)", expected: "1", internalInput: [[1, 4, 4], 4] }
    ]
  },
  {
    id: "prob-climbing-stairs",
    title: "45. Climbing Stairs",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `climb_stairs(n)` that returns how many DISTINCT ways there are to climb a staircase of `n` steps when each move covers either 1 or 2 steps. For 2 steps there are 2 ways (1+1 or 2). Lesson: dynamic programming — the answer is the Fibonacci sequence in disguise.",
    starterCode: "def climb_stairs(n):\n    # Ways to reach step n using 1- or 2-step moves\n    pass\n",
    hints: [
      "The last move is either one step (from `n-1`) or two steps (from `n-2`), so `ways(n) = ways(n-1) + ways(n-2)`.",
      "Base cases: `ways(1) = 1`, `ways(2) = 2`.",
      "Build bottom-up with two running variables to stay O(1) space."
    ],
    testCases: [
      { input: "climb_stairs(1)", expected: "1", internalInput: 1 },
      { input: "climb_stairs(2)", expected: "2", internalInput: 2 },
      { input: "climb_stairs(3)", expected: "3", internalInput: 3 },
      { input: "climb_stairs(5)", expected: "8", internalInput: 5 },
      { input: "climb_stairs(10)", expected: "89", internalInput: 10 }
    ]
  },
  {
    id: "prob-fibonacci-memo",
    title: "46. Memoized Fibonacci",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `fibonacci(n)` that returns the `n`-th Fibonacci number where `fib(0) = 0`, `fib(1) = 1`, and each following value is the sum of the two previous ones. Implement it with memoization (a cache) so values scale to at least `fib(30)`. Lesson: the memoization pattern that turns exponential recursion into linear work.",
    starterCode: "def fibonacci(n):\n    # Return nth Fibonacci (fib(0)=0, fib(1)=1) with memoization\n    pass\n",
    hints: [
      "Use a dict cache mapping `n -> fib(n)` that you consult before recursing.",
      "Plain recursion without memo recomputes the same subproblems exponentially — that is the lesson.",
      "`fib(30)` must be 832040, which naive recursion will still compute but slowly; memo makes it trivial."
    ],
    testCases: [
      { input: "fibonacci(0)", expected: "0", internalInput: 0 },
      { input: "fibonacci(1)", expected: "1", internalInput: 1 },
      { input: "fibonacci(10)", expected: "55", internalInput: 10 },
      { input: "fibonacci(20)", expected: "6765", internalInput: 20 },
      { input: "fibonacci(30)", expected: "832040", internalInput: 30 }
    ]
  },
  {
    id: "prob-pascals-triangle",
    title: "47. Pascal's Triangle Generator",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `pascals_triangle(rows)` that returns the first `rows` rows of Pascal's triangle as a list of lists. Each row starts and ends with 1; every interior cell is the sum of the two numbers directly above it. The first row is `[1]`. For `rows = 0` return an empty list. Lesson: building a result where later rows depend on earlier ones.",
    starterCode: "def pascals_triangle(rows):\n    # Return list of first `rows` Pascal rows\n    pass\n",
    hints: [
      "Start with `triangle = [[1]]` and grow it row by row up to `rows`.",
      "For building a new row, use the previous row: edge slots get 1, interior slot `j` gets `prev[j-1] + prev[j]`.",
      "Worst-case bug: reusing the same inner list object multiple times — always construct a NEW list per row."
    ],
    testCases: [
      { input: "pascals_triangle(1)", expected: "[[1]]", internalInput: 1 },
      { input: "pascals_triangle(2)", expected: "[[1], [1, 1]]", internalInput: 2 },
      { input: "pascals_triangle(5)", expected: "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]", internalInput: 5 },
      { input: "pascals_triangle(0)", expected: "[]", internalInput: 0 },
      { input: "pascals_triangle(3)", expected: "[[1], [1, 1], [1, 2, 1]]", internalInput: 3 }
    ]
  },
  {
    id: "prob-max-subarray-sum",
    title: "48. Maximum Subarray Sum (Kadane's)",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `max_subarray_sum(numbers)` that returns the sum of the CONTIGUOUS subarray with the largest sum. A subarray is one or more consecutive elements. Result must be at least the single largest element even when all values are negative. Lesson: Kadane's algorithm — the optimum often hidden behind negative prefixes.",
    starterCode: "def max_subarray_sum(numbers):\n    # Max sum of any contiguous slice\n    pass\n",
    hints: [
      "Keep `current` (best sum ending here) and `best` (best sum seen anywhere).",
      "For each `num`, `current = max(num, current + num)` — restart the window when adding it hurts.",
      "`best = max(best, current)` after each update.",
      "The all-negative case naturally degrades to the largest single element."
    ],
    testCases: [
      { input: "max_subarray_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4])", expected: "6", internalInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
      { input: "max_subarray_sum([1])", expected: "1", internalInput: [1] },
      { input: "max_subarray_sum([5, 4, -1, 7, 8])", expected: "23", internalInput: [5, 4, -1, 7, 8] },
      { input: "max_subarray_sum([-1])", expected: "-1", internalInput: [-1] },
      { input: "max_subarray_sum([-2, -3, -1])", expected: "-1", internalInput: [-2, -3, -1] }
    ]
  },
  {
    id: "prob-kth-largest",
    title: "49. Kth Largest Element",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `kth_largest(numbers, k)` that returns the `k`-th LARGEST element when the list is sorted descending, with duplicate values counted separately. So `kth_largest([3, 2, 1, 5, 6, 4], 3)` is `4`. `k` is guaranteed between 1 and the list length. Lesson: selection vs full sorting — think about which elements you actually need.",
    starterCode: "def kth_largest(numbers, k):\n    # kth largest value (1-based, duplicates counted)\n    pass\n",
    hints: [
      "A correct but O(n log n) approach: `sorted(numbers, reverse=True)[k - 1]`.",
      "A faster idea: only keep the top `k`; a heap or partial selection avoids a full sort.",
      "Kth SMALLEST is the mirror image — it is easy to confuse the two; here 1st largest is the max."
    ],
    testCases: [
      { input: "kth_largest([3, 2, 1, 5, 6, 4], 3)", expected: "4", internalInput: [[3, 2, 1, 5, 6, 4], 3] },
      { input: "kth_largest([10, 30, 20], 1)", expected: "30", internalInput: [[10, 30, 20], 1] },
      { input: "kth_largest([5, 5, 5], 2)", expected: "5", internalInput: [[5, 5, 5], 2] },
      { input: "kth_largest([7, 3, 9, 1], 4)", expected: "1", internalInput: [[7, 3, 9, 1], 4] },
      { input: "kth_largest([4, 4, 3], 2)", expected: "4", internalInput: [[4, 4, 3], 2] }
    ]
  },
  {
    id: "prob-product-except-self",
    title: "50. Product of Array Except Self",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `product_except_self(numbers)` that returns a list where each entry is the product of every element of `numbers` EXCEPT the one at that position. Do it WITHOUT dividing the total product (division by zero is the trap), and aim for a single pass pattern. E.g. `[1, 2, 3, 4]` → `[24, 12, 8, 6]`. Lesson: prefix / suffix products.",
    starterCode: "def product_except_self(numbers):\n    # Product of all elements except the current one\n    pass\n",
    hints: [
      "Two-pass idea: first accumulate running products from the LEFT, then from the RIGHT, combining per slot.",
      "Build `result` filled with ones first; multiply month in `running` factors in each direction.",
      "Never use the grand total divided by `numbers[i]` — `[0, 1, 2, 3]` would need division by zero."
    ],
    testCases: [
      { input: "product_except_self([1, 2, 3, 4])", expected: "[24, 12, 8, 6]", internalInput: [1, 2, 3, 4] },
      { input: "product_except_self([0, 1, 2, 3])", expected: "[6, 0, 0, 0]", internalInput: [0, 1, 2, 3] },
      { input: "product_except_self([0, 0])", expected: "[0, 0]", internalInput: [0, 0] },
      { input: "product_except_self([3])", expected: "[1]", internalInput: [3] },
      { input: "product_except_self([2, 5])", expected: "[5, 2]", internalInput: [2, 5] },
      { input: "product_except_self([1, 0, 3])", expected: "[0, 3, 0]", internalInput: [1, 0, 3] }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════
  // PHASE E — ADVANCED CHALLENGES
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "prob-longest-consecutive-sequence",
    title: "51. Longest Consecutive Sequence",
    difficulty: "Hard",
    category: "Python",
    xp: 80,
    description: "Write a function `longest_consecutive(numbers)` that returns the length of the LONGEST run of consecutive integers that can be formed from the list, ignoring duplicates. For `[9, 1, 5, 7, 6, 8, 2]` the sequence `5, 6, 7, 8, 9` has length 5. Empty input returns 0. Lesson: converting to a set to enable O(1) membership and O(n) total work.",
    starterCode: "def longest_consecutive(numbers):\n    # Length of longest consecutive run in the set\n    pass\n",
    hints: [
      "Put every value into a `set` for O(1) membership checks.",
      "A value is a run START only if `value - 1` is absent from the set.",
      "From each start, count upward while consecutive members exist; track the global max.",
      "This avoids sorting — the false-path of nested scans makes it O(n^2) instead of O(n)."
    ],
    testCases: [
      { input: "longest_consecutive([9, 1, 5, 7, 6, 8, 2])", expected: "5", internalInput: [9, 1, 5, 7, 6, 8, 2] },
      { input: "longest_consecutive([100, 4, 200, 1, 3, 2])", expected: "4", internalInput: [100, 4, 200, 1, 3, 2] },
      { input: "longest_consecutive([])", expected: "0", internalInput: [] },
      { input: "longest_consecutive([5])", expected: "1", internalInput: [5] },
      { input: "longest_consecutive([1, 2, 0, 1])", expected: "3", internalInput: [1, 2, 0, 1] },
      { input: "longest_consecutive([3, 3, 3])", expected: "1", internalInput: [3, 3, 3] }
    ]
  },
  {
    id: "prob-subsets-generator",
    title: "52. Generate All Subsets",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `all_subsets(items)` that returns a list of every subset of `items` (each subset is itself a list). Start with only the empty subset and expand: for every existing subset, add a new one that also includes the current element. Order may vary but counts must match — `all_subsets(['a', 'b'])` yields 4 subsets. Lesson: iterative subset building.",
    starterCode: "def all_subsets(items):\n    # Return list of all subsets, including the empty set\n    pass\n",
    hints: [
      "Begin `subsets = [[]]`.",
      "For each element, append `existing + [element]` for every subset already in the list.",
      "The size grows by 2 per element: `len(subsets) == 2 ** len(items)` at the end."
    ],
    testCases: [
      { input: "all_subsets([])", expected: "[[]]", internalInput: [] },
      { input: "all_subsets(['a'])", expected: "[[], ['a']]", internalInput: ['a'] },
      { input: "all_subsets(['a', 'b'])", expected: "[[], ['a'], ['b'], ['a', 'b']]", internalInput: ['a', 'b'] }
    ]
  },
  {
    id: "prob-linked-list-cycle",
    title: "53. Detect a Cycle in Pointer Edges",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write a function `has_cycle(edges)` where the singly linked list is represented as a list of next-pointers: `edges[i]` is the index the node at position `i` points to, and `edges[i] == -1` marks the end of the list. Return `True` if following the links ever loops back to a visited node — a cycle — and `False` if the walk terminates. Lesson: Floyd's tortoise-and-hare — slow and fast pointers collide exactly when a cycle exists.",
    starterCode: "def has_cycle(edges):\n    # Return True if following links forms a cycle\n    pass\n",
    hints: [
      "Run two pointers: `slow` advances by one index per step, `fast` by two (following `edges`).",
      "If `fast` reaches `-1` (the terminator) the list has no cycle.",
      "If `slow == fast` at any step, a cycle is confirmed — return `True`.",
      "Classic flaw: only checking the pointers' VALUES misses the terminator edge case — guard `fast` against reaching `-1`."
    ],
    testCases: [
      { input: "has_cycle([1, 2, 3, 1])", expected: "True", internalInput: [1, 2, 3, 1] },
      { input: "has_cycle([1, 2, 3, -1])", expected: "False", internalInput: [1, 2, 3, -1] },
      { input: "has_cycle([0])", expected: "True", internalInput: [0] },
      { input: "has_cycle([-1])", expected: "False", internalInput: [-1] },
      { input: "has_cycle([])", expected: "False", internalInput: [] },
      { input: "has_cycle([1, 0])", expected: "True", internalInput: [1, 0] }
    ]
  },
  {
    id: "prob-python-env-loader",
    title: "54. Parse a .env File (Strings & Files)",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `parse_env(content)` that parses the text of a `.env` file and returns a dictionary of `KEY: VALUE` pairs. Each non-empty line has the form `KEY=VALUE` (no spaces around the `=`), comments starting with `#` are ignored, and empty lines are skipped. Order does not matter. Lesson: line-based parsing — split, filter, and key-value extraction with `partition`.",
    starterCode: "def parse_env(content):\n    # Parse KEY=VALUE lines into a dict\n    pass\n",
    hints: [
      "Loop over `content.splitlines()` and skip lines that are empty or start with `#`.",
      "Use `line.partition('=')` to split only at the FIRST `=`, so values containing `=` survive.",
      "Both the key and the value should be kept as raw text."
    ],
    testCases: [
      { input: "parse_env('DB_PORT=5432\\nDB_HOST=localhost\\n')", expected: "{'DB_PORT': '5432', 'DB_HOST': 'localhost'}", internalInput: "DB_PORT=5432\nDB_HOST=localhost" },
      { input: "parse_env('')", expected: "{}", internalInput: "" },
      { input: "parse_env('# comment\\n')", expected: "{}", internalInput: "# comment" },
      { input: "parse_env('A=1' )", expected: "{'A': '1'}", internalInput: "A=1" },
      { input: "parse_env('URL=http://localhost:8000/api')", expected: "{'URL': 'http://localhost:8000/api'}", internalInput: "URL=http://localhost:8000/api" }
    ]
  },
  {
    id: "prob-python-password-hash",
    title: "55. Password Hash Playground",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `password_hash(password)` that computes a simple school-project hash: sum the numeric codes of every character (`ord(c)`), multiply that total by `3`, and return `value % 256`. Shorter and longer passwords both work. This is deliberately NOT secure — the lesson is understanding hash-like deterministic mappings.",
    starterCode: "def password_hash(password):\n    # (sum of ord(c)) * 3 mod 256\n    pass\n",
    hints: [
      "Use a generator/loop to total `ord(ch)` across the string.",
      "Apply `* 3`, then `% 256` as the final step.",
      "Determinism is the point: the same password always returns the same number."
    ],
    testCases: [
      { input: "password_hash('')", expected: "0", internalInput: "" },
      { input: "password_hash('a')", expected: "35", internalInput: "a" },
      { input: "password_hash('password')", expected: "89", internalInput: "password" }
    ]
  }
];
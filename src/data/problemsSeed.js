// ── Pure Python Coding & Problem Solving Challenges ─────────────────────────
// Only Python questions — Data Structures & Algorithms are implemented in Python.

export const SEED_PROBLEMS = [
  // ── CORE PYTHON & BASICS ───────────────────────────────────────────────────
  {
    id: "prob-hello-world",
    title: "1. Hello World Generator",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `say_hello(name)` that returns the string `'Hello, <name>!'`. If no name is provided, return `'Hello, World!'`.",
    starterCode: "def say_hello(name='World'):\n    # Write your code here\n    pass\n",
    hints: ["Use string formatting or f-strings.", "Check for default argument value."],
    testCases: [
      { input: "say_hello('Alice')", expected: "'Hello, Alice!'", internalInput: "Alice" },
      { input: "say_hello('CodeLift')", expected: "'Hello, CodeLift!'", internalInput: "CodeLift" },
      { input: "say_hello()", expected: "'Hello, World!'", internalInput: "" }
    ]
  },
  {
    id: "prob-even-or-odd",
    title: "2. Even or Odd Number Checker",
    difficulty: "Easy",
    category: "Python",
    xp: 20,
    description: "Write a function `is_even(n)` that returns `True` if `n` is an even integer, and `False` otherwise.",
    starterCode: "def is_even(n):\n    # Return True if n is even, else False\n    pass\n",
    hints: ["Use the modulo operator % to check divisibility by 2."],
    testCases: [
      { input: "is_even(4)", expected: "True", internalInput: 4 },
      { input: "is_even(7)", expected: "False", internalInput: 7 },
      { input: "is_even(0)", expected: "True", internalInput: 0 }
    ]
  },
  {
    id: "prob-reverse-string",
    title: "3. Reverse a String",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `reverse_string(s)` that takes a string `s` and returns it reversed.",
    starterCode: "def reverse_string(s):\n    # Return reversed string\n    pass\n",
    hints: ["You can use Python string slicing `s[::-1]` or a loop."],
    testCases: [
      { input: "reverse_string('python')", expected: "'nohtyp'", internalInput: "python" },
      { input: "reverse_string('CodeLift')", expected: "'tfiLedoC'", internalInput: "CodeLift" }
    ]
  },
  {
    id: "prob-find-max",
    title: "4. Find Maximum in List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `find_max(numbers)` that returns the maximum number in a non-empty list of integers.",
    starterCode: "def find_max(numbers):\n    # Return the maximum element\n    pass\n",
    hints: ["Python has a built-in `max()` function, or iterate keeping track of maximum."],
    testCases: [
      { input: "find_max([3, 7, 2, 9, 5])", expected: "9", internalInput: [3, 7, 2, 9, 5] },
      { input: "find_max([-10, -3, -50])", expected: "-3", internalInput: [-10, -3, -50] }
    ]
  },
  {
    id: "prob-palindrome-check",
    title: "5. Palindrome String Verification",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `is_palindrome(s)` that returns `True` if `s` is a palindrome (ignores spaces and case), else `False`.",
    starterCode: "def is_palindrome(s):\n    # Clean string and check palindrome\n    pass\n",
    hints: ["Convert string to lowercase and remove spaces using `.replace(' ', '').lower()`."],
    testCases: [
      { input: "is_palindrome('racecar')", expected: "True", internalInput: "racecar" },
      { input: "is_palindrome('A man a plan a canal Panama')", expected: "True", internalInput: "A man a plan a canal Panama" },
      { input: "is_palindrome('hello')", expected: "False", internalInput: "hello" }
    ]
  },
  {
    id: "prob-factorial-calc",
    title: "6. Calculate Factorial",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `factorial(n)` that returns the factorial of non-negative integer `n`. `factorial(0) = 1`.",
    starterCode: "def factorial(n):\n    # Return n!\n    pass\n",
    hints: ["Use recursion or a for loop from 1 to n."],
    testCases: [
      { input: "factorial(5)", expected: "120", internalInput: 5 },
      { input: "factorial(0)", expected: "1", internalInput: 0 },
      { input: "factorial(7)", expected: "5040", internalInput: 7 }
    ]
  },
  {
    id: "prob-fizzbuzz",
    title: "7. Classic FizzBuzz Generator",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `fizzbuzz(n)` returning a list from 1 to n where multiples of 3 are `'Fizz'`, multiples of 5 are `'Buzz'`, multiples of both are `'FizzBuzz'`, else string of the number.",
    starterCode: "def fizzbuzz(n):\n    # Return list of strings\n    pass\n",
    hints: ["Check divisibility by 15 (both 3 and 5) first!"],
    testCases: [
      { input: "fizzbuzz(5)", expected: "['1', '2', 'Fizz', '4', 'Buzz']", internalInput: 5 },
      { input: "fizzbuzz(15)[-1]", expected: "'FizzBuzz'", internalInput: 15 }
    ]
  },
  {
    id: "prob-count-vowels",
    title: "8. Count Vowels in String",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_vowels(s)` that counts vowels (a, e, i, o, u - case insensitive) in string `s`.",
    starterCode: "def count_vowels(s):\n    # Count vowels in s\n    pass\n",
    hints: ["Set of vowels: `set('aeiouAEIOU')`."],
    testCases: [
      { input: "count_vowels('Hello World')", expected: "3", internalInput: "Hello World" },
      { input: "count_vowels('CodeLift Platform')", expected: "5", internalInput: "CodeLift Platform" }
    ]
  },
  {
    id: "prob-list-deduplicate",
    title: "9. Deduplicate List Preserving Order",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `remove_duplicates(items)` returning a list with duplicates removed while maintaining original order.",
    starterCode: "def remove_duplicates(items):\n    # Return list with unique items preserving order\n    pass\n",
    hints: ["Use a set to keep track of seen items while building a new list."],
    testCases: [
      { input: "remove_duplicates([1, 2, 2, 3, 4, 3, 1])", expected: "[1, 2, 3, 4]", internalInput: [1, 2, 2, 3, 4, 3, 1] }
    ]
  },
  {
    id: "prob-sum-digits",
    title: "10. Sum of Digits",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `sum_digits(n)` that returns the sum of all digits of non-negative integer `n`.",
    starterCode: "def sum_digits(n):\n    # Return sum of digits\n    pass\n",
    hints: ["Convert `n` to string and iterate over characters, converting back to int."],
    testCases: [
      { input: "sum_digits(1234)", expected: "10", internalInput: 1234 },
      { input: "sum_digits(999)", expected: "27", internalInput: 999 }
    ]
  },

  // ── PYTHON DATA STRUCTURES & ALGORITHMS ────────────────────────────────────
  {
    id: "prob-two-sum",
    title: "11. Two Sum Problem",
    difficulty: "Easy",
    category: "Python",
    xp: 50,
    description: "Given an array of integers `nums` and a target integer `target`, return indices of the two numbers such that they add up to `target`.",
    starterCode: "def two_sum(nums, target):\n    # Return indices [i, j]\n    pass\n",
    hints: ["Use a hash map / dictionary to store seen numbers and their indices in O(N) time."],
    testCases: [
      { input: "two_sum([2, 7, 11, 15], 9)", expected: "[0, 1]", internalInput: [[2, 7, 11, 15], 9] },
      { input: "two_sum([3, 2, 4], 6)", expected: "[1, 2]", internalInput: [[3, 2, 4], 6] }
    ]
  },
  {
    id: "prob-valid-parentheses",
    title: "12. Valid Parentheses Stack",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Given a string `s` containing `()`, `{}`, `[]`, determine if the input string is valid. Brackets must close in correct order.",
    starterCode: "def is_valid_brackets(s):\n    # Return True if valid, else False\n    pass\n",
    hints: ["Use a Stack (Python list with pop). Push open brackets, pop and match when encountering closing brackets."],
    testCases: [
      { input: "is_valid_brackets('()[]{}')", expected: "True", internalInput: "()[]{}" },
      { input: "is_valid_brackets('(]')", expected: "False", internalInput: "(]" },
      { input: "is_valid_brackets('{[]}')", expected: "True", internalInput: "{[]}" }
    ]
  },
  {
    id: "prob-binary-search",
    title: "13. Binary Search Algorithm",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write `binary_search(arr, target)` returning index of target in sorted list `arr`, or -1 if not present.",
    starterCode: "def binary_search(arr, target):\n    # Return index or -1\n    pass\n",
    hints: ["Maintain low and high pointers. mid = (low + high) // 2."],
    testCases: [
      { input: "binary_search([1, 3, 5, 7, 9, 11], 7)", expected: "3", internalInput: [[1, 3, 5, 7, 9, 11], 7] },
      { input: "binary_search([1, 3, 5, 7], 2)", expected: "-1", internalInput: [[1, 3, 5, 7], 2] }
    ]
  },
  {
    id: "prob-merge-sorted-lists",
    title: "14. Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Python",
    xp: 50,
    description: "Write `merge_sorted(list1, list2)` returning a single merged sorted list from two pre-sorted lists.",
    starterCode: "def merge_sorted(list1, list2):\n    # Return merged sorted list\n    pass\n",
    hints: ["Use two pointers starting at index 0 of both lists."],
    testCases: [
      { input: "merge_sorted([1, 3, 5], [2, 4, 6])", expected: "[1, 2, 3, 4, 5, 6]", internalInput: [[1, 3, 5], [2, 4, 6]] }
    ]
  },
  {
    id: "prob-fibonacci-memo",
    title: "15. Fibonacci Number (DP)",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Write `fibonacci(n)` returning the n-th Fibonacci number. `fib(0)=0`, `fib(1)=1`. Must handle `n` up to 100 fast.",
    starterCode: "def fibonacci(n):\n    # Return n-th fibonacci number\n    pass\n",
    hints: ["Use dynamic programming (iterative bottom-up approach) to avoid exponential call overhead."],
    testCases: [
      { input: "fibonacci(10)", expected: "55", internalInput: 10 },
      { input: "fibonacci(30)", expected: "832040", internalInput: 30 }
    ]
  },
  {
    id: "prob-longest-common-prefix",
    title: "16. Longest Common Prefix",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write `longest_common_prefix(strs)` to find the longest common prefix string amongst an array of strings.",
    starterCode: "def longest_common_prefix(strs):\n    # Return prefix string\n    pass\n",
    hints: ["Compare character by character using Zip or horizontal scanning."],
    testCases: [
      { input: "longest_common_prefix(['flower','flow','flight'])", expected: "'fl'", internalInput: ["flower","flow","flight"] },
      { input: "longest_common_prefix(['dog','racecar','car'])", expected: "''", internalInput: ["dog","racecar","car"] }
    ]
  },
  {
    id: "prob-max-subarray-sum",
    title: "17. Maximum Subarray Sum (Kadane's Algorithm)",
    difficulty: "Medium",
    category: "Python",
    xp: 70,
    description: "Given integer array `nums`, find contiguous subarray with largest sum and return its sum.",
    starterCode: "def max_subarray(nums):\n    # Return max sum\n    pass\n",
    hints: ["Kadane's Algorithm: `current_max = max(num, current_max + num)`."],
    testCases: [
      { input: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", expected: "6", internalInput: [-2,1,-3,4,-1,2,1,-5,4] }
    ]
  },
  {
    id: "prob-anagram-check",
    title: "18. Valid Anagram",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, else `False`.",
    starterCode: "def is_anagram(s, t):\n    # Return True/False\n    pass\n",
    hints: ["Sorted strings match: `sorted(s) == sorted(t)`."],
    testCases: [
      { input: "is_anagram('anagram', 'nagaram')", expected: "True", internalInput: ["anagram", "nagaram"] },
      { input: "is_anagram('rat', 'car')", expected: "False", internalInput: ["rat", "car"] }
    ]
  },
  {
    id: "prob-group-anagrams",
    title: "19. Group Anagrams",
    difficulty: "Hard",
    category: "Python",
    xp: 80,
    description: "Given an array of strings `strs`, group the anagrams together into a list of lists.",
    starterCode: "def group_anagrams(strs):\n    # Return grouped lists\n    pass\n",
    hints: ["Use a defaultdict with tuple of character counts or sorted string as dictionary key."],
    testCases: [
      { input: "group_anagrams(['eat','tea','tan','ate','nat','bat'])", expected: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]", internalInput: ["eat","tea","tan","ate","nat","bat"] }
    ]
  },
  {
    id: "prob-move-zeroes",
    title: "20. Move Zeroes to End",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Given array `nums`, move all zeroes to the end while maintaining relative order of non-zero elements.",
    starterCode: "def move_zeroes(nums):\n    # Modify in-place or return modified list\n    pass\n",
    hints: ["Maintain pointer for position of last non-zero element."],
    testCases: [
      { input: "move_zeroes([0, 1, 0, 3, 12])", expected: "[1, 3, 12, 0, 0]", internalInput: [0, 1, 0, 3, 12] }
    ]
  },
  {
    id: "prob-linked-list-cycle",
    title: "21. Detect Cycle in Pointer Representation",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Given a list representing node connections where `edges[i]` points to next index, return `True` if a loop exists.",
    starterCode: "def has_cycle(edges):\n    # Return True if cycle exists\n    pass\n",
    hints: ["Floyd's Tortoise and Hare (slow & fast pointer) algorithm."],
    testCases: [
      { input: "has_cycle([1, 2, 3, 1])", expected: "True", internalInput: [1, 2, 3, 1] },
      { input: "has_cycle([1, 2, 3, -1])", expected: "False", internalInput: [1, 2, 3, -1] }
    ]
  },
  {
    id: "prob-kth-largest",
    title: "22. Find Kth Largest Element",
    difficulty: "Medium",
    category: "Python",
    xp: 60,
    description: "Given an unsorted list `nums` and integer `k`, return the `k`-th largest element in the array.",
    starterCode: "def find_kth_largest(nums, k):\n    # Return kth largest\n    pass\n",
    hints: ["Sort in descending order or use min-heap / Priority Queue."],
    testCases: [
      { input: "find_kth_largest([3,2,1,5,6,4], 2)", expected: "5", internalInput: [[3,2,1,5,6,4], 2] }
    ]
  },
  {
    id: "prob-climbing-stairs",
    title: "23. Climbing Stairs DP",
    difficulty: "Easy",
    category: "Python",
    xp: 50,
    description: "You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. How many distinct ways to reach top?",
    starterCode: "def climb_stairs(n):\n    # Return total ways\n    pass\n",
    hints: ["`ways(n) = ways(n-1) + ways(n-2)`."],
    testCases: [
      { input: "climb_stairs(3)", expected: "3", internalInput: 3 },
      { input: "climb_stairs(5)", expected: "8", internalInput: 5 }
    ]
  },
  {
    id: "prob-product-except-self",
    title: "24. Product of Array Except Self",
    difficulty: "Hard",
    category: "Python",
    xp: 80,
    description: "Given integer array `nums`, return an array `res` such that `res[i]` equals product of all elements except `nums[i]` without using division.",
    starterCode: "def product_except_self(nums):\n    # Return result array\n    pass\n",
    hints: ["Calculate prefix products from left and suffix products from right."],
    testCases: [
      { input: "product_except_self([1, 2, 3, 4])", expected: "[24, 12, 8, 6]", internalInput: [1, 2, 3, 4] }
    ]
  },
  {
    id: "prob-subsets-generator",
    title: "25. Power Set Generator (Subsets)",
    difficulty: "Medium",
    category: "Python",
    xp: 70,
    description: "Given integer array `nums` of unique elements, return all possible subsets (the power set).",
    starterCode: "def subsets(nums):\n    # Return list of subsets\n    pass\n",
    hints: ["Use backtracking or cascading."],
    testCases: [
      { input: "len(subsets([1,2,3]))", expected: "8", internalInput: [1,2,3] }
    ]
  },

  // ── PYTHON UTILITY & SYSTEM FUNCTIONS ──────────────────────────────────────
  {
    id: "prob-python-env-loader",
    title: "26. Environment Variable Fallback Parser",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write `get_env(key, default_value, env_dict)` returning value from `env_dict` or `default_value` if key missing or empty.",
    starterCode: "def get_env(key, default_value, env_dict):\n    # Return value or default\n    pass\n",
    hints: ["Use `env_dict.get(key) or default_value`."],
    testCases: [
      { input: "get_env('PORT', 8080, {'PORT': '3000'})", expected: "'3000'", internalInput: ['PORT', 8080, {'PORT': '3000'}] },
      { input: "get_env('DB_HOST', 'localhost', {})", expected: "'localhost'", internalInput: ['DB_HOST', 'localhost', {}] }
    ]
  },
  {
    id: "prob-python-password-hash",
    title: "27. Password Complexity Validator",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write `is_strong_password(password)` returning `True` if password has at least 8 chars, 1 uppercase, 1 lowercase, 1 digit.",
    starterCode: "def is_strong_password(password):\n    # Return True if strong, else False\n    pass\n",
    hints: ["Use `any(c.isupper() for c in password)` and similar checks."],
    testCases: [
      { input: "is_strong_password('CodeLift2026')", expected: "True", internalInput: "CodeLift2026" },
      { input: "is_strong_password('weak')", expected: "False", internalInput: "weak" }
    ]
  }
];

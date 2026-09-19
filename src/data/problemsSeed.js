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
  },

  // ── PYTHON PROBLEM SOLVING: LOOPS & LISTS ─────────────────────────────────
  {
    id: "prob-sum-list",
    title: "28. Sum of All Elements in a List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `sum_list(numbers)` that uses a for loop to calculate the sum of all elements in a list of numbers and returns it.",
    starterCode: "def sum_list(numbers):\n    # Use a for loop to sum all elements\n    pass\n",
    hints: ["Initialize a variable `total = 0` before the loop.", "Add each element to `total` inside the loop."],
    testCases: [
      { input: "sum_list([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])", expected: "55", internalInput: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { input: "sum_list([45, 12, 8])", expected: "65", internalInput: [45, 12, 8] },
      { input: "sum_list([])", expected: "0", internalInput: [] }
    ]
  },
  {
    id: "prob-count-evens",
    title: "29. Count Even Numbers in a List",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_evens(numbers)` that uses a for loop to count how many numbers in the list are even and returns the count.",
    starterCode: "def count_evens(numbers):\n    # Count even numbers with a for loop\n    pass\n",
    hints: ["A number is even when it is divisible by 2: `num % 2 == 0`."],
    testCases: [
      { input: "count_evens([2, 5, 8, 11, 14, 17, 20, 23, 26, 29])", expected: "5", internalInput: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29] },
      { input: "count_evens([1, 3, 5])", expected: "0", internalInput: [1, 3, 5] }
    ]
  },
  {
    id: "prob-reverse-list",
    title: "30. Reverse a List Without reverse()",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `reverse_list(items)` that uses a while loop to build a new list containing the elements in reverse order. Do not use `reverse()` or slicing.",
    starterCode: "def reverse_list(items):\n    # Build and return the reversed list using a while loop\n    pass\n",
    hints: ["Walk the original list backwards using an index that starts at `len(items) - 1`.", "Append each element you visit to a new result list."],
    testCases: [
      { input: "reverse_list([10, 20, 30, 40, 50])", expected: "[50, 40, 30, 20, 10]", internalInput: [10, 20, 30, 40, 50] },
      { input: "reverse_list([1, 2, 3])", expected: "[3, 2, 1]", internalInput: [1, 2, 3] }
    ]
  },
  {
    id: "prob-remove-negatives",
    title: "31. Remove Negative Numbers",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `remove_negatives(numbers)` that returns a list with all negative numbers removed while keeping the positive and zero values in their original order. Prefer a while loop that iterates naturally.",
    starterCode: "def remove_negatives(numbers):\n    # Return list without negative numbers\n    pass\n",
    hints: ["Keep only elements where `num >= 0`.", "Build a new result list instead of deleting while iterating forward."],
    testCases: [
      { input: "remove_negatives([5, -2, 8, -6, 3, -1])", expected: "[5, 8, 3]", internalInput: [5, -2, 8, -6, 3, -1] },
      { input: "remove_negatives([-1, -5, 0, 2])", expected: "[0, 2]", internalInput: [-1, -5, 0, 2] }
    ]
  },
  {
    id: "prob-find-index",
    title: "32. Find Index of an Element",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `find_index(items, value)` that uses a for loop to find the position of `value` in `items`. Return the first matching index, or `-1` if not found. Do not use `.index()`.",
    starterCode: "def find_index(items, value):\n    # Find the index of value using a for loop\n    pass\n",
    hints: ["Use `enumerate(items)` to get both index and element in one loop.", "Return immediately when you find the value; return -1 after the loop."],
    testCases: [
      { input: "find_index([10, 20, 30, 40], 30)", expected: "2", internalInput: [[10, 20, 30, 40], 30] },
      { input: "find_index([10, 20, 30, 40], 99)", expected: "-1", internalInput: [[10, 20, 30, 40], 99] }
    ]
  },
  {
    id: "prob-multiply-list",
    title: "33. Multiply Each Element by a Factor",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `multiply_list(numbers, factor)` that uses a for loop to multiply every element of `numbers` by `factor` and returns the updated list.",
    starterCode: "def multiply_list(numbers, factor):\n    # Multiply every element by factor\n    pass\n",
    hints: ["Build a new list where each element is `num * factor`.", "You may also update the list in place by assigning to each index."],
    testCases: [
      { input: "multiply_list([1, 2, 3, 4], 2)", expected: "[2, 4, 6, 8]", internalInput: [[1, 2, 3, 4], 2] },
      { input: "multiply_list([3, 5], 10)", expected: "[30, 50]", internalInput: [[3, 5], 10] }
    ]
  },
  {
    id: "prob-count-occurrences",
    title: "34. Count Occurrences of a Value",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `count_occurrences(items, value)` that uses a for loop to count how many times `value` appears in `items` and returns the count.",
    starterCode: "def count_occurrences(items, value):\n    # Count how many times value appears\n    pass\n",
    hints: ["Increment a counter each time an element equals `value`."],
    testCases: [
      { input: "count_occurrences([1, 2, 3, 2, 4, 2, 5], 2)", expected: "3", internalInput: [[1, 2, 3, 2, 4, 2, 5], 2] },
      { input: "count_occurrences([1, 2, 3], 9)", expected: "0", internalInput: [[1, 2, 3], 9] }
    ]
  },
  {
    id: "prob-merge-unique",
    title: "35. Merge Two Lists Without Duplicates",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `merge_unique(list_a, list_b)` that uses for loops to combine all elements from both lists into a new list that contains no duplicates. Preserve the order of first occurrence.",
    starterCode: "def merge_unique(list_a, list_b):\n    # Merge both lists without duplicates\n    pass\n",
    hints: ["Create a `seen` set and a result list.", "For each element in `list_a` then `list_b`, append it only if it is not already seen."],
    testCases: [
      { input: "merge_unique([1, 3, 5, 7, 9], [3, 6, 7, 9, 12])", expected: "[1, 3, 5, 7, 9, 6, 12]", internalInput: [[1, 3, 5, 7, 9], [3, 6, 7, 9, 12]] },
      { input: "merge_unique([1, 2], [2, 3])", expected: "[1, 2, 3]", internalInput: [[1, 2], [2, 3]] }
    ]
  },
  {
    id: "prob-is-sorted",
    title: "36. Check if a List is Sorted",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `is_sorted(numbers)` that uses a for loop to check whether the list is sorted from smallest to largest. Return `True` if sorted, else `False`. (Equal neighbours still count as sorted.)",
    starterCode: "def is_sorted(numbers):\n    # Return True if numbers is ascending, else False\n    pass\n",
    hints: ["Compare each element with its next neighbour: `numbers[i] > numbers[i + 1]` means not sorted."],
    testCases: [
      { input: "is_sorted([1, 3, 5, 7, 9])", expected: "True", internalInput: [1, 3, 5, 7, 9] },
      { input: "is_sorted([1, 5, 2, 7, 9])", expected: "False", internalInput: [1, 5, 2, 7, 9] }
    ]
  },
  {
    id: "prob-sum-digits-list",
    title: "37. Sum of Digits of All Numbers",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `sum_digits_list(numbers)` that uses a for loop over the numbers and a while loop (or nested loop) over each number's digits, returning a new list with the sum of digits of each number.",
    starterCode: "def sum_digits_list(numbers):\n    # Return list of digit sums for each number\n    pass\n",
    hints: ["For each number, total its digits using `% 10` and integer division `// 10`.", "Example: `[12, 34, 56]` becomes `[3, 7, 11]`."],
    testCases: [
      { input: "sum_digits_list([12, 34, 56])", expected: "[3, 7, 11]", internalInput: [12, 34, 56] },
      { input: "sum_digits_list([123, 5])", expected: "[6, 5]", internalInput: [123, 5] }
    ]
  },
  {
    id: "prob-second-largest",
    title: "38. Find the Second Largest Number",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `second_largest(numbers)` that uses a for loop to find the second largest number in a list (without sorting).",
    starterCode: "def second_largest(numbers):\n    # Return the second largest number\n    pass\n",
    hints: ["Track both `largest` and `second_largest` in a single loop.", "Update the pair carefully when you find a new largest value."],
    testCases: [
      { input: "second_largest([10, 45, 78, 23, 56])", expected: "56", internalInput: [10, 45, 78, 23, 56] },
      { input: "second_largest([5, 1, 8, 3])", expected: "5", internalInput: [5, 1, 8, 3] }
    ]
  },
  {
    id: "prob-swap-ends",
    title: "39. Swap First and Last Elements",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `swap_ends(items)` that uses a simple assignment to swap the first and last elements of a list and returns the modified list.",
    starterCode: "def swap_ends(items):\n    # Swap first and last elements\n    pass\n",
    hints: ["Use tuple assignment: `items[0], items[-1] = items[-1], items[0]`."],
    testCases: [
      { input: "swap_ends([10, 20, 30, 40, 50])", expected: "[50, 20, 30, 40, 10]", internalInput: [10, 20, 30, 40, 50] },
      { input: "swap_ends([1, 2])", expected: "[2, 1]", internalInput: [1, 2] }
    ]
  },
  {
    id: "prob-split-odd-even",
    title: "40. Split List into Odd and Even",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `split_odd_even(numbers)` that uses a for loop to separate the numbers into two new lists. Return a list containing the evens list first, then the odds list: `[evens, odds]`.",
    starterCode: "def split_odd_even(numbers):\n    # Return [evens, odds]\n    pass\n",
    hints: ["Create `evens` and `odds` lists and append to the matching one for each number."],
    testCases: [
      { input: "split_odd_even([1, 2, 3, 4, 5, 6, 7, 8, 9])", expected: "[[2, 4, 6, 8], [1, 3, 5, 7, 9]]", internalInput: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { input: "split_odd_even([4, 7])", expected: "[[4], [7]]", internalInput: [4, 7] }
    ]
  },
  {
    id: "prob-rotate-left",
    title: "41. Rotate List Left by One",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `rotate_left(numbers)` that uses a while loop to rotate the list left by one position (the first element moves to the end) and returns the rotated list.",
    starterCode: "def rotate_left(numbers):\n    # Return list rotated left by one position\n    pass\n",
    hints: ["Remember the first element, shift the rest one position left, then place the saved element at the end."],
    testCases: [
      { input: "rotate_left([1, 2, 3, 4, 5])", expected: "[2, 3, 4, 5, 1]", internalInput: [1, 2, 3, 4, 5] },
      { input: "rotate_left([8, 9])", expected: "[9, 8]", internalInput: [8, 9] }
    ]
  },
  {
    id: "prob-avg-above-threshold",
    title: "42. Average of Numbers Above a Threshold",
    difficulty: "Medium",
    category: "Python",
    xp: 50,
    description: "Write a function `avg_above_threshold(numbers, threshold)` that uses a for loop to find all numbers greater than `threshold`, then returns their average. If none qualify, return `0`.",
    starterCode: "def avg_above_threshold(numbers, threshold):\n    # Return average of numbers greater than threshold\n    pass\n",
    hints: ["Collect qualifying numbers or keep both a running sum and a count.", "Divide the sum by the count; division result is a float."],
    testCases: [
      { input: "avg_above_threshold([10, 20, 30, 40, 50], 25)", expected: "40.0", internalInput: [[10, 20, 30, 40, 50], 25] },
      { input: "avg_above_threshold([5, 15, 8], 10)", expected: "15.0", internalInput: [[5, 15, 8], 10] }
    ]
  },
  {
    id: "prob-squares-list",
    title: "43. Squares of 1 to 10",
    difficulty: "Easy",
    category: "Python",
    xp: 30,
    description: "Write a function `squares_up_to(n)` that uses a while loop to generate a list of squares of the numbers from 1 to `n` (inclusive) and returns it.",
    starterCode: "def squares_up_to(n):\n    # Use a while loop to build squares 1..n\n    pass\n",
    hints: ["Start at `i = 1` and keep looping while `i <= n`.", "Append `i * i` each iteration and increment `i`."],
    testCases: [
      { input: "squares_up_to(10)", expected: "[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]", internalInput: 10 },
      { input: "squares_up_to(4)", expected: "[1, 4, 9, 16]", internalInput: 4 }
    ]
  },
  {
    id: "prob-remove-all-occurrences",
    title: "44. Remove All Occurrences of a Value",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `remove_value(numbers, value)` that uses a while loop to remove every occurrence of `value` from the list and returns the cleaned list.",
    starterCode: "def remove_value(numbers, value):\n    # Return list with every occurrence of value removed\n    pass\n",
    hints: ["Use `while value in numbers: numbers.remove(value)` to strip every occurrence, or build a fresh list.", "When deleting in a loop, iterate from the end to avoid index shifting."],
    testCases: [
      { input: "remove_value([1, 2, 3, 2, 4, 2, 5], 2)", expected: "[1, 3, 4, 5]", internalInput: [[1, 2, 3, 2, 4, 2, 5], 2] },
      { input: "remove_value([7, 7, 7], 7)", expected: "[]", internalInput: [[7, 7, 7], 7] }
    ]
  },
  {
    id: "prob-longest-word",
    title: "45. Longest Word in a Sentence",
    difficulty: "Easy",
    category: "Python",
    xp: 40,
    description: "Write a function `longest_word(sentence)` that splits a sentence into a list of words using `.split()` and uses a for loop to find the longest word. Return it.",
    starterCode: "def longest_word(sentence):\n    # Split and find the longest word\n    pass\n",
    hints: ["`words = sentence.split()` gives you the word list.", "Track the longest word seen so far and replace it when a longer word appears."],
    testCases: [
      { input: "longest_word('Python is a powerful language')", expected: "'powerful'", internalInput: "Python is a powerful language" },
      { input: "longest_word('I love code')", expected: "'love'", internalInput: "I love code" }
    ]
  }
];

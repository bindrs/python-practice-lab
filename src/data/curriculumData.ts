export interface SubTopic {
  id: string;
  topicNumber: string;
  title: string;
  category: string;
  durationMinutes: number;
  intro: {
    badge: string;
    headline: string;
    summary: string;
    analogy: string;
    keyTakeaways: string[];
    conceptVisual: 'chip' | 'flow' | 'vessel' | 'string' | 'list' | 'gate' | 'loop' | 'function' | 'turtle' | 'data';
  };
  guide: {
    overview: string;
    keyPoints?: Array<{ title: string; explanation: string; icon?: string }>;
    syntax?: string;
    codeExample: string;
    codeExplanation: string;
    outputSample?: string;
    commonMistakes?: string[];
  };
  exercise: {
    question: string;
    options?: string[];
    correctOption?: number;
    explanation: string;
    starterCode?: string;
    solutionCode?: string;
  };
}

export interface CurriculumModule {
  id: string;
  moduleNumber: string;
  title: string;
  description: string;
  icon: string;
  topics: SubTopic[];
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'm1',
    moduleNumber: '01',
    title: 'Introduction to Programming',
    description: 'Foundational concepts of computing, programs, languages, algorithms, and Python.',
    icon: 'Cpu',
    topics: [
      {
        id: '1.1',
        topicNumber: '1.1',
        title: 'What is a Program?',
        category: 'Foundations',
        durationMinutes: 10,
        intro: {
          badge: 'Concept 1.1',
          headline: 'A Recipe for the Silicon Mind',
          summary: 'A computer program is a sequence of precise instructions telling a computer how to perform a task.',
          analogy: 'Imagine a recipe in a master chef kitchen: ingredients are data, steps are code instructions, and the cake is your output.',
          keyTakeaways: [
            'A program translates human thoughts into machine-executable actions',
            'Programs take input, process logic, and deliver output (IPO model)',
            'Computers execute instructions strictly line-by-line without assuming context'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Computers are fast, but they cannot think creatively. A program acts as the director of hardware, controlling CPU cycles, memory allocations, and display outputs.',
          keyPoints: [
            { title: 'Input-Process-Output (IPO)', explanation: 'Every program receives data (input), performs calculations or transformations (process), and gives results (output).' },
            { title: 'Deterministic Execution', explanation: 'Given the same inputs, a correct program will always produce identical results.' },
            { title: 'Source Code vs Binary', explanation: 'Humans write human-readable source code; the computer ultimately needs 0s and 1s.' }
          ],
          syntax: '# Simple IPO Pattern in Python\nname = input("Enter name: ")\nprint("Welcome,", name)',
          codeExample: '# 1.1 What is a Program?\n# Step 1: Input\nitem = "Laptop"\nprice = 850\nquantity = 2\n\n# Step 2: Process (Calculation)\ntotal_cost = price * quantity\n\n# Step 3: Output\nprint("Item:", item)\nprint("Total Cost: $", total_cost)',
          codeExplanation: 'Here, the program creates values in memory, calculates the multiplication on the CPU, and broadcasts the formatted result.',
          outputSample: 'Item: Laptop\nTotal Cost: $ 1700',
          commonMistakes: [
            'Assuming the computer knows what you mean if you skip an instruction',
            'Confusing variable storage with permanent disk storage'
          ]
        },
        exercise: {
          question: 'What are the three core stages of any computing program workflow?',
          options: [
            'Download, Install, Restart',
            'Input, Process, Output',
            'Compile, Delete, Run',
            'Variable, Loop, Function'
          ],
          correctOption: 1,
          explanation: 'The fundamental model is Input (receiving data), Process (calculations/logic), and Output (delivering results).',
          starterCode: '# Write a program to calculate area of a rectangle\nlength = 10\nwidth = 5\narea = length * width\nprint("Area is:", area)',
          solutionCode: 'length = 10\nwidth = 5\narea = length * width\nprint("Area is:", area)'
        }
      },
      {
        id: '1.2',
        topicNumber: '1.2',
        title: 'Languages of Programming a Computer',
        category: 'Language Spectrum',
        durationMinutes: 15,
        intro: {
          badge: 'Concept 1.2',
          headline: 'From Raw Transistors to Human English',
          summary: 'Programming languages evolved through three primary tiers: Machine Language, Assembly Language, and High-Level Languages.',
          analogy: 'Machine code is like raw electrical pulses; Assembly is cryptic telegraph shorthand; High-level language is conversational English.',
          keyTakeaways: [
            '1.2.1 Machine Language consists directly of binary 1s and 0s (Op-codes)',
            '1.2.2 Assembly uses mnemonics like MOV, ADD, SUB mapped to hardware registers',
            '1.2.3 High-Level Languages (Python, Java, C++) use readable abstractions for humans'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'The evolution of languages is the history of abstraction: freeing human software engineers from managing specific transistor addresses.',
          keyPoints: [
            { title: '1.2.1 Machine Language (1st Gen)', explanation: 'Direct binary signals understood natively by CPU registers without any translation. Extremely error-prone for humans.' },
            { title: '1.2.2 Assembly Language (2nd Gen)', explanation: 'Uses short mnemonic symbols (like "MOV AX, 1" or "ADD AX, BX"). Converted to machine code via an Assembler.' },
            { title: '1.2.3 High-Level Language (3rd+ Gen)', explanation: 'Human-friendly syntax using keywords like if, while, print. Completely hardware independent and translated via Compilers or Interpreters.' }
          ],
          syntax: '# High-Level Python vs Assembly Concept\n# Assembly: MOV R1, 5; ADD R1, 10\n# Python: total = 5 + 10',
          codeExample: '# 1.2 Comparison demonstration\n# In Python (High-Level), adding two numbers is intuitive:\nx = 42\ny = 58\nz = x + y\nprint("High level calculation result:", z)',
          codeExplanation: 'One line of Python can equate to dozens of Assembly instructions and hundreds of machine cycles under the hood.',
          outputSample: 'High level calculation result: 100'
        },
        exercise: {
          question: 'Which language tier requires an "Assembler" to convert mnemonics into machine code?',
          options: [
            'High-Level Language',
            'Assembly Language',
            'Machine Language',
            'Natural Human Language'
          ],
          correctOption: 1,
          explanation: 'Assembly language uses symbolic mnemonics (ADD, MOV) and requires an Assembler to convert them to binary machine instructions.'
        }
      },
      {
        id: '1.3',
        topicNumber: '1.3',
        title: 'Algorithm: The Logic Blueprint',
        category: 'Problem Solving',
        durationMinutes: 12,
        intro: {
          badge: 'Concept 1.3',
          headline: 'Designing Steps Before Writing Code',
          summary: 'An algorithm is an unambiguous, step-by-step procedure for solving a computational problem in finite time.',
          analogy: 'Before building a skyscraper, an architect creates a blueprint; an algorithm is the blueprint of logic before coding.',
          keyTakeaways: [
            'An algorithm must be unambiguous, finite, and effective',
            'Algorithms can be written in plain English, Pseudocode, or Flowcharts',
            'Good algorithms optimize both time (speed) and space (memory)'
          ],
          conceptVisual: 'flow'
        },
        guide: {
          overview: 'Coding without an algorithm is like driving without a map. Developing strong algorithmic thinking makes learning any programming language effortless.',
          keyPoints: [
            { title: 'Finiteness', explanation: 'An algorithm must always terminate after a countable number of discrete steps.' },
            { title: 'Definiteness', explanation: 'Every single step must be clearly defined with zero ambiguity.' },
            { title: 'Language Neutral', explanation: 'An algorithm for finding the largest number is identical whether implemented in Python, C++, or JavaScript.' }
          ],
          syntax: 'Algorithm to find max of two numbers:\n1. Start\n2. Read A and B\n3. If A > B then Max = A else Max = B\n4. Output Max\n5. Stop',
          codeExample: '# 1.3 Algorithm Implementation: Find Max\na = 28\nb = 45\n\nif a > b:\n    max_val = a\nelse:\n    max_val = b\n\nprint("Max value is:", max_val)',
          codeExplanation: 'The code precisely follows the logical flowchart: check condition, branch into true/false path, store result, print.',
          outputSample: 'Max value is: 45'
        },
        exercise: {
          question: 'What is the key characteristic of an algorithm regarding termination?',
          options: [
            'It should run forever in an infinite loop',
            'It must terminate in a finite number of steps',
            'It must only work on quantum computers',
            'It should never produce any output'
          ],
          correctOption: 1,
          explanation: 'A valid algorithm must be finite; it must complete its execution after a countable number of steps.'
        }
      },
      {
        id: '1.4',
        topicNumber: '1.4',
        title: 'Compiler vs Interpreter',
        category: 'Translation Engines',
        durationMinutes: 12,
        intro: {
          badge: 'Concept 1.4',
          headline: 'How Human Text Becomes Machine Motion',
          summary: 'Compilers translate entire programs before execution; Interpreters translate and execute instruction-by-instruction in real time.',
          analogy: 'A Compiler translates a full book into another language in advance. An Interpreter acts like a live speech translator sitting beside you translating line-by-line.',
          keyTakeaways: [
            'Compiler: Analyzes entire source file at once, generates standalone executable (.exe, binary)',
            'Interpreter: Reads line 1, executes line 1; reads line 2, executes line 2',
            'Python utilizes both: compiles source code into Bytecode (.pyc), then runs on the Python Virtual Machine (PVM)'
          ],
          conceptVisual: 'flow'
        },
        guide: {
          overview: 'Understanding the difference explains why Python provides rapid prototyping and immediate debugging feedback.',
          keyPoints: [
            { title: 'Compilation (C, C++, Rust)', explanation: 'Entire code checked upfront. Very fast execution speed, but requires a re-compile step every time code changes.' },
            { title: 'Interpretation (Python, Ruby, JS)', explanation: 'Code executes line-by-line immediately. Fantastic for testing, interactive debugging, and educational visualizers.' },
            { title: 'Python Hybrid Model', explanation: 'Source (.py) -> Bytecode (.pyc) -> PVM (Python Virtual Machine Interpreter).' }
          ],
          codeExample: '# 1.4 The Interpreter in action:\nprint("Line 1: Interpreted & executed")\nprint("Line 2: Active execution continues")\n# An interpreter executes everything up to any error\nprint("Line 3: Finished without errors")',
          codeExplanation: 'Each statement is evaluated in sequence by the visualizer engine just like standard CPython.',
          outputSample: 'Line 1: Interpreted & executed\nLine 2: Active execution continues\nLine 3: Finished without errors'
        },
        exercise: {
          question: 'Why is an interpreter especially great for beginners learning programming?',
          options: [
            'It forces you to compile 10GB binary files first',
            'It allows immediate feedback and line-by-line interactive testing',
            'It only works when the computer is offline',
            'It removes the need for memory'
          ],
          correctOption: 1,
          explanation: 'An interpreter gives instant line-by-line feedback without lengthy manual compilation steps.'
        }
      },
      {
        id: '1.5',
        topicNumber: '1.5',
        title: 'Introduction and Benefits of Python',
        category: 'Python Strengths',
        durationMinutes: 10,
        intro: {
          badge: 'Concept 1.5',
          headline: 'The World’s Most Popular Language',
          summary: 'Python is a high-level, interpreted, dynamically typed language celebrated for clean syntax and extreme versatility.',
          analogy: 'Python is like the Swiss Army Knife of engineering: clean, lightweight, with attachments for AI, web, robotics, and data.',
          keyTakeaways: [
            'Clean, English-like syntax minimizing boilerplate code',
            'Cross-platform: Runs identically on Windows, macOS, Linux, and web browsers',
            'Huge ecosystem: AI/ML, Data Science, Web, Automation, and Embedded Systems'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Created to prioritize developer happiness and readability. Code in Python reads almost like executable pseudo-code.',
          keyPoints: [
            { title: 'Batteries Included', explanation: 'Comes with a rich standard library for math, files, networking, and graphics out of the box.' },
            { title: 'Dynamic Typing', explanation: 'You do not need to explicitly declare variable types like int or float before assignment.' },
            { title: 'Thriving Community', explanation: 'Massive library repository (PyPI) with tens of thousands of community-built tools.' }
          ],
          codeExample: '# 1.5 Python Clean Syntax\n# Swapping two variables in Python takes just 1 line:\na = "Apples"\nb = "Oranges"\na, b = b, a\nprint("a is now:", a)\nprint("b is now:", b)',
          codeExplanation: 'In other languages, swapping requires a temporary third variable. Python enables elegant tuple unpacking.',
          outputSample: 'a is now: Oranges\nb is now: Apples'
        },
        exercise: {
          question: 'Which philosophy describes Python’s comprehensive built-in standard library?',
          options: [
            'Empty shell',
            'Batteries Included',
            'Compile-first',
            'Machine-bound'
          ],
          correctOption: 1,
          explanation: '"Batteries Included" is Python’s official motto referring to its rich built-in library.'
        }
      },
      {
        id: '1.6',
        topicNumber: '1.6',
        title: 'History of Python',
        category: 'Heritage',
        durationMinutes: 8,
        intro: {
          badge: 'Concept 1.6',
          headline: 'Born from a Christmas Holiday Hobby',
          summary: 'Python was created by Guido van Rossum in the Netherlands in late 1989 and officially released in 1991.',
          analogy: 'Named not after the dangerous snake, but the British comedy show "Monty Python’s Flying Circus" to emphasize fun in learning.',
          keyTakeaways: [
            'Created by Guido van Rossum at CWI (Centrum Wiskunde & Informatica)',
            'Successor to the ABC programming language',
            'Python 2.0 released in 2000, Python 3.0 launched in 2008 with modern unicode standards'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Guido van Rossum sought to create an intuitive language that bridged the gap between raw shell scripts and low-level C programming.',
          keyPoints: [
            { title: 'The Zen of Python', explanation: 'Guiding aphorisms like "Beautiful is better than ugly" and "Simple is better than complex".' },
            { title: 'Python 3 Upgrade', explanation: 'Python 3 introduced consistent Unicode strings and streamlined integer division.' },
            { title: 'Open Source Governance', explanation: 'Steered by the Python Software Foundation (PSF) and global open-source developers.' }
          ],
          codeExample: '# 1.6 Exploring the Python Heritage\ncreator = "Guido van Rossum"\nrelease_year = 1991\nnamed_after = "Monty Python\'s Flying Circus"\n\nprint("Python Creator:", creator)\nprint("First Released:", release_year)\nprint("Namesake:", named_after)',
          codeExplanation: 'Python keeps code enjoyable and readable while powering NASA, Google, Netflix, and OpenAI.',
          outputSample: 'Python Creator: Guido van Rossum\nFirst Released: 1991\nNamesake: Monty Python\'s Flying Circus'
        },
        exercise: {
          question: 'Who is the creator of the Python programming language?',
          options: [
            'Bjarne Stroustrup',
            'Guido van Rossum',
            'James Gosling',
            'Dennis Ritchie'
          ],
          correctOption: 1,
          explanation: 'Guido van Rossum created Python in the late 1980s and was affectionately known as its Benevolent Dictator for Life (BDFL).'
        }
      },
      {
        id: '1.7',
        topicNumber: '1.7',
        title: 'Module 01 Exercise: Foundations Review',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 1.7',
          headline: 'Consolidating Module 01 Knowledge',
          summary: 'Put together programming concepts, IPO flow, algorithms, and Python syntax in an interactive hands-on challenge.',
          analogy: 'Time for your first lab test flight! Test your logic in the sandbox.',
          keyTakeaways: [
            'Verify input, process, and output workflow',
            'Format multi-variable console messages cleanly',
            'Think algorithmically before writing code'
          ],
          conceptVisual: 'flow'
        },
        guide: {
          overview: 'Write a complete Python script that calculates a student report card percentage and prints a congratulatory certificate message.',
          keyPoints: [
            { title: 'The Goal', explanation: 'Calculate total marks (out of 300) from 3 subjects, compute percentage, and display clean summary.' }
          ],
          codeExample: '# 1.7 Module 1 Practice Lab\nstudent_name = "Alex"\nmath_marks = 88\nscience_marks = 92\nenglish_marks = 85\n\ntotal = math_marks + science_marks + english_marks\npercentage = (total / 300) * 100\n\nprint("Report for:", student_name)\nprint("Total Marks:", total, "/ 300")\nprint("Percentage:", round(percentage, 2), "%")',
          codeExplanation: 'Demonstrates IPO flow: inputs (marks), process (sum & percentage formula), output (formatted report).',
          outputSample: 'Report for: Alex\nTotal Marks: 265 / 300\nPercentage: 88.33 %'
        },
        exercise: {
          question: 'Write a script that calculates the perimeter of a rectangle with length = 12 and width = 7.',
          starterCode: 'length = 12\nwidth = 7\n# Calculate perimeter = 2 * (length + width)\nperimeter = 2 * (length + width)\nprint("Perimeter:", perimeter)',
          solutionCode: 'length = 12\nwidth = 7\nperimeter = 2 * (length + width)\nprint("Perimeter:", perimeter)',
          explanation: 'Perimeter of rectangle formula is 2 * (length + width).'
        }
      }
    ]
  },
  {
    id: 'm2',
    moduleNumber: '02',
    title: 'Getting Started with Python',
    description: 'Setting up IDEs, anatomy of scripts, comments, indentation, and mastering the 3 types of errors.',
    icon: 'Terminal',
    topics: [
      {
        id: '2.1',
        topicNumber: '2.1',
        title: 'Downloading & Installation of Python IDE (PyCharm / VS Code)',
        category: 'Tooling',
        durationMinutes: 12,
        intro: {
          badge: 'Tooling 2.1',
          headline: 'Your Crafting Workbench: The IDE',
          summary: 'An Integrated Development Environment (IDE) provides an editor, debugger, syntax highlighter, and runner in one window.',
          analogy: 'Writing code in basic Notepad is like cooking with a pocket knife; an IDE like PyCharm is a fully equipped commercial kitchen.',
          keyTakeaways: [
            'Python official interpreter downloaded from python.org',
            'Popular IDEs: PyCharm by JetBrains, VS Code by Microsoft, and this browser Studio',
            'Virtual environments isolate package dependencies for different projects'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Getting started involves installing the Python interpreter and choosing an IDE tailored to your workflow.',
          keyPoints: [
            { title: 'The Interpreter', explanation: 'The engine that runs .py files. Verify with command `python --version` in terminal.' },
            { title: 'PyCharm Features', explanation: 'Smart code completion, inspections, graphical debugger, and built-in virtual environment manager.' },
            { title: 'Browser-Based Studios', explanation: 'Our interactive visualizer runs Python in-browser with zero local install required!' }
          ],
          codeExample: '# 2.1 Environment check script\nimport sys\nprint("Welcome to Python Studio!")\nprint("Python version info:", sys.version.split()[0] if hasattr(sys, "version") else "3.12")',
          codeExplanation: 'Verifies the active Python runtime environment and prints confirmation.',
          outputSample: 'Welcome to Python Studio!\nPython version info: 3.12'
        },
        exercise: {
          question: 'What does IDE stand for in software engineering?',
          options: [
            'Internal Data Engine',
            'Integrated Development Environment',
            'Interactive Debugger Extension',
            'Internet Domain Entity'
          ],
          correctOption: 1,
          explanation: 'IDE stands for Integrated Development Environment.'
        }
      },
      {
        id: '2.2',
        topicNumber: '2.2',
        title: 'Anatomy of a Python Program',
        category: 'Structure',
        durationMinutes: 10,
        intro: {
          badge: 'Structure 2.2',
          headline: 'The Skeleton of a Script',
          summary: 'Python scripts are composed of statements, expressions, variables, functions, and structured blocks defined by indentation.',
          analogy: 'Like sentences, paragraphs, and chapters in a book, Python uses lines, indentations, and functions to group ideas.',
          keyTakeaways: [
            'Shebang & Imports at the top of file',
            'Functions and global variables in the middle',
            'Main execution logic at the bottom',
            'No semicolons required at line endings!'
          ],
          conceptVisual: 'flow'
        },
        guide: {
          overview: 'Python relies on visual whitespace readability instead of curly braces {} or semicolons ;.',
          keyPoints: [
            { title: 'Statements vs Expressions', explanation: 'An expression evaluates to a value (5 + 3); a statement performs an action (print() or assignment).' },
            { title: 'Indentation Blocks', explanation: '4 spaces is the universal Python standard (PEP 8) for nested code.' }
          ],
          codeExample: '# 2.2 Anatomy of a Clean Script\n# 1. Variable definitions\nuser = "Maria"\nrole = "Explorer"\n\n# 2. Logic & statements\nif role == "Explorer":\n    # 3. Indented body\n    greeting = "Welcome aboard, " + user + "!"\n    print(greeting)',
          codeExplanation: 'Notice how the colon : signals the start of a block, followed by 4 indented spaces.',
          outputSample: 'Welcome aboard, Maria!'
        },
        exercise: {
          question: 'What character indicates the start of an indented code block in Python?',
          options: [
            'Semicolon ;',
            'Curly brace {',
            'Colon :',
            'Arrow ->'
          ],
          correctOption: 2,
          explanation: 'In Python, control statements (if, for, while, def) end with a colon : to begin the indented block.'
        }
      },
      {
        id: '2.3',
        topicNumber: '2.3',
        title: 'Write Your First "Hello World!" Script',
        category: 'First Steps',
        durationMinutes: 8,
        intro: {
          badge: 'Milestone 2.3',
          headline: 'The Rite of Passage of Every Programmer',
          summary: 'Since 1978, every programmer starts by commanding the machine to say "Hello World!".',
          analogy: 'Sending the first radio transmission across space: confirming the channel is alive.',
          keyTakeaways: [
            'Use the built-in print() function',
            'Enclose text inside single or double quotation marks',
            'Notice the absence of boilerplate: just 1 clean line!'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'While Java and C++ require 5+ lines of class boilerplate, Python requires just one single statement.',
          keyPoints: [
            { title: 'The print() function', explanation: 'Sends strings and evaluated data to the console output stream.' },
            { title: 'Quotation marks', explanation: 'Strings can use single \'Hello\' or double "Hello" quotes interchangeably.' }
          ],
          syntax: 'print("Hello, World!")',
          codeExample: '# 2.3 The Classic Hello World\nprint("Hello, World!")\nprint("Welcome to Python Practice Lab!")',
          codeExplanation: 'Executes the print command, sending text to the visualizer terminal output screen.',
          outputSample: 'Hello, World!\nWelcome to Python Practice Lab!'
        },
        exercise: {
          question: 'Which of the following will correctly print: Hello Python?',
          options: [
            'System.out.println("Hello Python")',
            'echo "Hello Python"',
            'print("Hello Python")',
            'Console.Write("Hello Python")'
          ],
          correctOption: 2,
          explanation: 'In Python, print("Hello Python") is the exact built-in command.'
        }
      },
      {
        id: '2.4',
        topicNumber: '2.4',
        title: 'Guidelines for Creating Scripts (Comments & Spacing)',
        category: 'PEP 8 Standards',
        durationMinutes: 10,
        intro: {
          badge: 'Best Practice 2.4',
          headline: 'Writing Code for Humans, Not Just Machines',
          summary: 'Readable code is maintainable code. Learn PEP 8 standards: comments with # and clean indentation.',
          analogy: 'Writing comments is leaving trail markers for yourself and team members hiking through the forest next month.',
          keyTakeaways: [
            '2.4.1 Single-line comments start with #; docstrings use triple quotes """',
            '2.4.2 Use 4 spaces per indentation level; never mix tabs and spaces',
            'Surround arithmetic operators with single spaces for readability'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'Code is read 10x more often than it is written. Following PEP 8 rules makes you a respected professional.',
          keyPoints: [
            { title: '2.4.1 Comments', explanation: 'Explain "why" code was written a certain way, not just "what" it is doing.' },
            { title: '2.4.2 Spacing & PEP 8', explanation: 'Two blank lines before top-level functions; one space around assignment operators (x = 5, not x=5).' }
          ],
          codeExample: '# 2.4 Clean Style Example\n# Calculate discounted price for summer sale\noriginal_price = 120.00\ndiscount_rate = 0.15  # 15% discount\n\n# Compute final customer invoice\nsavings = original_price * discount_rate\nfinal_price = original_price - savings\n\nprint("Original: $", original_price)\nprint("Discount: $", savings)\nprint("Final Pay: $", final_price)',
          codeExplanation: 'Notice how clear comments, meaningful variable names, and consistent spacing make the logic effortless to understand.',
          outputSample: 'Original: $ 120.0\nDiscount: $ 18.0\nFinal Pay: $ 102.0'
        },
        exercise: {
          question: 'How do you write a single-line comment in Python?',
          options: [
            '// this is a comment',
            '/* this is a comment */',
            '# this is a comment',
            '-- this is a comment'
          ],
          correctOption: 2,
          explanation: 'In Python, the hash symbol # indicates that the rest of the line is a comment ignored by the interpreter.'
        }
      },
      {
        id: '2.5',
        topicNumber: '2.5',
        title: 'Programming Errors: Syntax, Runtime & Logical',
        category: 'Debugging',
        durationMinutes: 15,
        intro: {
          badge: 'Debugging 2.5',
          headline: 'The 3 Beasts of the Coding Jungle',
          summary: 'Bugs happen to every programmer. Master the 3 categories: Syntax Errors, Runtime Errors, and Logical Errors.',
          analogy: 'Syntax: grammatical spelling mistake. Runtime: tripping over a rock mid-run. Logical: taking the wrong highway without realizing.',
          keyTakeaways: [
            '2.5.1 Syntax Error: Violates Python grammatical rules; fails before execution starts',
            '2.5.2 Runtime Error: Crashes during execution (e.g., dividing by zero, missing variable)',
            '2.5.3 Logical Error: Program runs smoothly to completion, but gives the wrong answer!'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Becoming a senior engineer is mostly about understanding error messages and methodically fixing them.',
          keyPoints: [
            { title: '2.5.1 Syntax Error', explanation: 'Missing colon :, unclosed parentheses, or misspelled keywords. Caught before any line executes.' },
            { title: '2.5.2 Runtime Error', explanation: 'ZeroDivisionError, NameError, TypeError, IndexError. Code starts running and blows up at runtime.' },
            { title: '2.5.3 Logical Error', explanation: 'Calculated average as (a + b / 2) instead of ((a + b) / 2). No error message is shown, but answer is wrong!' }
          ],
          codeExample: '# 2.5 Error Diagnostics\n# Correcting a runtime risk using safe checks:\na = 20\nb = 0\n\n# Guard against ZeroDivisionError (Runtime Error)\nif b != 0:\n    print("Result:", a / b)\nelse:\n    print("Caught Runtime Risk: Cannot divide by zero!")\n\n# Correcting a Logical Error (Parentheses precedence):\nscore1 = 80\nscore2 = 100\n# Correct formula: (score1 + score2) / 2\naverage = (score1 + score2) / 2\nprint("Accurate Average:", average)',
          codeExplanation: 'Demonstrates handling potential runtime exceptions and avoiding math operator precedence mistakes.',
          outputSample: 'Caught Runtime Risk: Cannot divide by zero!\nAccurate Average: 90.0'
        },
        exercise: {
          question: 'If a program executes completely without crashing, but outputs the wrong tax calculation, what kind of error occurred?',
          options: [
            'Syntax Error',
            'Runtime Error',
            'Logical Error',
            'Hardware Error'
          ],
          correctOption: 2,
          explanation: 'Logical errors occur when program logic is flawed; the computer does what you wrote, not what you intended.'
        }
      },
      {
        id: '2.6',
        topicNumber: '2.6',
        title: 'Module 02 Exercise: Debugging & Script Building',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 2.6',
          headline: 'Fixing the Broken Script',
          summary: 'Put on your detective hat to spot syntax, runtime, and logical bugs in real code.',
          analogy: 'Code inspection: clean the grease, tighten the screws, and make the engine purr.',
          keyTakeaways: [
            'Analyze traceback line numbers',
            'Check parentheses, colons, and quotation matches',
            'Validate output against expected mathematical results'
          ],
          conceptVisual: 'flow'
        },
        guide: {
          overview: 'Here is a script that converts temperature from Fahrenheit to Celsius using proper formatting and comments.',
          codeExample: '# 2.6 Temperature Converter Lab\n# Formula: C = (F - 32) * 5 / 9\nfahrenheit = 98.6\ncelsius = (fahrenheit - 32) * 5 / 9\n\nprint("Fahrenheit:", fahrenheit)\nprint("Celsius:", round(celsius, 2))\nprint("Normal Body Temp Confirmed!")',
          codeExplanation: 'Uses proper grouping with parentheses to guarantee correct operator order.',
          outputSample: 'Fahrenheit: 98.6\nCelsius: 37.0\nNormal Body Temp Confirmed!'
        },
        exercise: {
          question: 'Fix the formula: x = 10, y = 20, z = 30. Calculate average = (x + y + z) / 3.',
          starterCode: 'x = 10\ny = 20\nz = 30\navg = (x + y + z) / 3\nprint("Average is:", avg)',
          solutionCode: 'x = 10\ny = 20\nz = 30\navg = (x + y + z) / 3\nprint("Average is:", avg)',
          explanation: 'Summing all 3 variables in parentheses before dividing ensures accurate arithmetic.'
        }
      }
    ]
  },
  {
    id: 'm3',
    moduleNumber: '03',
    title: 'Variables & Operators',
    description: 'Data types, memory vessels, arithmetic fusion, type casting, Boolean logic, and comparison gates.',
    icon: 'Layers',
    topics: [
      {
        id: '3.1',
        topicNumber: '3.1',
        title: 'Variables in Python',
        category: 'Data Storage',
        durationMinutes: 10,
        intro: {
          badge: 'Concept 3.1',
          headline: 'Labeled Containers in Computer Memory',
          summary: 'A variable is a named reference pointing to a value stored in memory.',
          analogy: 'Imagine labeled storage boxes in a warehouse: label "age" points to box holding 25.',
          keyTakeaways: [
            'Variables store data that can change throughout program execution',
            'Python automatically creates the variable when you assign a value with =',
            'Variables do not require explicit type declaration (Dynamically Typed)'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'In Python, variables are actually pointers/references to objects in RAM. When you assign `x = 10`, Python allocates 10 in memory and binds name `x` to it.',
          keyPoints: [
            { title: 'Dynamic Typing', explanation: 'A variable holding an integer can later hold a string without any compiler error.' },
            { title: 'Garbage Collection', explanation: 'When no variable references a memory value, Python cleans it up automatically.' }
          ],
          codeExample: '# 3.1 Variables in action\nhero = "Spider-Man"\nage = 17\nis_avenger = True\n\nprint("Hero:", hero)\nprint("Age:", age)\nprint("Avenger status:", is_avenger)\n\n# Updating variable\nage = age + 1\nprint("Birthday! New Age:", age)',
          codeExplanation: 'Watch the memory vessel table in our Visualizer: the vessel "age" updates from 17 to 18 live.',
          outputSample: 'Hero: Spider-Man\nAge: 17\nAvenger status: True\nBirthday! New Age: 18'
        },
        exercise: {
          question: 'What happens when you reassign an existing variable with a new value in Python?',
          options: [
            'The computer throws an error',
            'The variable updates to reference the new value',
            'The computer creates a duplicate with _copy',
            'The file gets deleted'
          ],
          correctOption: 1,
          explanation: 'Variables are mutable references; reassigning them simply updates what value they point to.'
        }
      },
      {
        id: '3.2',
        topicNumber: '3.2',
        title: 'Rules and Guidelines for Creating Variables',
        category: 'Naming Conventions',
        durationMinutes: 10,
        intro: {
          badge: 'Rules 3.2',
          headline: 'The Grammar of Variable Names',
          summary: 'Python strictly enforces naming rules and conventions (snake_case) to avoid syntax collisions.',
          analogy: 'Like naming a newborn: you can’t name them a punctuation mark or a reserved government title!',
          keyTakeaways: [
            'Must start with a letter (a-z, A-Z) or underscore (_); NEVER a digit',
            'Contains only letters, numbers, and underscores (no spaces or hyphens)',
            'Case-sensitive: age, Age, and AGE are three completely distinct variables',
            'Cannot be a Python reserved keyword (like if, for, class, while, import)'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'Follow PEP 8 convention: use descriptive `snake_case` (e.g., `user_account_balance`) for readability.',
          keyPoints: [
            { title: 'Valid Names', explanation: 'user_name, _count, score_2, totalMarks' },
            { title: 'Invalid Names', explanation: '2fast (starts with digit), user-name (hyphen is minus), class (keyword)' }
          ],
          codeExample: '# 3.2 Variable Naming Standards\n# Valid snake_case variables\nstudent_first_name = "Maya"\ntotal_exam_score = 94\n_internal_flag = True\n\nprint("Student:", student_first_name)\nprint("Score:", total_exam_score)',
          codeExplanation: 'Using descriptive names self-documents code so teammates understand without asking questions.',
          outputSample: 'Student: Maya\nScore: 94'
        },
        exercise: {
          question: 'Which of the following is an INVALID variable name in Python?',
          options: [
            'total_score',
            '2nd_player',
            '_hidden_var',
            'player2'
          ],
          correctOption: 1,
          explanation: 'Variable names cannot start with a digit. 2nd_player causes a SyntaxError.'
        }
      },
      {
        id: '3.3',
        topicNumber: '3.3',
        title: 'Assignment Operator (=, +=, -=, *=, /=)',
        category: 'Operators',
        durationMinutes: 10,
        intro: {
          badge: 'Operators 3.3',
          headline: 'Transferring Energy into Vessels',
          summary: 'The single equal sign = stores the right-hand value into the left-hand variable.',
          analogy: 'Water flowing from a jug (right) into a cup (left). Augmented operators (+=) are quick refills.',
          keyTakeaways: [
            '= is assignment; == is comparison testing equality',
            'Augmented assignment: x += 5 is shorthand for x = x + 5',
            'Right-hand side evaluates first before storing in the left variable'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'The assignment operator is the fundamental mechanism of state change in imperative programming.',
          keyPoints: [
            { title: 'Standard Assignment', explanation: '`x = 10` evaluates 10 and stores in x.' },
            { title: 'Augmented Addition (+=)', explanation: '`score += 10` adds 10 to current score.' },
            { title: 'Augmented Multiplication (*=)', explanation: '`multiplier *= 2` doubles the current value.' }
          ],
          codeExample: '# 3.3 Assignment & Augmented Operators\ngold_coins = 100\nprint("Starting coins:", gold_coins)\n\ngold_coins += 50   # Found treasure!\nprint("After loot (+50):", gold_coins)\n\ngold_coins -= 30   # Bought a potion\nprint("After shop (-30):", gold_coins)\n\ngold_coins *= 2    # Double coin spell!\nprint("After spell (*2):", gold_coins)',
          codeExplanation: 'Step through this in the Visualizer to see the living vessel fuse the old value with the increment.',
          outputSample: 'Starting coins: 100\nAfter loot (+50): 150\nAfter shop (-30): 120\nAfter spell (*2): 240'
        },
        exercise: {
          question: 'If count = 5, what is the value of count after executing: count += 3 * 2?',
          options: [
            '16',
            '11',
            '10',
            '15'
          ],
          correctOption: 1,
          explanation: 'Right hand side evaluates 3 * 2 = 6, then count = 5 + 6 = 11.'
        }
      },
      {
        id: '3.4',
        topicNumber: '3.4',
        title: 'Multiple Assignments',
        category: 'Python Idioms',
        durationMinutes: 8,
        intro: {
          badge: 'Idiom 3.4',
          headline: 'Assigning Multiple Vessels at Once',
          summary: 'Python allows assigning multiple variables in a single elegant line.',
          analogy: 'A conveyor belt dropping 3 colored balls into 3 separate baskets simultaneously.',
          keyTakeaways: [
            'Multiple assignment: a, b, c = 1, 2, 3',
            'Same value assignment: x = y = z = 0',
            'Instant value swapping without temporary variables: a, b = b, a'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'Multiple assignment uses tuple packing and unpacking under the hood to assign cleanly.',
          codeExample: '# 3.4 Multiple Assignment & Swapping\n# 1. Assign different values\nx, y, z = 10, 20, 30\nprint("x, y, z:", x, y, z)\n\n# 2. Assign identical value\np1 = p2 = p3 = 100\nprint("Scores:", p1, p2, p3)\n\n# 3. Swap in 1 line\nx, y = y, x\nprint("After swap -> x:", x, "y:", y)',
          codeExplanation: 'Values on the right are bundled into a tuple and cleanly unpacked into left variables.',
          outputSample: 'x, y, z: 10 20 30\nScores: 100 100 100\nAfter swap -> x: 20 y: 10'
        },
        exercise: {
          question: 'What is the output of: a, b = 5, 10; a, b = b, a + b; print(a, b)?',
          options: [
            '10 15',
            '5 15',
            '10 10',
            '5 10'
          ],
          correctOption: 0,
          explanation: 'a gets old b (10); b gets old a + b (5 + 10 = 15).'
        }
      },
      {
        id: '3.5',
        topicNumber: '3.5',
        title: 'Use of Built-in Function: type()',
        category: 'Inspection',
        durationMinutes: 8,
        intro: {
          badge: 'Inspection 3.5',
          headline: 'Peering Inside the Vessel’s DNA',
          summary: 'The type() function reveals what kind of data an object holds: int, float, str, bool, list.',
          analogy: 'Using an X-ray scanner on an unmarked cargo container to see if it holds liquid, solid, or text.',
          keyTakeaways: [
            'int: whole integers (-5, 0, 42)',
            'float: decimal numbers (3.14, -0.5)',
            'str: character sequences ("Hello")',
            'bool: binary truth flags (True, False)'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'Because Python is dynamically typed, checking types with `type()` helps debug unexpected errors.',
          codeExample: '# 3.5 Checking Data Types\nwhole_num = 42\ndecimal_num = 3.14159\ntext_data = "Python"\nis_active = True\nitem_list = [1, 2, 3]\n\nprint("whole_num type:", type(whole_num))\nprint("decimal_num type:", type(decimal_num))\nprint("text_data type:", type(text_data))\nprint("is_active type:", type(is_active))\nprint("item_list type:", type(item_list))',
          codeExplanation: 'type() inspects the internal class signature of each variable.',
          outputSample: "whole_num type: <class 'int'>\ndecimal_num type: <class 'float'>\ntext_data type: <class 'str'>\nis_active type: <class 'bool'>\nitem_list type: <class 'list'>"
        },
        exercise: {
          question: 'What is the type of variable x = "123"?',
          options: [
            'int',
            'float',
            'str',
            'bool'
          ],
          correctOption: 2,
          explanation: 'Because 123 is wrapped inside quotes, its data type is string (str).'
        }
      },
      {
        id: '3.6',
        topicNumber: '3.6',
        title: 'Arithmetic Operators (+, -, *, /, //, %, **)',
        category: 'Math Reactor',
        durationMinutes: 12,
        intro: {
          badge: 'Math 3.6',
          headline: 'The 7 Core Arithmetic Reactors',
          summary: 'Python provides 7 arithmetic operators for mathematical calculations, including floor division and power.',
          analogy: 'Mathematical gears turning and meshing: addition fuses, division slices, modulo captures remainders.',
          keyTakeaways: [
            '+ (Addition), - (Subtraction), * (Multiplication)',
            '/ (True Division -> always yields a float, e.g. 7 / 2 = 3.5)',
            '// (Floor Division -> rounds down to whole number, e.g. 7 // 2 = 3)',
            '% (Modulus -> returns remainder, e.g. 7 % 2 = 1)',
            '** (Exponentiation -> power, e.g. 2 ** 3 = 8)'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Mastering the difference between `/`, `//`, and `%` is essential for loops, clock math, and indexing.',
          codeExample: '# 3.6 Complete Arithmetic Tour\na = 17\nb = 5\n\nprint("a + b  =", a + b)   # 22\nprint("a - b  =", a - b)   # 12\nprint("a * b  =", a * b)   # 85\nprint("a / b  =", a / b)   # 3.4 (True float division)\nprint("a // b =", a // b)  # 3   (Floor division)\nprint("a % b  =", a % b)   # 2   (Remainder / modulo)\nprint("a ** 2 =", a ** 2)  # 289 (Exponentiation: 17 squared)',
          codeExplanation: 'Floor division drops any fractional remainder. Modulo returns what was left over.',
          outputSample: 'a + b  = 22\na - b  = 12\na * b  = 85\na / b  = 3.4\na // b = 3\na % b  = 2\na ** 2 = 289'
        },
        exercise: {
          question: 'What is the result of 19 % 4 in Python?',
          options: [
            '4',
            '3',
            '4.75',
            '1'
          ],
          correctOption: 1,
          explanation: '19 divided by 4 is 4 with a remainder of 3. Modulo % returns the remainder 3.'
        }
      },
      {
        id: '3.7',
        topicNumber: '3.7',
        title: 'Type Conversion vs Type Casting',
        category: 'Transformation',
        durationMinutes: 12,
        intro: {
          badge: 'Transform 3.7',
          headline: 'Implicit Harmony vs Explicit Alchemy',
          summary: 'Conversion is automatic by Python (Implicit); Casting is manual by the programmer using int(), float(), str() (Explicit).',
          analogy: 'Conversion: Ice melting into water when heated. Casting: Pouring liquid metal into a defined mold.',
          keyTakeaways: [
            'Implicit Conversion: Python automatically turns int + float into float without losing precision',
            'Explicit Casting: You call int("25"), str(100), or float(15)',
            'Casting invalid text like int("hello") triggers a ValueError'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'User input from `input()` always arrives as a `str`. To do math with it, you must explicitly cast it.',
          codeExample: '# 3.7 Conversion vs Casting\n# 1. Implicit Conversion (Automatic)\nx = 10     # int\ny = 2.5    # float\nz = x + y  # Python automatically promotes z to float (12.5)\nprint("z value:", z, "type:", type(z))\n\n# 2. Explicit Type Casting (Manual)\nage_str = "25"\nage_num = int(age_str)  # Cast str -> int\nprint("Age in 5 years:", age_num + 5)\n\n# Float to Int (Truncates decimals)\npi = 3.99\nint_pi = int(pi)  # Drops .99 -> 3\nprint("Truncated pi:", int_pi)',
          codeExplanation: 'Demonstrates both automatic type promotion and manual casting methods.',
          outputSample: "z value: 12.5 type: <class 'float'>\nAge in 5 years: 30\nTruncated pi: 3"
        },
        exercise: {
          question: 'What happens when you execute int(5.8) in Python?',
          options: [
            'It rounds up to 6',
            'It truncates the decimal and returns 5',
            'It throws a TypeError',
            'It returns 5.0'
          ],
          correctOption: 1,
          explanation: 'int() truncates towards zero, removing the fractional component entirely.'
        }
      },
      {
        id: '3.8',
        topicNumber: '3.8',
        title: 'Boolean Operator (bool, True, False, truthy/falsy)',
        category: 'Logic',
        durationMinutes: 10,
        intro: {
          badge: 'Logic 3.8',
          headline: 'The Light Switch of Computing',
          summary: 'Booleans represent one of two binary states: True or False.',
          analogy: 'A light switch is either ON or OFF. In Python, empty things are falsy, populated things are truthy.',
          keyTakeaways: [
            'Keywords must be capitalized: True and False',
            'Falsy values: 0, 0.0, "", [], None, False',
            'Truthy values: Any non-zero number, non-empty text or list'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Every Python expression can be evaluated inside an `if` condition using truthiness.',
          codeExample: '# 3.8 Boolean Logic & Truthiness\nis_sunny = True\nis_raining = False\n\nprint("Sunny?", is_sunny)\nprint("bool(0):", bool(0))\nprint("bool(42):", bool(42))\nprint("bool(\"\") [empty string]:", bool(""))\nprint("bool(\"Python\"): ", bool("Python"))\nprint("bool([]):", bool([]))',
          codeExplanation: 'Demonstrates Python truthiness conversion across zero, non-zero, empty, and non-empty elements.',
          outputSample: 'Sunny? True\nbool(0): False\nbool(42): True\nbool("") [empty string]: False\nbool("Python"):  True\nbool([]): False'
        },
        exercise: {
          question: 'Which of the following evaluates to True in Python?',
          options: [
            'bool(0)',
            'bool("")',
            'bool("False")',
            'bool([])'
          ],
          correctOption: 2,
          explanation: 'The string "False" is non-empty! Any non-empty string evaluates to True.'
        }
      },
      {
        id: '3.9',
        topicNumber: '3.9',
        title: 'Logical & Comparison Operators (==, !=, <, >, <=, >=, and, or, not)',
        category: 'Decision Gates',
        durationMinutes: 15,
        intro: {
          badge: 'Gates 3.9',
          headline: 'Constructing Complex Decision Trees',
          summary: 'Comparison operators compare two values; Logical operators combine multiple boolean statements.',
          analogy: 'Security check at an airport: Passport valid AND Ticket confirmed OR VIP clearance.',
          keyTakeaways: [
            'Comparison: == (equal), != (not equal), <, >, <=, >=',
            'and: Returns True only if BOTH conditions are True',
            'or: Returns True if AT LEAST ONE condition is True',
            'not: Inverts truth state (not True -> False)'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Logical gates determine which branch in your code opens. Watch the Decision Gate animation in the studio.',
          codeExample: '# 3.9 Comparison & Logical Operators\nage = 20\nhas_license = True\n\n# Comparison\nprint("Is adult (>= 18):", age >= 18)\n\n# Logical AND\ncan_drive = (age >= 18) and has_license\nprint("Can drive independently:", can_drive)\n\n# Logical OR\nhas_permit = False\ncan_practice = (age >= 16) and (has_license or has_permit)\nprint("Can practice driving:", can_practice)\n\n# Logical NOT\nprint("not has_license:", not has_license)',
          codeExplanation: 'Combines multiple comparisons into a single clear boolean outcome.',
          outputSample: 'Is adult (>= 18): True\nCan drive independently: True\nCan practice driving: True\nnot has_license: False'
        },
        exercise: {
          question: 'What is the result of: (5 > 3) and (2 > 10)?',
          options: [
            'True',
            'False',
            'None',
            'Error'
          ],
          correctOption: 1,
          explanation: '5 > 3 is True, but 2 > 10 is False. For `and`, both must be True. Result is False.'
        }
      },
      {
        id: '3.10',
        topicNumber: '3.10',
        title: 'Module 03 Exercise: Calculator Challenge',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 3.10',
          headline: 'Building an Interactive Logic Engine',
          summary: 'Test all variables, arithmetic, casting, and comparison operators in one challenge.',
          analogy: 'Putting the full electrical circuit together.',
          keyTakeaways: [
            'Cast input types appropriately',
            'Apply modulo and floor division',
            'Formulate boolean status flags'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Write a script that takes total seconds and breaks it down into hours, minutes, and remaining seconds.',
          codeExample: '# 3.10 Time Breakdown Lab\ntotal_seconds = 7532\n\nhours = total_seconds // 3600\nremaining_seconds = total_seconds % 3600\nminutes = remaining_seconds // 60\nseconds = remaining_seconds % 60\n\nprint("Total Seconds:", total_seconds)\nprint("Hours:", hours)\nprint("Minutes:", minutes)\nprint("Seconds:", seconds)\nprint("Time Format:", hours, "h", minutes, "m", seconds, "s")',
          codeExplanation: 'Uses floor division // to extract full units and modulo % to isolate remainder.',
          outputSample: 'Total Seconds: 7532\nHours: 2\nMinutes: 5\nSeconds: 32\nTime Format: 2 h 5 m 32 s'
        },
        exercise: {
          question: 'Write a script to check if number 24 is even and greater than 20.',
          starterCode: 'num = 24\nis_even = (num % 2 == 0)\nis_greater = (num > 20)\nresult = is_even and is_greater\nprint("Passes check?", result)',
          solutionCode: 'num = 24\nis_even = (num % 2 == 0)\nis_greater = (num > 20)\nresult = is_even and is_greater\nprint("Passes check?", result)',
          explanation: 'num % 2 == 0 checks evenness; num > 20 checks range. Combined with and.'
        }
      }
    ]
  },
  {
    id: 'm4',
    moduleNumber: '04',
    title: 'Strings',
    description: 'String manipulation, concatenation, repetition, indexing, and all core built-in string methods.',
    icon: 'Type',
    topics: [
      {
        id: '4.1',
        topicNumber: '4.1',
        title: 'Understanding Strings & Indexing',
        category: 'Text Anatomy',
        durationMinutes: 10,
        intro: {
          badge: 'Text 4.1',
          headline: 'Strings as Sequences of Characters',
          summary: 'A string is an immutable sequence of characters accessible by 0-based index or negative index.',
          analogy: 'A train with numbered passenger cars: Car 0 is first, Car -1 is the caboose at the rear.',
          keyTakeaways: [
            'Zero-based indexing: first character is at index 0',
            'Negative indexing: last character is at index -1',
            'Strings are immutable: you cannot modify characters in-place (word[0] = "X" fails)'
          ],
          conceptVisual: 'string'
        },
        guide: {
          overview: 'Strings are fundamental to data processing. Every user input, file, and web response begins as a string.',
          codeExample: '# 4.1 String Indexing\nword = "Python"\n\nprint("First character [0]:", word[0])\nprint("Second character [1]:", word[1])\nprint("Last character [-1]:", word[-1])\nprint("Second-to-last [-2]:", word[-2])\nprint("String length:", len(word))',
          codeExplanation: 'Demonstrates positive forward indexing and negative backward indexing.',
          outputSample: 'First character [0]: P\nSecond character [1]: y\nLast character [-1]: n\nSecond-to-last [-2]: o\nString length: 6'
        },
        exercise: {
          question: 'If s = "PROGRAM", what character is at s[-2]?',
          options: [
            'M',
            'A',
            'R',
            'G'
          ],
          correctOption: 1,
          explanation: 'Negative indexing counts from the right: -1 is M, -2 is A.'
        }
      },
      {
        id: '4.2',
        topicNumber: '4.2',
        title: 'Combine (+) vs Repeat (*) Strings',
        category: 'String Ops',
        durationMinutes: 8,
        intro: {
          badge: 'Ops 4.2',
          headline: 'Stitching and Cloner Gears',
          summary: 'Use the + operator to concatenate strings and the * operator to repeat them multiple times.',
          analogy: '+ glue sticks two paper strips together. * is a photocopying machine stamping copies.',
          keyTakeaways: [
            'Concatenation: "Py" + "thon" -> "Python"',
            'Repetition: "ha" * 3 -> "hahaha"',
            'Cannot concatenate string with an integer without casting: "Age: " + str(20)'
          ],
          conceptVisual: 'string'
        },
        guide: {
          overview: 'String arithmetic behaves differently than number arithmetic; operators adapt polymorphically to data types.',
          codeExample: '# 4.2 Combine vs Repeat\nfirst = "Super"\nsecond = "Hero"\n\n# Concatenation (+)\nfull = first + " " + second\nprint("Combined:", full)\n\n# Repetition (*)\nbanner = "=" * 25\nprint(banner)\nprint("CHEER:", "Go! " * 3)\nprint(banner)',
          codeExplanation: 'Shows clean visual formatting using string multiplication.',
          outputSample: 'Combined: Super Hero\n=========================\nCHEER: Go! Go! Go! \n========================='
        },
        exercise: {
          question: 'What is the output of print("Hi" * 2 + "!")?',
          options: [
            'HiHi!',
            'Hi2!',
            'Hi!',
            'Error'
          ],
          correctOption: 0,
          explanation: '"Hi" * 2 produces "HiHi", then + "!" appends "!" to make "HiHi!".'
        }
      },
      {
        id: '4.3',
        topicNumber: '4.3',
        title: 'String Built-in Methods (capitalize, len, lower, upper, strip, replace, startswith, endswith)',
        category: 'Methods Toolkit',
        durationMinutes: 18,
        intro: {
          badge: 'Methods 4.3',
          headline: 'The Master Swiss Army Knife of Text',
          summary: 'Built-in methods let you transform case, trim whitespace, replace substrings, and test prefixes.',
          analogy: 'Text refinery machine: cleans the dirt (strip), sets case (upper/lower), and swaps parts (replace).',
          keyTakeaways: [
            'capitalize(): First letter uppercase, rest lowercase',
            'len(): Returns total count of characters including spaces',
            'lower() & upper(): Normalizes case for search matching',
            'strip(): Removes leading and trailing whitespace',
            'replace(old, new): Substitutes occurrences',
            'startswith(prefix) & endswith(suffix): Returns True or False'
          ],
          conceptVisual: 'string'
        },
        guide: {
          overview: 'Remember: strings are immutable, so all string methods return a brand new string without modifying the original in place.',
          codeExample: '# 4.3 Essential String Methods in Action\nraw_email = "   User_Test@Example.COM   "\n\n# 1. strip() to clean whitespace\nclean_email = raw_email.strip()\nprint("Stripped:", clean_email)\n\n# 2. lower() to normalize\nnormalized = clean_email.lower()\nprint("Lowercased:", normalized)\n\n# 3. capitalize()\nword = "python lab"\nprint("Capitalized:", word.capitalize())\n\n# 4. replace()\nupdated = normalized.replace("example.com", "gmail.com")\nprint("Replaced domain:", updated)\n\n# 5. startswith() and endswith()\nprint("Starts with user?:", normalized.startswith("user"))\nprint("Ends with .com?:", normalized.endswith(".com"))\nprint("Total length:", len(normalized))',
          codeExplanation: 'Applies real-world data sanitization using the required curriculum methods.',
          outputSample: 'Stripped: User_Test@Example.COM\nLowercased: user_test@example.com\nCapitalized: Python lab\nReplaced domain: user_test@gmail.com\nStarts with user?: True\nEnds with .com?: True\nTotal length: 22'
        },
        exercise: {
          question: 'What does "  hello  ".strip().upper() return?',
          options: [
            '"  HELLO  "',
            '"HELLO"',
            '"Hello"',
            '"  hello  "'
          ],
          correctOption: 1,
          explanation: 'strip() removes the surrounding spaces to yield "hello", and upper() converts to "HELLO".'
        }
      },
      {
        id: '4.4',
        topicNumber: '4.4',
        title: 'Module 04 Exercise: Text Sanitizer & Validator',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 4.4',
          headline: 'Building a Form Data Cleaner',
          summary: 'Combine string methods to clean messy user input and validate file formats.',
          analogy: 'Quality control inspector on a text pipeline.',
          keyTakeaways: [
            'Chain methods: .strip().lower()',
            'Validate file extensions with endswith()',
            'Replace placeholders in template strings'
          ],
          conceptVisual: 'string'
        },
        guide: {
          overview: 'Write a script that validates whether an uploaded filename is an approved Python script (.py) and formats a success confirmation.',
          codeExample: '# 4.4 File Validator Lab\nfilename = "   my_project_script.PY   "\n\n# Step 1: Clean\nclean_name = filename.strip().lower()\n\n# Step 2: Validate extension\nis_python = clean_name.endswith(".py")\n\nif is_python:\n    print("Valid Python File:", clean_name)\n    module_name = clean_name.replace(".py", "")\n    print("Module Identifier:", module_name.capitalize())\nelse:\n    print("Error: Invalid file format!")',
          codeExplanation: 'Demonstrates chaining string cleaning and suffix validation.',
          outputSample: 'Valid Python File: my_project_script.py\nModule Identifier: My_project_script'
        },
        exercise: {
          question: 'Check if sentence starts with "Hello" after stripping leading spaces.',
          starterCode: 'text = "   Hello World"\nis_valid = text.strip().startswith("Hello")\nprint("Valid greeting?", is_valid)',
          solutionCode: 'text = "   Hello World"\nis_valid = text.strip().startswith("Hello")\nprint("Valid greeting?", is_valid)',
          explanation: 'Chaining .strip().startswith("Hello") ensures leading spaces do not invalidate check.'
        }
      }
    ]
  },
  {
    id: 'm5',
    moduleNumber: '05',
    title: 'Lists',
    description: 'Ordered mutable collections, forward vs backward indexing, modifying items, slicing, and membership testing.',
    icon: 'List',
    topics: [
      {
        id: '5.1',
        topicNumber: '5.1',
        title: 'Understanding Lists',
        category: 'Collections',
        durationMinutes: 10,
        intro: {
          badge: 'List 5.1',
          headline: 'Dynamic Ordered Capsules',
          summary: 'A list is an ordered, mutable collection of items enclosed in square brackets [].',
          analogy: 'A train of cargo containers linked together: you can add cars, swap cars, and inspect cars.',
          keyTakeaways: [
            'Defined with square brackets: nums = [10, 20, 30]',
            'Lists are mutable: you can change their contents in place',
            'Can hold mixed data types (integers, strings, booleans, other lists)'
          ],
          conceptVisual: 'list'
        },
        guide: {
          overview: 'Lists are Python’s primary dynamic array. They grow and shrink in memory automatically as needed.',
          codeExample: '# 5.1 Creating and Inspecting Lists\nfruits = ["Apple", "Banana", "Cherry", "Mango"]\nprint("Full list:", fruits)\nprint("Total fruits:", len(fruits))\nprint("First fruit:", fruits[0])\nprint("Last fruit:", fruits[-1])',
          codeExplanation: 'Demonstrates creating a 4-item list and inspecting length and boundaries.',
          outputSample: 'Full list: [\'Apple\', \'Banana\', \'Cherry\', \'Mango\']\nTotal fruits: 4\nFirst fruit: Apple\nLast fruit: Mango'
        },
        exercise: {
          question: 'Are lists in Python mutable or immutable?',
          options: [
            'Immutable (cannot be modified)',
            'Mutable (can be modified in-place)',
            'Only numbers are mutable',
            'Only strings are mutable'
          ],
          correctOption: 1,
          explanation: 'Lists are mutable. You can add, remove, and update items in-place.'
        }
      },
      {
        id: '5.2',
        topicNumber: '5.2',
        title: 'Forward vs Backward Accessing',
        category: 'Indexing',
        durationMinutes: 10,
        intro: {
          badge: 'Indexing 5.2',
          headline: 'Two-Way Navigation on the Runway',
          summary: 'Access items from the start using positive 0-based index or from the end using negative index.',
          analogy: 'Walking forward down an aisle (Seat 0, 1, 2) or looking backward from the emergency exit (Seat -1, -2).',
          keyTakeaways: [
            'Forward index: 0, 1, 2, ..., len(list) - 1',
            'Backward index: -1, -2, -3, ..., -len(list)',
            'Accessing an index out of bounds raises an IndexError'
          ],
          conceptVisual: 'list'
        },
        guide: {
          overview: 'Backward indexing eliminates the need for awkward `list[len(list) - 1]` syntax common in other languages.',
          codeExample: '# 5.2 Forward vs Backward Accessing\nscores = [85, 92, 78, 96, 88]\n\n# Forward\nprint("First score [0]:", scores[0])\nprint("Second score [1]:", scores[1])\n\n# Backward\nprint("Last score [-1]:", scores[-1])\nprint("Second last score [-2]:", scores[-2])',
          codeExplanation: 'Shows forward and backward indexing side by side.',
          outputSample: 'First score [0]: 85\nSecond score [1]: 92\nLast score [-1]: 88\nSecond last score [-2]: 96'
        },
        exercise: {
          question: 'In a list with 5 elements, what is the forward index of the last element?',
          options: [
            '5',
            '4',
            '-5',
            '0'
          ],
          correctOption: 1,
          explanation: 'Because lists start at 0, a 5-element list has indices 0, 1, 2, 3, and 4.'
        }
      },
      {
        id: '5.3',
        topicNumber: '5.3',
        title: 'Changing, Removing and Adding Elements (append, insert, remove, pop)',
        category: 'Mutation',
        durationMinutes: 15,
        intro: {
          badge: 'Mutation 5.3',
          headline: 'Rearranging the Linked Capsules',
          summary: 'Modify existing items via index, add new ones with append()/insert(), and remove with remove()/pop().',
          analogy: 'A train depot: uncoupling a car, coupling a new caboose, or swapping a cargo container.',
          keyTakeaways: [
            'Change: list[index] = new_value',
            'append(item): Adds item to the very end',
            'insert(index, item): Inserts item at specified position',
            'remove(value): Searches and deletes first matching value',
            'pop(): Removes and returns the last item'
          ],
          conceptVisual: 'list'
        },
        guide: {
          overview: 'Mastering list mutation methods allows managing dynamic collections of data easily.',
          codeExample: '# 5.3 Mutating List Elements\ntodos = ["Task A", "Task B", "Task C"]\n\n# 1. Update item\ntodos[1] = "Task B (Updated)"\nprint("After update:", todos)\n\n# 2. append()\ntodos.append("Task D")\nprint("After append:", todos)\n\n# 3. insert()\ntodos.insert(0, "Urgent Task 0")\nprint("After insert at 0:", todos)\n\n# 4. remove() by value\ntodos.remove("Task C")\nprint("After remove Task C:", todos)\n\n# 5. pop() removes last\ncompleted = todos.pop()\nprint("Popped:", completed)\nprint("Remaining:", todos)',
          codeExplanation: 'Steps through all 4 mutation operations with printouts.',
          outputSample: 'After update: [\'Task A\', \'Task B (Updated)\', \'Task C\']\nAfter append: [\'Task A\', \'Task B (Updated)\', \'Task C\', \'Task D\']\nAfter insert at 0: [\'Urgent Task 0\', \'Task A\', \'Task B (Updated)\', \'Task C\', \'Task D\']\nAfter remove Task C: [\'Urgent Task 0\', \'Task A\', \'Task B (Updated)\', \'Task D\']\nPopped: Task D\nRemaining: [\'Urgent Task 0\', \'Task A\', \'Task B (Updated)\']'
        },
        exercise: {
          question: 'Which method removes and returns the last element of a list?',
          options: [
            'remove()',
            'pop()',
            'delete()',
            'shift()'
          ],
          correctOption: 1,
          explanation: 'pop() removes and returns the last element (or an element at a given index).'
        }
      },
      {
        id: '5.4',
        topicNumber: '5.4',
        title: 'Slice a List [start:stop:step]',
        category: 'Slicing',
        durationMinutes: 12,
        intro: {
          badge: 'Slicing 5.4',
          headline: 'Laser-Slicing Subsets of Data',
          summary: 'Extract a portion of a list using slice syntax: list[start:stop] where stop index is non-inclusive.',
          analogy: 'Cutting a piece of bread from loaf: from slice 1 up to slice 4.',
          keyTakeaways: [
            'list[start:stop]: From start up to (but excluding) stop',
            'Omit start: list[:3] gets from beginning up to index 3',
            'Omit stop: list[2:] gets from index 2 to the end',
            'Negative slice: list[-3:] extracts the last 3 items'
          ],
          conceptVisual: 'list'
        },
        guide: {
          overview: 'Slicing produces a new shallow copy of the sublist without altering the original list.',
          codeExample: '# 5.4 Slicing Demonstrations\nnums = [10, 20, 30, 40, 50, 60, 70]\n\nprint("Original list:", nums)\nprint("Slice [1:4]:", nums[1:4])   # indices 1, 2, 3 -> [20, 30, 40]\nprint("First 3 [:3]:", nums[:3])   # [10, 20, 30]\nprint("From index 4 [4:]:", nums[4:]) # [50, 60, 70]\nprint("Last two [-2:]:", nums[-2:]) # [60, 70]',
          codeExplanation: 'Illustrates boundary rules: the stop index is always excluded.',
          outputSample: 'Original list: [10, 20, 30, 40, 50, 60, 70]\nSlice [1:4]: [20, 30, 40]\nFirst 3 [:3]: [10, 20, 30]\nFrom index 4 [4:]: [50, 60, 70]\nLast two [-2:]: [60, 70]'
        },
        exercise: {
          question: 'What is returned by [1, 2, 3, 4, 5][1:3]?',
          options: [
            '[1, 2, 3]',
            '[2, 3]',
            '[2, 3, 4]',
            '[1, 2]'
          ],
          correctOption: 1,
          explanation: 'Starts at index 1 (value 2) and stops before index 3 (values 2, 3).'
        }
      },
      {
        id: '5.5',
        topicNumber: '5.5',
        title: 'Membership Operator: in vs not in',
        category: 'Membership',
        durationMinutes: 10,
        intro: {
          badge: 'Operators 5.5',
          headline: 'Checking Guest List Clearance',
          summary: 'Use in and not in to test whether an item exists inside a list or collection in a readable manner.',
          analogy: 'Bouncer checking the VIP guest list at the door: is your name in the list?',
          keyTakeaways: [
            'item in list: Returns True if item exists, False otherwise',
            'item not in list: Returns True if item is missing',
            'Works seamlessly on both lists and strings'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Membership operators make conditional checks readable without needing manual for-loop searches.',
          codeExample: '# 5.5 Membership Testing\nallowed_roles = ["admin", "editor", "moderator"]\ncurrent_user = "guest"\n\nprint("Is guest allowed?:", current_user in allowed_roles)\nprint("Is guest restricted?:", current_user not in allowed_roles)\n\nif "admin" in allowed_roles:\n    print("Access Granted: Admin rights present")',
          codeExplanation: 'Shows boolean outcomes for both in and not in checks.',
          outputSample: 'Is guest allowed?: False\nIs guest restricted?: True\nAccess Granted: Admin rights present'
        },
        exercise: {
          question: 'What is the result of "banana" in ["apple", "cherry"]?',
          options: [
            'True',
            'False',
            'None',
            'ValueError'
          ],
          correctOption: 1,
          explanation: '"banana" is not present in the list, so in returns False.'
        }
      },
      {
        id: '5.6',
        topicNumber: '5.6',
        title: 'Module 05 Exercise: Inventory Management',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 5.6',
          headline: 'Building an Inventory Warehouse',
          summary: 'Implement a real-world inventory manager tracking stock additions, sales, and catalog searches.',
          analogy: 'Managing warehouse crates.',
          keyTakeaways: [
            'Maintain list state dynamically',
            'Combine membership testing with append and remove',
            'Slice top products for display'
          ],
          conceptVisual: 'list'
        },
        guide: {
          overview: 'Build an inventory tracker that registers products, checks stock, and removes sold items.',
          codeExample: '# 5.6 Inventory Management Lab\ninventory = ["Laptop", "Mouse", "Keyboard", "Monitor"]\n\n# Customer buys Mouse\nif "Mouse" in inventory:\n    inventory.remove("Mouse")\n    print("Sold: Mouse")\n\n# New shipment arrived\ninventory.append("Headset")\n\n# Sort alphabetically\ninventory.sort()\nprint("Updated Inventory:", inventory)\nprint("Total items in stock:", len(inventory))',
          codeExplanation: 'Demonstrates a complete workflow of checking, removing, adding, and sorting a list.',
          outputSample: 'Sold: Mouse\nUpdated Inventory: [\'Headset\', \'Keyboard\', \'Laptop\', \'Monitor\']\nTotal items in stock: 4'
        },
        exercise: {
          question: 'Given cart = ["shoes", "hat"], append "shirt" and check if "hat" is in cart.',
          starterCode: 'cart = ["shoes", "hat"]\ncart.append("shirt")\nprint("Has hat?", "hat" in cart)\nprint("Cart:", cart)',
          solutionCode: 'cart = ["shoes", "hat"]\ncart.append("shirt")\nprint("Has hat?", "hat" in cart)\nprint("Cart:", cart)',
          explanation: 'Appends "shirt" and tests membership of "hat".'
        }
      }
    ]
  },
  {
    id: 'm6',
    moduleNumber: '06',
    title: 'Conditional Statements',
    description: 'Decision making in Python: if, else, elif ladders, nested conditions, and flowchart pathways.',
    icon: 'GitFork',
    topics: [
      {
        id: '6.1',
        topicNumber: '6.1',
        title: 'if Statement',
        category: 'Branching',
        durationMinutes: 10,
        intro: {
          badge: 'Decisions 6.1',
          headline: 'The One-Way Gate of Truth',
          summary: 'The if statement tests a condition; if True, it executes its indented block; if False, it skips.',
          analogy: 'A security turnstile: scan ticket (condition). If valid, gate swings open; otherwise you remain outside.',
          keyTakeaways: [
            'Syntax: if condition:\n    indented_code',
            'Code inside the block executes only if condition evaluates to True',
            'Must end the header with a colon : and indent 4 spaces'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'The if statement is the simplest form of conditional control flow.',
          codeExample: '# 6.1 Simple if Statement\nbattery_level = 15\n\nif battery_level < 20:\n    print("Warning: Battery low!")\n    print("Please connect charger.")\n\nprint("System monitoring active.")',
          codeExplanation: 'Because 15 < 20 is True, the warning block executes.',
          outputSample: 'Warning: Battery low!\nPlease connect charger.\nSystem monitoring active.'
        },
        exercise: {
          question: 'What happens if the condition in an if statement evaluates to False and there is no else?',
          options: [
            'The computer throws an error',
            'The entire script crashes',
            'The indented block is skipped and execution continues',
            'The condition is re-evaluated forever'
          ],
          correctOption: 2,
          explanation: 'Python simply bypasses the indented block and continues with the next statement at the outer indentation.'
        }
      },
      {
        id: '6.2',
        topicNumber: '6.2',
        title: 'else Statement',
        category: 'Two-Way Fork',
        durationMinutes: 10,
        intro: {
          badge: 'Fork 6.2',
          headline: 'The Two-Way Crossroads',
          summary: 'The else statement provides an alternate fallback path whenever the if condition evaluates to False.',
          analogy: 'A fork in the road: take left road if sign is green, otherwise take the right road.',
          keyTakeaways: [
            'else never has its own condition; it catches everything the if missed',
            'Exactly one branch will execute (mutually exclusive)',
            'Both branches must be consistently indented'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Use `if-else` whenever a scenario has two complementary outcomes (e.g., pass/fail, logged-in/logged-out).',
          codeExample: '# 6.2 if-else Demonstration\nage = 16\n\nif age >= 18:\n    print("You are eligible for voting!")\nelse:\n    print("Too young to vote. Wait", 18 - age, "more years.")',
          codeExplanation: 'Because 16 >= 18 is False, the else corridor activates.',
          outputSample: 'Too young to vote. Wait 2 more years.'
        },
        exercise: {
          question: 'Can an else statement have a condition written after it (like else x > 5:)?',
          options: [
            'Yes, always',
            'No, else has no condition; elif must be used for additional conditions',
            'Only if inside a function',
            'Only in Python 2'
          ],
          correctOption: 1,
          explanation: 'An else statement takes no condition. If you need a second condition, use elif.'
        }
      },
      {
        id: '6.3',
        topicNumber: '6.3',
        title: 'elif Statement (Multi-Branch Ladder)',
        category: 'Multi-Way Fork',
        durationMinutes: 12,
        intro: {
          badge: 'Ladder 6.3',
          headline: 'Multi-Portal Decision Corridor',
          summary: 'The elif (short for "else if") ladder allows testing multiple mutually exclusive conditions in sequence.',
          analogy: 'Elevator doors checking which floor button was pressed: Floor 1? Floor 2? Floor 3? Default Lobby.',
          keyTakeaways: [
            'Conditions are tested top to bottom',
            'The FIRST condition that evaluates to True executes, and all remaining branches are skipped',
            'Optional else at the end catches any unhandled cases'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'The elif ladder prevents messy deep nesting of if-else statements, keeping code flat and readable.',
          codeExample: '# 6.3 elif Grade Ladder\nmarks = 78\n\nif marks >= 90:\n    grade = "A+"\nelif marks >= 80:\n    grade = "A"\nelif marks >= 70:\n    grade = "B"\nelif marks >= 60:\n    grade = "C"\nelse:\n    grade = "F"\n\nprint("Marks:", marks)\nprint("Assigned Grade:", grade)',
          codeExplanation: 'Tests in sequence: 78 >= 90 is False, 78 >= 80 is False, 78 >= 70 is True! Grade B is assigned and remaining branches are bypassed.',
          outputSample: 'Marks: 78\nAssigned Grade: B'
        },
        exercise: {
          question: 'If x = 15, what will print?\nif x > 20: print("A")\nelif x > 10: print("B")\nelif x > 5: print("C")',
          options: [
            'B',
            'B and C',
            'C',
            'Nothing'
          ],
          correctOption: 0,
          explanation: 'As soon as x > 10 matches, "B" is printed and Python exits the entire if-elif chain.'
        }
      },
      {
        id: '6.4',
        topicNumber: '6.4',
        title: 'Module 06 Exercise: Ticket Pricing Matrix',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 6.4',
          headline: 'Automating Movie Ticket Rates',
          summary: 'Build an automated box office cashier that computes pricing based on age and student status.',
          analogy: 'Cinema ticket counter pricing rules.',
          keyTakeaways: [
            'Chain conditions cleanly',
            'Calculate discounts dynamically',
            'Print customized receipts'
          ],
          conceptVisual: 'gate'
        },
        guide: {
          overview: 'Write a script that calculates cinema ticket pricing: Children (<12) pay $8, Seniors (>=65) pay $10, Adults pay $15, with a $3 discount for students.',
          codeExample: '# 6.4 Box Office Lab\nage = 22\nis_student = True\n\nif age < 12:\n    base_price = 8\nelif age >= 65:\n    base_price = 10\nelse:\n    base_price = 15\n\nif is_student:\n    base_price -= 3\n\nprint("Patron Age:", age)\nprint("Student:", is_student)\nprint("Final Ticket Cost: $", base_price)',
          codeExplanation: 'Demonstrates an elif ladder followed by a secondary conditional modifier.',
          outputSample: 'Patron Age: 22\nStudent: True\nFinal Ticket Cost: $ 12'
        },
        exercise: {
          question: 'Write a conditional to check if a number is positive, negative, or zero.',
          starterCode: 'num = -7\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")',
          solutionCode: 'num = -7\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")',
          explanation: 'Checks positive (>0), negative (<0), and zero fallback.'
        }
      }
    ]
  },
  {
    id: 'm7',
    moduleNumber: '07',
    title: 'Loops',
    description: 'Repetition control: for loops, range(), while loops, loop flow interrupts with continue and break.',
    icon: 'Repeat',
    topics: [
      {
        id: '7.1',
        topicNumber: '7.1',
        title: 'for Loop & range()',
        category: 'Definite Iteration',
        durationMinutes: 12,
        intro: {
          badge: 'Loops 7.1',
          headline: 'The Conveyor Belt of Computing',
          summary: 'A for loop iterates over items of any sequence (string, list, range) one-by-one.',
          analogy: 'An assembly line conveyor belt: each item arrives at the station, gets inspected, and moves on.',
          keyTakeaways: [
            'for item in collection: executes block for every item',
            'range(stop): generates numbers from 0 up to stop - 1',
            'range(start, stop, step): custom bounds and increments',
            'No manual index counter required'
          ],
          conceptVisual: 'loop'
        },
        guide: {
          overview: 'The for loop is Python’s most common loop because it iterates directly over elements safely.',
          codeExample: '# 7.1 for Loop and range() Examples\nprint("--- Count 1 to 5 ---")\nfor i in range(1, 6):\n    print("Number:", i)\n\nprint("\\n--- Iterating over a list ---")\ncolors = ["Red", "Green", "Blue"]\nfor c in colors:\n    print("Color:", c)\n\nprint("\\n--- Step by 2 ---")\nfor n in range(0, 10, 2):\n    print("Even number:", n)',
          codeExplanation: 'Shows range() counting, list iteration, and stepped increments.',
          outputSample: '--- Count 1 to 5 ---\nNumber: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5\n\n--- Iterating over a list ---\nColor: Red\nColor: Green\nColor: Blue\n\n--- Step by 2 ---\nEven number: 0\nEven number: 2\nEven number: 4\nEven number: 6\nEven number: 8'
        },
        exercise: {
          question: 'How many times will this loop execute: for i in range(2, 6): ?',
          options: [
            '6 times',
            '4 times',
            '5 times',
            '2 times'
          ],
          correctOption: 1,
          explanation: 'Generates values 2, 3, 4, 5 (total 4 iterations).'
        }
      },
      {
        id: '7.2',
        topicNumber: '7.2',
        title: 'while Loop',
        category: 'Indefinite Iteration',
        durationMinutes: 12,
        intro: {
          badge: 'Loops 7.2',
          headline: 'The Orbit That Runs Until the Signal Drops',
          summary: 'A while loop repeats its block as long as its condition remains True.',
          analogy: 'Riding a carousel: you keep spinning while you have coins in your pocket.',
          keyTakeaways: [
            'while condition:\n    indented_block',
            'Condition is checked before every single iteration',
            'Must ensure variables inside update toward False to prevent infinite loops!'
          ],
          conceptVisual: 'loop'
        },
        guide: {
          overview: 'Use while loops when you do not know in advance how many times the loop needs to run (e.g. waiting for input or game states).',
          codeExample: '# 7.2 Countdown with while Loop\ncountdown = 5\n\nprint("Mission launch sequence initiated:")\nwhile countdown > 0:\n    print(countdown, "...")\n    countdown -= 1  # Crucial update step!\n\nprint("LIFTOFF! Rocket launched successfully.")',
          codeExplanation: 'Tracks the countdown variable until it hits 0, causing the condition to become False.',
          outputSample: 'Mission launch sequence initiated:\n5 ...\n4 ...\n3 ...\n2 ...\n1 ...\nLIFTOFF! Rocket launched successfully.'
        },
        exercise: {
          question: 'What is the danger of forgetting to update the loop counter variable in a while loop?',
          options: [
            'The computer creates a syntax error',
            'The loop runs infinitely and hangs the program',
            'The loop runs backwards',
            'The variable is deleted'
          ],
          correctOption: 1,
          explanation: 'Without updating the state, the condition remains permanently True, creating an infinite loop.'
        }
      },
      {
        id: '7.3',
        topicNumber: '7.3',
        title: 'continue vs break',
        category: 'Loop Control',
        durationMinutes: 12,
        intro: {
          badge: 'Control 7.3',
          headline: 'Emergency Brake vs Fast-Forward Warp',
          summary: 'break terminates the entire loop immediately; continue skips the rest of the current round and jumps to the next.',
          analogy: 'break pulls the emergency train brake; continue skips reading the rest of the current page and flips to the next chapter.',
          keyTakeaways: [
            'break: Exits the loop entirely and jumps to the code following the loop',
            'continue: Skips remaining statements in the current iteration and begins the next loop round',
            'Both work identically inside for and while loops'
          ],
          conceptVisual: 'loop'
        },
        guide: {
          overview: 'break and continue give you granular control over loop flow without needing complex nested flags.',
          codeExample: '# 7.3 continue vs break Demonstration\nprint("--- Demonstrating continue (Skip odds) ---")\nfor i in range(1, 6):\n    if i % 2 != 0:\n        continue  # Skip odd numbers\n    print("Even number found:", i)\n\nprint("\\n--- Demonstrating break (Stop at 4) ---")\nfor i in range(1, 10):\n    if i == 4:\n        print("Target reached! Breaking loop.")\n        break\n    print("Processing item:", i)',
          codeExplanation: 'Shows continue skipping odd numbers and break stopping execution prematurely.',
          outputSample: '--- Demonstrating continue (Skip odds) ---\nEven number found: 2\nEven number found: 4\n\n--- Demonstrating break (Stop at 4) ---\nProcessing item: 1\nProcessing item: 2\nProcessing item: 3\nTarget reached! Breaking loop.'
        },
        exercise: {
          question: 'Which statement immediately exits a loop without completing remaining iterations?',
          options: [
            'continue',
            'pass',
            'break',
            'return'
          ],
          correctOption: 2,
          explanation: 'break immediately terminates the enclosing loop.'
        }
      },
      {
        id: '7.4',
        topicNumber: '7.4',
        title: 'Module 07 Exercise: Prime Number Checker & Accumulator',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 7.4',
          headline: 'The Number Theory Reactor',
          summary: 'Combine loops, conditionals, and break to check prime numbers and accumulate totals.',
          analogy: 'A math sieve separating composite numbers from primes.',
          keyTakeaways: [
            'Use loops for trial division',
            'Use break as soon as a divisor is discovered',
            'Track accumulation totals'
          ],
          conceptVisual: 'loop'
        },
        guide: {
          overview: 'Write a script that tests whether a number is prime using a loop and early break optimization.',
          codeExample: '# 7.4 Prime Number Detector Lab\nnum = 29\nis_prime = True\n\nfor d in range(2, num):\n    if num % d == 0:\n        is_prime = False\n        break  # Divisor found; no need to test further\n\nif is_prime and num > 1:\n    print(num, "is a PRIME number!")\nelse:\n    print(num, "is a COMPOSITE number.")',
          codeExplanation: 'Checks every potential divisor from 2 to num - 1. If divisible, breaks immediately.',
          outputSample: '29 is a PRIME number!'
        },
        exercise: {
          question: 'Write a loop that calculates the sum of all numbers from 1 to 10.',
          starterCode: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint("Total sum:", total)',
          solutionCode: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint("Total sum:", total)',
          explanation: 'Accumulates 1 + 2 + ... + 10 = 55.'
        }
      }
    ]
  },
  {
    id: 'm8',
    moduleNumber: '08',
    title: 'Functions',
    description: 'Modular programming, def syntax, parameters vs arguments, print vs return, scope, and default arguments.',
    icon: 'Boxes',
    topics: [
      {
        id: '8.1',
        topicNumber: '8.1',
        title: 'Understanding Functions & def Syntax',
        category: 'Modularity',
        durationMinutes: 12,
        intro: {
          badge: 'Functions 8.1',
          headline: 'Creating Reusable Sub-Chambers',
          summary: 'A function is a reusable block of code that performs a specific action when called.',
          analogy: 'A coffee machine: you press the button (function call), supply beans (arguments), and get coffee.',
          keyTakeaways: [
            'Defined using the def keyword: def function_name(parameters):',
            'DRY Principle: Don\'t Repeat Yourself',
            'Functions only execute when explicitly called by name'
          ],
          conceptVisual: 'function'
        },
        guide: {
          overview: 'Functions organize code into clean, testable, and reusable building blocks.',
          codeExample: '# 8.1 Function Definition & Calls\ndef greet_user(username):\n    print("Welcome to Python Studio, " + username + "!")\n    print("Ready to code?")\n\n# Calling the function multiple times with different arguments\ngreet_user("Zara")\ngreet_user("Leo")',
          codeExplanation: 'The code inside greet_user runs twice with different parameter inputs.',
          outputSample: 'Welcome to Python Studio, Zara!\nReady to code?\nWelcome to Python Studio, Leo!\nReady to code?'
        },
        exercise: {
          question: 'Which keyword is used to define a function in Python?',
          options: [
            'function',
            'def',
            'fun',
            'define'
          ],
          correctOption: 1,
          explanation: 'Python uses the def keyword (short for define) to declare functions.'
        }
      },
      {
        id: '8.2',
        topicNumber: '8.2',
        title: 'print vs return Statement',
        category: 'Data Delivery',
        durationMinutes: 12,
        intro: {
          badge: 'Delivery 8.2',
          headline: 'Broadcasting to the Screen vs Handing Over a Value',
          summary: 'print displays text to the human console; return passes a calculated value back to the caller for further computation.',
          analogy: 'print is shouting the total to the room. return is handing the dollar bill to your hand so you can put it in your wallet.',
          keyTakeaways: [
            'print() does not return a value (its return value is None)',
            'return immediately exits the function and sends data back to the caller',
            'A returned value can be stored in a variable, passed to other functions, or used in math'
          ],
          conceptVisual: 'function'
        },
        guide: {
          overview: 'The confusion between `print` and `return` is one of the most common beginner traps. Remember: functions that compute data should return it.',
          codeExample: '# 8.2 print vs return in Action\n# Function with print (Displays only)\ndef add_print(a, b):\n    print("Sum is:", a + b)\n\n# Function with return (Hands back value)\ndef add_return(a, b):\n    return a + b\n\nres1 = add_print(5, 10)\nprint("Stored from add_print:", res1)  # Prints None!\n\nres2 = add_return(5, 10)\nprint("Stored from add_return:", res2) # Prints 15\nprint("Doubled result:", res2 * 2)',
          codeExplanation: 'Notice that res1 is None because add_print did not return a value.',
          outputSample: 'Sum is: 15\nStored from add_print: None\nStored from add_return: 15\nDoubled result: 30'
        },
        exercise: {
          question: 'If a function has no return statement, what does it return by default when called?',
          options: [
            '0',
            'False',
            'None',
            'Error'
          ],
          correctOption: 2,
          explanation: 'In Python, a function that finishes without an explicit return statement returns None.'
        }
      },
      {
        id: '8.3',
        topicNumber: '8.3',
        title: 'Variable Scope (Local vs Global)',
        category: 'Scope Boundaries',
        durationMinutes: 12,
        intro: {
          badge: 'Scope 8.3',
          headline: 'Chamber Walls and Planetary Atmosphere',
          summary: 'Variables created inside a function are Local to that function; variables created outside are Global.',
          analogy: 'Local: a notebook inside your bedroom (nobody outside can see it). Global: the billboard on the highway (everyone can see it).',
          keyTakeaways: [
            'Local variables exist only during function execution and are destroyed upon return',
            'Functions can read global variables, but cannot modify them without the global keyword',
            'Keeps functions self-contained and avoids accidental side effects'
          ],
          conceptVisual: 'vessel'
        },
        guide: {
          overview: 'Scope prevents variables in one part of your program from accidentally overwriting variables in another.',
          codeExample: '# 8.3 Scope Demonstration\napp_name = "Python Studio"  # Global variable\n\ndef calculate_discount(price):\n    rate = 0.2              # Local variable\n    discount = price * rate # Local variable\n    print("Inside function (app):", app_name)\n    print("Inside function (rate):", rate)\n    return price - discount\n\nfinal = calculate_discount(100)\nprint("Final price:", final)\n# Accessing rate here would cause a NameError because rate is local!',
          codeExplanation: 'Demonstrates that the local variable rate is isolated inside the function.',
          outputSample: 'Inside function (app): Python Studio\nInside function (rate): 0.2\nFinal price: 80.0'
        },
        exercise: {
          question: 'Can code outside a function directly access a variable declared inside that function?',
          options: [
            'Yes, anytime',
            'No, local variables are not accessible outside their function scope',
            'Only if the variable is an integer',
            'Only if exported'
          ],
          correctOption: 1,
          explanation: 'Local variables exist only within their function execution context.'
        }
      },
      {
        id: '8.4',
        topicNumber: '8.4',
        title: 'Default Arguments',
        category: 'Parameters',
        durationMinutes: 10,
        intro: {
          badge: 'Parameters 8.4',
          headline: 'Pre-Set Settings You Can Override',
          summary: 'Default arguments allow parameters to have fallback values if the caller omits them.',
          analogy: 'A restaurant order: coffee comes with whole milk by default unless you ask for oat milk.',
          keyTakeaways: [
            'Syntax: def greet(name, greeting="Hello"):',
            'Default arguments must always follow non-default parameters',
            'Allows flexible function calls with fewer arguments'
          ],
          conceptVisual: 'function'
        },
        guide: {
          overview: 'Default arguments make APIs easier to use by providing sensible standard settings while keeping customization available.',
          codeExample: '# 8.4 Default Arguments in Action\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint("power(5) [uses default 2]:", power(5))\nprint("power(5, 3) [overrides with 3]:", power(5, 3))\nprint("power(2, 8) [overrides with 8]:", power(2, 8))',
          codeExplanation: 'When exponent is omitted, it defaults to 2 (squaring). When provided, it overrides.',
          outputSample: 'power(5) [uses default 2]: 25\npower(5, 3) [overrides with 3]: 125\npower(2, 8) [overrides with 8]: 256'
        },
        exercise: {
          question: 'Where must default parameters be positioned in a function definition?',
          options: [
            'At the very beginning before all others',
            'After all positional parameters without defaults',
            'Position does not matter',
            'Inside square brackets'
          ],
          correctOption: 1,
          explanation: 'Python syntax requires parameters with defaults to be listed after non-default parameters.'
        }
      },
      {
        id: '8.5',
        topicNumber: '8.5',
        title: 'Module 08 Exercise: Modular Geometry Toolkit',
        category: 'Lab Practice',
        durationMinutes: 15,
        intro: {
          badge: 'Lab 8.5',
          headline: 'Constructing a Reusable Geometry Module',
          summary: 'Build a suite of pure mathematical functions with return values and default parameters.',
          analogy: 'Architect drafting toolkit.',
          keyTakeaways: [
            'Write clean pure functions',
            'Return numerical results',
            'Use default arguments for rounding decimals'
          ],
          conceptVisual: 'function'
        },
        guide: {
          overview: 'Build a geometry toolkit providing functions for circle area, rectangle area, and triangle hypotenuse.',
          codeExample: '# 8.5 Geometry Toolkit Lab\ndef circle_area(radius, pi=3.14159):\n    return pi * (radius ** 2)\n\ndef rectangle_area(width, height):\n    return width * height\n\nprint("Circle Area (r=5):", round(circle_area(5), 2))\nprint("Circle Area (r=5, pi=3.14):", circle_area(5, 3.14))\nprint("Rectangle Area (10x4):", rectangle_area(10, 4))',
          codeExplanation: 'Creates modular, testable, and reusable mathematical utility functions.',
          outputSample: 'Circle Area (r=5): 78.54\nCircle Area (r=5, pi=3.14): 78.5\nRectangle Area (10x4): 40'
        },
        exercise: {
          question: 'Write a function is_even(n) that returns True if n is even, False otherwise.',
          starterCode: 'def is_even(n):\n    return n % 2 == 0\n\nprint("4 is even?", is_even(4))\nprint("7 is even?", is_even(7))',
          solutionCode: 'def is_even(n):\n    return n % 2 == 0\n\nprint("4 is even?", is_even(4))\nprint("7 is even?", is_even(7))',
          explanation: 'Checks n % 2 == 0 and returns the boolean result.'
        }
      }
    ]
  },
  {
    id: 'm9',
    moduleNumber: '09',
    title: 'Working with Graphics & Modern Libraries',
    description: 'Turtle graphics, geometry shapes, Pandas for Excel analysis, and the broader Python ecosystem (NumPy, Matplotlib, Tkinter, Django, MicroPython, PyGame).',
    icon: 'Compass',
    topics: [
      {
        id: '9.1',
        topicNumber: '9.1',
        title: 'Introduction to Turtle Graphics',
        category: 'Graphics',
        durationMinutes: 10,
        intro: {
          badge: 'Turtle 9.1',
          headline: 'A Robotic Creature with a Drawing Pen',
          summary: 'Turtle graphics is Python’s visual drawing system where a robot turtle moves on a 2D Cartesian plane dragging a pen.',
          analogy: 'A small remote-controlled robotic bug holding a paintbrush on a giant sheet of white paper.',
          keyTakeaways: [
            'Originated from Seymour Papert\'s Logo programming language in 1967',
            'Turtle starts at origin (0, 0) facing East (0 degrees)',
            'Commands directly steer the turtle and paint geometric lines'
          ],
          conceptVisual: 'turtle'
        },
        guide: {
          overview: 'Turtle graphics provides instant visual feedback, helping learners understand angles, coordinates, and loops.',
          codeExample: '# 9.1 Hello Turtle!\nimport turtle\nt = turtle.Turtle()\n\n# Turtle starts at (0, 0)\nt.forward(100)\nt.left(90)\nt.forward(100)\nprint("Turtle completed an L-shaped path!")',
          codeExplanation: 'Switch to the "Turtle Canvas" tab in the bottom deck to view the live SVG drawing!',
          outputSample: 'Turtle completed an L-shaped path!'
        },
        exercise: {
          question: 'In which direction does the Turtle face by default at program start?',
          options: [
            'North (90 degrees)',
            'East (0 degrees)',
            'West (180 degrees)',
            'South (270 degrees)'
          ],
          correctOption: 1,
          explanation: 'By default, the turtle begins at (0, 0) facing East along the positive X axis.'
        }
      },
      {
        id: '9.2',
        topicNumber: '9.2',
        title: 'Basic Turtle Commands (forward, back, left, right)',
        category: 'Turtle Movement',
        durationMinutes: 12,
        intro: {
          badge: 'Turtle 9.2',
          headline: 'Steering the Robotic Turtle',
          summary: 'Master the 4 fundamental motion and orientation commands: forward(), back(), left(), right().',
          analogy: 'Driving a rover: gas pedal forward/reverse, steering wheel turn left/right by exact degrees.',
          keyTakeaways: [
            'forward(pixels) / fd(): Moves forward in current heading',
            'backward(pixels) / back() / bk(): Moves backward without turning',
            'left(angle) / lt(): Rotates counter-clockwise by degrees',
            'right(angle) / rt(): Rotates clockwise by degrees',
            'penup() / pendown(): Lift or drop the drawing pen'
          ],
          conceptVisual: 'turtle'
        },
        guide: {
          overview: 'Combining movement distance with turn angles creates intricate geometric paths.',
          codeExample: '# 9.2 Basic Movement Commands\nimport turtle\nt = turtle.Turtle()\n\nt.penup()\nt.goto(-100, 0)\nt.pendown()\n\n# Draw a staircase pattern\nfor i in range(3):\n    t.forward(40)\n    t.left(90)\n    t.forward(40)\n    t.right(90)\n\nprint("Staircase pattern complete!")',
          codeExplanation: 'Alternate forward motion with 90-degree left and right turns.',
          outputSample: 'Staircase pattern complete!'
        },
        exercise: {
          question: 'What command turns the turtle 90 degrees clockwise?',
          options: [
            't.left(90)',
            't.right(90)',
            't.turn(90)',
            't.forward(90)'
          ],
          correctOption: 1,
          explanation: 't.right(angle) rotates clockwise by the specified degrees.'
        }
      },
      {
        id: '9.3',
        topicNumber: '9.3',
        title: 'Draw Shapes: Lines, Square, Rectangle, Circle & Star',
        category: 'Geometric Art',
        durationMinutes: 18,
        intro: {
          badge: 'Shapes 9.3',
          headline: 'Constructing Geometric Polygons',
          summary: 'Use loop algorithms with Turtle to draw squares, rectangles, circles, and 5-pointed stars.',
          analogy: 'A compass and straightedge drafting blueprints with mathematical precision.',
          keyTakeaways: [
            'Square: 4 sides with 90-degree turns',
            'Rectangle: 2 long sides, 2 short sides with 90-degree turns',
            'Circle: t.circle(radius)',
            'Star: 5 sides with 144-degree acute turns'
          ],
          conceptVisual: 'turtle'
        },
        guide: {
          overview: 'The exterior angle sum of any regular polygon is 360 degrees. Dividing 360 by side count yields turn angle!',
          codeExample: '# 9.3 Draw Shapes: Golden Star\nimport turtle\nt = turtle.Turtle()\n\nt.penup()\nt.goto(-60, 20)\nt.pendown()\nt.color("goldenrod")\nt.begin_fill()\n\n# Draw 5-pointed star (144 degree exterior turn)\nfor i in range(5):\n    t.forward(120)\n    t.right(144)\n\nt.end_fill()\nprint("Golden star rendered on canvas!")',
          codeExplanation: 'Notice begin_fill() and end_fill() to color the polygon interior.',
          outputSample: 'Golden star rendered on canvas!'
        },
        exercise: {
          question: 'What is the turning angle used to draw a standard 5-pointed star?',
          options: [
            '72 degrees',
            '90 degrees',
            '144 degrees',
            '120 degrees'
          ],
          correctOption: 2,
          explanation: 'A 5-pointed star uses 144 degree turns (180 - 36 degrees).'
        }
      },
      {
        id: '9.4',
        topicNumber: '9.4',
        title: 'Working with Excel Files Using Pandas (Read & Write)',
        category: 'Data Science',
        durationMinutes: 15,
        intro: {
          badge: 'Pandas 9.4',
          headline: 'Industrial Data Analysis: Excel & DataFrames',
          summary: 'Pandas is Python’s premier data manipulation library for reading, filtering, and writing spreadsheets (.xlsx).',
          analogy: 'Having a supercharged Excel spreadsheet inside Python capable of processing millions of rows per second.',
          keyTakeaways: [
            '9.4.1 read_excel(): Loads Excel sheet into a 2D DataFrame table',
            '9.4.2 to_excel(): Exports DataFrame back to an Excel spreadsheet',
            'Perform group calculations, averages, and column filtering with 1 line of code'
          ],
          conceptVisual: 'data'
        },
        guide: {
          overview: 'Pandas replaced manual spreadsheet formulas across global finance, healthcare, and engineering.',
          codeExample: '# 9.4 Working with Excel Data (Simulated DataFrame)\n# Demonstrates Pandas DataFrame structure:\nstudents_data = [\n    {"Name": "Amina", "Grade": 92, "Attendance": 98},\n    {"Name": "Bilal", "Grade": 85, "Attendance": 90},\n    {"Name": "Cyrus", "Grade": 96, "Attendance": 100},\n]\n\n# 9.4.1 Reading & Summarizing Columns\ntotal_grade = sum(s["Grade"] for s in students_data)\navg_grade = total_grade / len(students_data)\n\nprint("DataFrame Summary:")\nprint("Total Students:", len(students_data))\nprint("Average Class Grade:", round(avg_grade, 2))\n\n# 9.4.2 Writing Output Confirmation\nprint("Exported updated records to student_report.xlsx successfully!")',
          codeExplanation: 'Illustrates tabular processing patterns used in Pandas `pd.read_excel()` and `df.to_excel()`.',
          outputSample: 'DataFrame Summary:\nTotal Students: 3\nAverage Class Grade: 91.0\nExported updated records to student_report.xlsx successfully!'
        },
        exercise: {
          question: 'Which Pandas function is used to load an Excel spreadsheet into a DataFrame?',
          options: [
            'pd.open_spreadsheet()',
            'pd.read_excel()',
            'pd.load_table()',
            'pd.import_xlsx()'
          ],
          correctOption: 1,
          explanation: 'pd.read_excel("filename.xlsx") is the standard Pandas function.'
        }
      },
      {
        id: '9.5',
        topicNumber: '9.5',
        title: 'Other Useful Python Libraries (NumPy, Matplotlib, Tkinter, Django, Kotlin, MicroPython, PyGame)',
        category: 'Ecosystem',
        durationMinutes: 18,
        intro: {
          badge: 'Ecosystem 9.5',
          headline: 'The Grand Python Universe & Interoperability',
          summary: 'Tour the 7 powerhouse frameworks that define modern Python: data, visualization, GUI, web, mobile, IoT, and games.',
          analogy: 'Python as a universal passport to every technological field in the software industry.',
          keyTakeaways: [
            '9.5.1 NumPy: High-performance N-dimensional numerical matrices',
            '9.5.2 Matplotlib: Publication-quality charts, histograms, and plots',
            '9.5.3 Tkinter: Standard built-in desktop Graphical User Interface (GUI) library',
            '9.5.4 Django: High-level batteries-included web framework powering Instagram',
            '9.5.5 Kotlin Interoperability: Bridging Android apps with Python ML backends',
            '9.5.6 MicroPython: Running lightweight Python on microcontrollers and IoT chips',
            '9.5.7 PyGame: 2D game development engine with sprites, sound, and physics'
          ],
          conceptVisual: 'chip'
        },
        guide: {
          overview: 'Python\'s real power lies in its specialized libraries. Once you know Python fundamentals, you can build anything.',
          keyPoints: [
            { title: '9.5.1 NumPy', explanation: 'Powers all scientific computing and AI tensor operations with C-speed vectorization.' },
            { title: '9.5.2 Matplotlib', explanation: 'Creates 2D plots, bar charts, heatmaps, and scatter plots (`plt.plot()`, `plt.show()`).' },
            { title: '9.5.3 Tkinter', explanation: 'Builds native desktop windows, buttons, text fields, and dialogs out of the box.' },
            { title: '9.5.4 Django', explanation: 'Full-stack web framework with ORM, auth, admin panel, and high security defaults.' },
            { title: '9.5.5 Kotlin & Python', explanation: 'Python models (TensorFlow/PyTorch) consumed by native Kotlin Android apps via ONNX/REST.' },
            { title: '9.5.6 MicroPython', explanation: 'Stripped-down Python 3 runtime designed specifically for ESP32 and Raspberry Pi Pico chips.' },
            { title: '9.5.7 PyGame', explanation: 'Handles graphics surfaces, game loops, keyboard/joystick events, and collisions.' }
          ],
          codeExample: '# 9.5 Python Ecosystem Showcase\necosystem = {\n    "NumPy": "Scientific computing & AI tensors",\n    "Matplotlib": "Data visualization & charts",\n    "Tkinter": "Desktop desktop GUI applications",\n    "Django": "Enterprise web applications",\n    "Kotlin Interop": "Mobile Android AI integration",\n    "MicroPython": "IoT sensors & microcontrollers",\n    "PyGame": "2D video games & simulations"\n}\n\nprint("=== Modern Python Specializations ===")\nfor lib, desc in ecosystem.items():\n    print(f"• {lib}: {desc}")',
          codeExplanation: 'Summarizes all 7 major modern Python libraries with their key applications.',
          outputSample: '=== Modern Python Specializations ===\n• NumPy: Scientific computing & AI tensors\n• Matplotlib: Data visualization & charts\n• Tkinter: Desktop desktop GUI applications\n• Django: Enterprise web applications\n• Kotlin Interop: Mobile Android AI integration\n• MicroPython: IoT sensors & microcontrollers\n• PyGame: 2D video games & simulations'
        },
        exercise: {
          question: 'Which library is Python’s built-in standard tool for creating desktop graphical windows (GUIs)?',
          options: [
            'Django',
            'NumPy',
            'Tkinter',
            'MicroPython'
          ],
          correctOption: 2,
          explanation: 'Tkinter is Python’s standard built-in desktop GUI library.'
        }
      }
    ]
  }
];

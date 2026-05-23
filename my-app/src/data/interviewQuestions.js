const questions = {
    "Web Dev": [
        { 
            id: 1, 
            question: "What is the Virtual DOM in React?", 
            answer: "The Virtual DOM is a lightweight copy of the actual DOM. React uses it to track changes made by the user. When a change happens, React compares the old and new Virtual DOMs, calculates the minimum operations needed (reconciliation), and updates the real DOM efficiently.",
            options: [
                "The Virtual DOM is a lightweight copy of the actual DOM. React uses it to track changes made by the user. When a change happens, React compares the old and new Virtual DOMs, calculates the minimum operations needed (reconciliation), and updates the real DOM efficiently.",
                "A server-side memory buffer that caches compiled HTML page components before sending them directly to the browser client.",
                "A specialized database wrapper designed to persist functional component state in Web LocalStorage.",
                "A physical hardware accelerator built into modern web browser rendering engines."
            ]
        },
        { 
            id: 2, 
            question: "Explain Closures in JavaScript.", 
            answer: "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function's scope from an inner function, even after the outer function has returned.",
            options: [
                "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function's scope from an inner function, even after the outer function has returned.",
                "An internal memory optimization strategy where objects are closed to new custom prototype properties.",
                "A method of terminating background async callback execution blocks when a network request times out.",
                "A specialized syntax that forces a class component's constructor to return a singleton reference."
            ]
        },
        { 
            id: 3, 
            question: "What are React Hooks?", 
            answer: "React Hooks allow functional components to have state and lifecycle methods (like componentDidMount) that previously only class components could use. Common hooks include useState, useEffect, and useMemo.",
            options: [
                "React Hooks allow functional components to have state and lifecycle methods (like componentDidMount) that previously only class components could use. Common hooks include useState, useEffect, and useMemo.",
                "Backend middleware pipelines designed to authenticate incoming server-side rendered requests.",
                "Special CSS class selectors that bind external style attributes to virtual dynamic structures.",
                "Core algorithms used by React's reconciliation engine to physically diff two separate virtual nodes."
            ]
        },
        { 
            id: 4, 
            question: "Explain CSS Grid vs Flexbox.", 
            answer: "Flexbox is mainly designed for laying out elements within a container along one dimension (row OR column). CSS Grid is a 2D layout system designed to layout elements visually across rows AND columns simultaneously.",
            options: [
                "Flexbox is mainly designed for laying out elements within a container along one dimension (row OR column). CSS Grid is a 2D layout system designed to layout elements visually across rows AND columns simultaneously.",
                "CSS Grid compiles standard HTML tables dynamically, while Flexbox renders standard inline block spans.",
                "Grid is strictly a server-side layout framework, while Flexbox operates solely in client browser spaces.",
                "Grid handles linear element stack spacing, while Flexbox handles circular and concentric layers."
            ]
        },
        { 
            id: 5, 
            question: "What is CORS?", 
            answer: "Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.",
            options: [
                "Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources.",
                "A standard browser security protocol that blocks all outgoing network queries originating from functional components.",
                "An abbreviation for Centralized Object Routing Schema, used to sync state between node clusters.",
                "A database encryption algorithm that signs private token fields before persisting them to MongoDB."
            ]
        },
        { 
            id: 6, 
            question: "What is event delegation?", 
            answer: "Event delegation is a pattern in JavaScript where a single event listener is attached to a parent element (instead of multiple listeners to children) in order to handle events on its descendant elements by leveraging event bubbling.",
            options: [
                "Event delegation is a pattern in JavaScript where a single event listener is attached to a parent element (instead of multiple listeners to children) in order to handle events on its descendant elements by leveraging event bubbling.",
                "A garbage collection optimization technique that assigns memory references to secondary variable scopes.",
                "A method of delegating synchronous API calls to separate microservice processes on the host cluster.",
                "A process where click handlers are executed before standard document compilation starts."
            ]
        },
        { 
            id: 7, 
            question: "What is the difference between null and undefined?", 
            answer: "Undefined means a variable has been declared but not assigned a value. Null is an assignment value that intentionally represents the absence of any object value.",
            options: [
                "Undefined means a variable has been declared but not assigned a value. Null is an assignment value that intentionally represents the absence of any object value.",
                "Null throws a terminal script compilation error, while undefined executes a safe silent crash.",
                "Undefined belongs to the browser lexical environment, while null belongs exclusively to MongoDB document formats.",
                "Null is an active boolean parameter representing falsity, while undefined represents memory overflow state."
            ]
        },
        { 
            id: 8, 
            question: "Explain 'this' keyword in JS.", 
            answer: "'this' refers to the object that is executing the current function. Its value is determined at runtime depending on how the function was called (e.g. object method, standalone function, constructor, or arrow function).",
            options: [
                "'this' refers to the object that is executing the current function. Its value is determined at runtime depending on how the function was called (e.g. object method, standalone function, constructor, or arrow function).",
                "'this' points exclusively to the top-level global Window object regardless of execution context.",
                "'this' is a compiler instruction that forces immediate asynchronous memory deallocation of variables.",
                "'this' returns a unique hash string corresponding to the physical location of the active Javascript script."
            ]
        },
        { 
            id: 9, 
            question: "What is strict mode?", 
            answer: "Strict mode is a way to opt in to a restricted variant of JavaScript. It eliminates some silent errors by throwing them, fixes mistakes that make it difficult for JS engines to perform optimizations, and prohibits some syntax likely to be defined in future versions.",
            options: [
                "Strict mode is a way to opt in to a restricted variant of JavaScript. It eliminates some silent errors by throwing them, fixes mistakes that make it difficult for JS engines to perform optimizations, and prohibits some syntax likely to be defined in future versions.",
                "A browser environment setup that disables external API calls and restricts code to local sandboxes.",
                "A high-performance build step that minifies style elements and transpiles standard files to ES5.",
                "A security parameter that enforces role-based user access controls on frontend routes."
            ]
        },
        { 
            id: 10, 
            question: "What is SSR vs CSR?", 
            answer: "Server-Side Rendering (SSR) generates the fully populated HTML page on the server and sends it to the browser. Client-Side Rendering (CSR) sends an almost empty HTML shell and JavaScript code, allowing the browser to render the exact content dynamically.",
            options: [
                "Server-Side Rendering (SSR) generates the fully populated HTML page on the server and sends it to the browser. Client-Side Rendering (CSR) sends an almost empty HTML shell and JavaScript code, allowing the browser to render the exact content dynamically.",
                "SSR compiles style declarations dynamically, while CSR converts layout blocks directly to virtual grids.",
                "SSR refers to local file storage pipelines, while CSR represents remote database interactions.",
                "SSR secures API endpoints using SSL, while CSR relies on standard client token cookies."
            ]
        }
    ],
    "DSA": [
        { 
            id: 1, 
            question: "What is the time complexity of binary search?", 
            answer: "O(log N) as it halves the search space at each step in a sorted array.",
            options: [
                "O(log N) as it halves the search space at each step in a sorted array.",
                "O(N) since it inspects every single element sequentially from start to end.",
                "O(N log N) because it partitions the array into sorted sub-blocks.",
                "O(1) as it directly computes the exact index in constant operations."
            ]
        },
        { 
            id: 2, 
            question: "Explain a Hash Table.", 
            answer: "A Hash Table is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.",
            options: [
                "A Hash Table is a data structure that implements an associative array abstract data type, a structure that can map keys to values. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.",
                "A sequential linear stack designed to store dynamic numeric elements in consecutive slots.",
                "A balanced search tree where key items are nested in recursive branch layers.",
                "A graph traversal utility that records edge connections using binary matrices."
            ]
        },
        { 
            id: 3, 
            question: "What is Big O Notation?", 
            answer: "Big O notation is used in Computer Science to describe the performance or complexity of an algorithm. It specifically describes the worst-case scenario, indicating the maximum amount of time or space an algorithm will take as the input scales.",
            options: [
                "Big O notation is used in Computer Science to describe the performance or complexity of an algorithm. It specifically describes the worst-case scenario, indicating the maximum amount of time or space an algorithm will take as the input scales.",
                "An internal database language index optimized to query document attributes.",
                "An array sorting method that splits arrays into odd and even partition sets.",
                "A specialized syntax used to declare object variables in JavaScript runtime compilers."
            ]
        },
        { 
            id: 4, 
            question: "How does Merge Sort work?", 
            answer: "Merge sort is an O(N log N) divide-and-conquer algorithm. It recursively breaks down a list into several sublists until each sublist consists of a single element and merges those sublists in a manner that results into a sorted list.",
            options: [
                "Merge sort is an O(N log N) divide-and-conquer algorithm. It recursively breaks down a list into several sublists until each sublist consists of a single element and merges those sublists in a manner that results into a sorted list.",
                "An O(N^2) sorting process that repeatedly swaps adjacent elements if they are in the wrong order.",
                "A sorting method that picks a pivot element and partitions other elements into smaller lists.",
                "A non-comparison based linear sort that counts the number of occurrences of each value."
            ]
        },
        { 
            id: 5, 
            question: "BFS vs DFS?", 
            answer: "Breadth-First Search (BFS) explores equally in all directions, using a Queue, often for finding shortest paths. Depth-First Search (DFS) explores as deep as possible before backtracking, using a Stack (or recursion). Both traverse graphs.",
            options: [
                "Breadth-First Search (BFS) explores equally in all directions, using a Queue, often for finding shortest paths. Depth-First Search (DFS) explores as deep as possible before backtracking, using a Stack (or recursion). Both traverse graphs.",
                "BFS goes as deep as possible using a Stack, while DFS goes broad layer-by-layer using a Queue.",
                "BFS requires constant O(1) space, while DFS requires full database collection indexes.",
                "BFS traverses tree structures, while DFS operates solely on linear arrays."
            ]
        },
        { 
            id: 6, 
            question: "What is a Linked List?", 
            answer: "A linear data structure where elements are not stored at contiguous memory locations. Elements are linked using pointers. Each node contains data and a reference (or link) to the next node.",
            options: [
                "A linear data structure where elements are not stored at contiguous memory locations. Elements are linked using pointers. Each node contains data and a reference (or link) to the next node.",
                "A sequential array structure stored in contiguous block registers for instant index access.",
                "A hierarchical node layout where children elements point directly to parent tree routes.",
                "A collection of private class parameters linked by custom functional hooks."
            ]
        },
        { 
            id: 7, 
            question: "What is dynamic programming?", 
            answer: "An algorithmic technique for solving an optimization problem by breaking it down into simpler subproblems and utilizing the fact that the optimal solution to the overall problem depends upon the optimal solution to its subproblems (memoization or tabulation).",
            options: [
                "An algorithmic technique for solving an optimization problem by breaking it down into simpler subproblems and utilizing the fact that the optimal solution to the overall problem depends upon the optimal solution to its subproblems (memoization or tabulation).",
                "A backend architecture method where databases dynamically allocate replica node servers on-demand.",
                "A coding paradigm focused on writing functions that automatically modify their own syntax definitions at runtime.",
                "An asynchronous promise handling framework designed to prevent thread locks during network loads."
            ]
        },
        { 
            id: 8, 
            question: "What is a Trie?", 
            answer: "A Trie (prefix tree) is a distinct type of tree used to store associative data structures. A common application of a trie is storing a predictive text or autocomplete dictionary.",
            options: [
                "A Trie (prefix tree) is a distinct type of tree used to store associative data structures. A common application of a trie is storing a predictive text or autocomplete dictionary.",
                "A multi-dimensional graph matrix optimized to track cyclic path paths.",
                "A binary stack structure that stores records in chronological key arrays.",
                "An balanced AVL tree specifically balanced using red and black node colors."
            ]
        },
        { 
            id: 9, 
            question: "What is a Binary Search Tree (BST)?", 
            answer: "A node-based binary tree data structure where the left subtree of a node contains only nodes with keys lesser than the node's key, and the right subtree contains only keys greater than the node's key.",
            options: [
                "A node-based binary tree data structure where the left subtree of a node contains only nodes with keys lesser than the node's key, and the right subtree contains only keys greater than the node's key.",
                "A general tree where each node can have any number of ordered child nodes containing string properties.",
                "A complete binary tree optimized to yield the minimum element in constant O(1) time.",
                "A linear queue listing that links nodes sequentially in alphanumeric sorted orders."
            ]
        },
        { 
            id: 10, 
            question: "Dijkstra vs A*?", 
            answer: "Dijkstra algorithm guarantees the shortest path from single source to all nodes in a weighted graph but expands in all directions equally. A* uses a heuristic function to guide the search towards the destination, making it faster in pathfinding.",
            options: [
                "Dijkstra algorithm guarantees the shortest path from single source to all nodes in a weighted graph but expands in all directions equally. A* uses a heuristic function to guide the search towards the destination, making it faster in pathfinding.",
                "Dijkstra operates in linear O(N) space, while A* requires recursive stack memory allocations.",
                "Dijkstra works only on tree collections, while A* traverses cyclic weighted layouts.",
                "Dijkstra utilizes a heuristic to speed up calculations, while A* checks every node uniformly."
            ]
        }
    ]
};

export default questions;

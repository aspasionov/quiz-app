import { Quiz } from '@/types';

// Mock data for quizzes with complete question sets
export const mockQuizzes: Quiz[] = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    author: 'John Doe',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    tags: ['JavaScript', 'Programming', 'Web Development'],
    maxPoints: 100,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [
      {
        _id: '1-1',
        questionText: 'What is the correct way to declare a variable in JavaScript?',
        explanation: 'let and const are preferred over var as they have block scope and prevent common errors.',
        options: [
          { _id: '1-1-1', text: 'var x = 5;', points: 5, isCorrect: false },
          { _id: '1-1-2', text: 'let x = 5;', points: 10, isCorrect: true },
          { _id: '1-1-3', text: 'int x = 5;', points: 0, isCorrect: false },
          { _id: '1-1-4', text: 'variable x = 5;', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '1-2',
        questionText: 'Which of these is NOT a JavaScript data type?',
        explanation: 'JavaScript has number, string, boolean, object, undefined, null, symbol, and bigint as primitive types. Float is not a separate type.',
        options: [
          { _id: '1-2-1', text: 'string', points: 0, isCorrect: false },
          { _id: '1-2-2', text: 'boolean', points: 0, isCorrect: false },
          { _id: '1-2-3', text: 'float', points: 10, isCorrect: true },
          { _id: '1-2-4', text: 'number', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '1-3',
        questionText: 'What does the === operator do in JavaScript?',
        explanation: 'The === operator performs strict equality comparison, checking both value and type without type coercion.',
        options: [
          { _id: '1-3-1', text: 'Assigns a value', points: 0, isCorrect: false },
          { _id: '1-3-2', text: 'Compares values with type coercion', points: 5, isCorrect: false },
          { _id: '1-3-3', text: 'Compares values and types strictly', points: 10, isCorrect: true },
          { _id: '1-3-4', text: 'Checks if variable exists', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '1-4',
        questionText: 'How do you create a function in JavaScript?',
        explanation: 'Functions can be declared using the function keyword, as function expressions, or as arrow functions.',
        options: [
          { _id: '1-4-1', text: 'function myFunction() {}', points: 10, isCorrect: true },
          { _id: '1-4-2', text: 'def myFunction():', points: 0, isCorrect: false },
          { _id: '1-4-3', text: 'create function myFunction()', points: 0, isCorrect: false },
          { _id: '1-4-4', text: 'func myFunction() {}', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '1-5',
        questionText: 'What is the result of typeof null in JavaScript?',
        explanation: 'This is a well-known JavaScript quirk. typeof null returns "object" due to a legacy bug in the language.',
        options: [
          { _id: '1-5-1', text: '"null"', points: 5, isCorrect: false },
          { _id: '1-5-2', text: '"undefined"', points: 0, isCorrect: false },
          { _id: '1-5-3', text: '"object"', points: 10, isCorrect: true },
          { _id: '1-5-4', text: '"boolean"', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    title: 'React Hooks Deep Dive',
    author: 'Jane Smith',
    description: 'Advanced React hooks concepts and best practices.',
    tags: ['React', 'Hooks', 'Frontend'],
    maxPoints: 120,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [
      {
        _id: '2-1',
        questionText: 'What is the purpose of useEffect hook?',
        explanation: 'useEffect allows you to perform side effects in functional components, similar to componentDidMount, componentDidUpdate, and componentWillUnmount combined.',
        options: [
          { _id: '2-1-1', text: 'To manage component state', points: 0, isCorrect: false },
          { _id: '2-1-2', text: 'To perform side effects', points: 12, isCorrect: true },
          { _id: '2-1-3', text: 'To create refs', points: 0, isCorrect: false },
          { _id: '2-1-4', text: 'To handle form inputs', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '2-2',
        questionText: 'When does useEffect run by default?',
        explanation: 'By default, useEffect runs after every render, including the first render.',
        options: [
          { _id: '2-2-1', text: 'Only on component mount', points: 5, isCorrect: false },
          { _id: '2-2-2', text: 'After every render', points: 12, isCorrect: true },
          { _id: '2-2-3', text: 'Only when dependencies change', points: 5, isCorrect: false },
          { _id: '2-2-4', text: 'Before every render', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '2-3',
        questionText: 'What is the correct way to use useState with an object?',
        explanation: 'When updating object state, you need to spread the previous state to maintain immutability.',
        options: [
          { _id: '2-3-1', text: 'setState(newObject)', points: 6, isCorrect: false },
          { _id: '2-3-2', text: 'setState({...prevState, newProperty})', points: 12, isCorrect: true },
          { _id: '2-3-3', text: 'setState.update(newProperty)', points: 0, isCorrect: false },
          { _id: '2-3-4', text: 'setState += newProperty', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '2-4',
        questionText: 'What does the dependency array in useEffect control?',
        explanation: 'The dependency array controls when the effect runs. An empty array means it runs once, no array means it runs on every render.',
        options: [
          { _id: '2-4-1', text: 'Which components can use the effect', points: 0, isCorrect: false },
          { _id: '2-4-2', text: 'When the effect should re-run', points: 12, isCorrect: true },
          { _id: '2-4-3', text: 'How many times the effect runs', points: 6, isCorrect: false },
          { _id: '2-4-4', text: 'The order of effect execution', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '2-5',
        questionText: 'What is the purpose of the cleanup function in useEffect?',
        explanation: 'The cleanup function prevents memory leaks by cleaning up subscriptions, timers, or other side effects when the component unmounts or before the effect runs again.',
        options: [
          { _id: '2-5-1', text: 'To clear component state', points: 0, isCorrect: false },
          { _id: '2-5-2', text: 'To prevent memory leaks and clean up subscriptions', points: 12, isCorrect: true },
          { _id: '2-5-3', text: 'To reset the dependency array', points: 0, isCorrect: false },
          { _id: '2-5-4', text: 'To debug the effect', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
  },
  {
    _id: '3',
    title: 'Python Data Structures',
    author: 'Mike Johnson',
    description: 'Comprehensive quiz on Python lists, dictionaries, sets, and tuples.',
    tags: ['Python', 'Data Structures', 'Programming'],
    maxPoints: 100,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [
      {
        _id: '3-1',
        questionText: 'Which Python data structure is mutable?',
        explanation: 'Lists are mutable in Python, meaning you can change their elements after creation. Tuples and strings are immutable.',
        options: [
          { _id: '3-1-1', text: 'tuple', points: 0, isCorrect: false },
          { _id: '3-1-2', text: 'string', points: 0, isCorrect: false },
          { _id: '3-1-3', text: 'list', points: 10, isCorrect: true },
          { _id: '3-1-4', text: 'frozenset', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '3-2',
        questionText: 'How do you access the last element of a list in Python?',
        explanation: 'Python supports negative indexing, where -1 refers to the last element, -2 to the second-to-last, and so on.',
        options: [
          { _id: '3-2-1', text: 'list[last]', points: 0, isCorrect: false },
          { _id: '3-2-2', text: 'list[-1]', points: 10, isCorrect: true },
          { _id: '3-2-3', text: 'list[end]', points: 0, isCorrect: false },
          { _id: '3-2-4', text: 'list.last()', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '3-3',
        questionText: 'What is the main difference between a list and a tuple?',
        explanation: 'The main difference is mutability: lists can be changed after creation, while tuples cannot be modified.',
        options: [
          { _id: '3-3-1', text: 'Lists are faster', points: 0, isCorrect: false },
          { _id: '3-3-2', text: 'Lists are mutable, tuples are immutable', points: 10, isCorrect: true },
          { _id: '3-3-3', text: 'Lists use more memory', points: 5, isCorrect: false },
          { _id: '3-3-4', text: 'Tuples can only store numbers', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '3-4',
        questionText: 'How do you create an empty dictionary in Python?',
        explanation: 'You can create an empty dictionary using {} or dict(). Both methods create an empty dictionary object.',
        options: [
          { _id: '3-4-1', text: '{}', points: 10, isCorrect: true },
          { _id: '3-4-2', text: '[]', points: 0, isCorrect: false },
          { _id: '3-4-3', text: '()', points: 0, isCorrect: false },
          { _id: '3-4-4', text: 'None', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '3-5',
        questionText: 'What does the set() function do in Python?',
        explanation: 'The set() function creates a new set object, which is an unordered collection of unique elements.',
        options: [
          { _id: '3-5-1', text: 'Creates a sorted list', points: 0, isCorrect: false },
          { _id: '3-5-2', text: 'Creates a collection of unique elements', points: 10, isCorrect: true },
          { _id: '3-5-3', text: 'Sets a variable value', points: 0, isCorrect: false },
          { _id: '3-5-4', text: 'Creates a nested dictionary', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
  {
    _id: '4',
    title: 'CSS Grid and Flexbox',
    author: 'Sarah Wilson',
    description: 'Master modern CSS layout techniques with this comprehensive quiz.',
    tags: ['CSS', 'Layout', 'Web Design'],
    maxPoints: 80,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [
      {
        _id: '4-1',
        questionText: 'What is the main difference between CSS Grid and Flexbox?',
        explanation: 'CSS Grid is designed for two-dimensional layouts (rows and columns), while Flexbox is designed for one-dimensional layouts (either rows or columns).',
        options: [
          { _id: '4-1-1', text: 'Grid is for 2D layouts, Flexbox is for 1D layouts', points: 10, isCorrect: true },
          { _id: '4-1-2', text: 'Grid is newer than Flexbox', points: 0, isCorrect: false },
          { _id: '4-1-3', text: 'Grid is faster than Flexbox', points: 0, isCorrect: false },
          { _id: '4-1-4', text: 'There is no difference', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-2',
        questionText: 'Which property is used to create a grid container?',
        explanation: 'display: grid creates a grid container, making all direct children grid items.',
        options: [
          { _id: '4-2-1', text: 'display: flex', points: 0, isCorrect: false },
          { _id: '4-2-2', text: 'display: grid', points: 10, isCorrect: true },
          { _id: '4-2-3', text: 'grid-template', points: 0, isCorrect: false },
          { _id: '4-2-4', text: 'grid-container', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-3',
        questionText: 'What does justify-content do in Flexbox?',
        explanation: 'justify-content aligns flex items along the main axis (horizontally by default).',
        options: [
          { _id: '4-3-1', text: 'Aligns items along the cross axis', points: 0, isCorrect: false },
          { _id: '4-3-2', text: 'Aligns items along the main axis', points: 10, isCorrect: true },
          { _id: '4-3-3', text: 'Changes the flex direction', points: 0, isCorrect: false },
          { _id: '4-3-4', text: 'Sets the flex item width', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-4',
        questionText: 'Which CSS Grid property defines the size of grid tracks?',
        explanation: 'grid-template-columns and grid-template-rows define the size of grid tracks (columns and rows).',
        options: [
          { _id: '4-4-1', text: 'grid-template-columns', points: 10, isCorrect: true },
          { _id: '4-4-2', text: 'grid-gap', points: 5, isCorrect: false },
          { _id: '4-4-3', text: 'grid-area', points: 0, isCorrect: false },
          { _id: '4-4-4', text: 'grid-auto-flow', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-5',
        questionText: 'What is the CSS Grid fr unit used for?',
        explanation: 'The fr (fraction) unit represents a fraction of the available space in the grid container.',
        options: [
          { _id: '4-5-1', text: 'Fixed pixel values', points: 0, isCorrect: false },
          { _id: '4-5-2', text: 'Fractional units of available space', points: 10, isCorrect: true },
          { _id: '4-5-3', text: 'Font-relative units', points: 0, isCorrect: false },
          { _id: '4-5-4', text: 'Frame rate units', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-6',
        questionText: 'How do you center an item both horizontally and vertically in Flexbox?',
        explanation: 'justify-content: center centers along the main axis, and align-items: center centers along the cross axis.',
        options: [
          { _id: '4-6-1', text: 'justify-content: center; align-items: center;', points: 10, isCorrect: true },
          { _id: '4-6-2', text: 'text-align: center; vertical-align: middle;', points: 0, isCorrect: false },
          { _id: '4-6-3', text: 'margin: auto;', points: 5, isCorrect: false },
          { _id: '4-6-4', text: 'position: absolute; center: true;', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-7',
        questionText: 'What does grid-gap (or gap) property do?',
        explanation: 'The gap property sets the spacing between grid items (both row and column gaps).',
        options: [
          { _id: '4-7-1', text: 'Sets the spacing between grid items', points: 10, isCorrect: true },
          { _id: '4-7-2', text: 'Sets the grid container size', points: 0, isCorrect: false },
          { _id: '4-7-3', text: 'Defines grid line names', points: 0, isCorrect: false },
          { _id: '4-7-4', text: 'Controls grid item alignment', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '4-8',
        questionText: 'Which Flexbox property controls how flex items grow?',
        explanation: 'flex-grow defines how much a flex item should grow relative to other flex items.',
        options: [
          { _id: '4-8-1', text: 'flex-shrink', points: 0, isCorrect: false },
          { _id: '4-8-2', text: 'flex-grow', points: 10, isCorrect: true },
          { _id: '4-8-3', text: 'flex-basis', points: 5, isCorrect: false },
          { _id: '4-8-4', text: 'flex-direction', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    _id: '5',
    title: 'Node.js and Express',
    author: 'David Brown',
    description: 'Backend development quiz covering Node.js fundamentals and Express framework.',
    tags: ['Node.js', 'Express', 'Backend'],
    maxPoints: 90,
    isPrivate: false,
    visibility: 'selected',
    allowedUsers: [],
    questions: [
      {
        _id: '5-1',
        questionText: 'What is Node.js?',
        explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine that allows you to run JavaScript on the server side.',
        options: [
          { _id: '5-1-1', text: 'A JavaScript framework', points: 5, isCorrect: false },
          { _id: '5-1-2', text: 'A JavaScript runtime environment', points: 10, isCorrect: true },
          { _id: '5-1-3', text: 'A database management system', points: 0, isCorrect: false },
          { _id: '5-1-4', text: 'A web browser', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-2',
        questionText: 'What is Express.js?',
        explanation: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
        options: [
          { _id: '5-2-1', text: 'A Node.js web framework', points: 10, isCorrect: true },
          { _id: '5-2-2', text: 'A database ORM', points: 0, isCorrect: false },
          { _id: '5-2-3', text: 'A testing library', points: 0, isCorrect: false },
          { _id: '5-2-4', text: 'A bundling tool', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-3',
        questionText: 'How do you install Express in a Node.js project?',
        explanation: 'npm install express is the standard command to install Express.js as a dependency in your Node.js project.',
        options: [
          { _id: '5-3-1', text: 'npm install express', points: 10, isCorrect: true },
          { _id: '5-3-2', text: 'node install express', points: 0, isCorrect: false },
          { _id: '5-3-3', text: 'express install', points: 0, isCorrect: false },
          { _id: '5-3-4', text: 'npm get express', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-4',
        questionText: 'What HTTP method is used to retrieve data from a server?',
        explanation: 'GET is the HTTP method used to retrieve data from a server without modifying it.',
        options: [
          { _id: '5-4-1', text: 'POST', points: 0, isCorrect: false },
          { _id: '5-4-2', text: 'GET', points: 10, isCorrect: true },
          { _id: '5-4-3', text: 'PUT', points: 0, isCorrect: false },
          { _id: '5-4-4', text: 'DELETE', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-5',
        questionText: 'What is middleware in Express?',
        explanation: 'Middleware functions are functions that have access to the request object, response object, and the next middleware function in the application\'s request-response cycle.',
        options: [
          { _id: '5-5-1', text: 'Database connection functions', points: 0, isCorrect: false },
          { _id: '5-5-2', text: 'Functions that execute during request-response cycle', points: 10, isCorrect: true },
          { _id: '5-5-3', text: 'HTML template engines', points: 0, isCorrect: false },
          { _id: '5-5-4', text: 'CSS preprocessing tools', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-6',
        questionText: 'How do you handle POST requests in Express?',
        explanation: 'app.post() method is used to define routes that handle POST requests in Express.',
        options: [
          { _id: '5-6-1', text: 'app.get()', points: 0, isCorrect: false },
          { _id: '5-6-2', text: 'app.post()', points: 10, isCorrect: true },
          { _id: '5-6-3', text: 'app.request()', points: 0, isCorrect: false },
          { _id: '5-6-4', text: 'app.handle()', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-7',
        questionText: 'What is the purpose of package.json in Node.js?',
        explanation: 'package.json is a file that contains metadata about the project and manages dependencies, scripts, and other project information.',
        options: [
          { _id: '5-7-1', text: 'Contains project metadata and dependencies', points: 10, isCorrect: true },
          { _id: '5-7-2', text: 'Stores application data', points: 0, isCorrect: false },
          { _id: '5-7-3', text: 'Defines database schemas', points: 0, isCorrect: false },
          { _id: '5-7-4', text: 'Configures web server settings', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-8',
        questionText: 'How do you send JSON data as a response in Express?',
        explanation: 'res.json() method sends a JSON response to the client.',
        options: [
          { _id: '5-8-1', text: 'res.send()', points: 5, isCorrect: false },
          { _id: '5-8-2', text: 'res.json()', points: 10, isCorrect: true },
          { _id: '5-8-3', text: 'res.write()', points: 0, isCorrect: false },
          { _id: '5-8-4', text: 'res.render()', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '5-9',
        questionText: 'What does npm stand for?',
        explanation: 'npm stands for Node Package Manager, which is the default package manager for Node.js.',
        options: [
          { _id: '5-9-1', text: 'Node Package Manager', points: 10, isCorrect: true },
          { _id: '5-9-2', text: 'Network Protocol Manager', points: 0, isCorrect: false },
          { _id: '5-9-3', text: 'Node Program Module', points: 0, isCorrect: false },
          { _id: '5-9-4', text: 'New Project Manager', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z',
  },
  {
    _id: '11',
    title: 'AWS Cloud Services',
    author: 'Kevin Lee',
    description: 'Comprehensive quiz on Amazon Web Services and cloud computing.',
    tags: ['AWS', 'Cloud', 'DevOps'],
    maxPoints: 100,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [
      {
        _id: '11-1',
        questionText: 'What does AWS stand for?',
        explanation: 'AWS stands for Amazon Web Services, which is Amazon\'s comprehensive cloud computing platform.',
        options: [
          { _id: '11-1-1', text: 'Amazon Web Services', points: 10, isCorrect: true },
          { _id: '11-1-2', text: 'Amazon Website Solutions', points: 0, isCorrect: false },
          { _id: '11-1-3', text: 'Advanced Web Systems', points: 0, isCorrect: false },
          { _id: '11-1-4', text: 'Automated Web Services', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-2',
        questionText: 'What is Amazon EC2?',
        explanation: 'Amazon EC2 (Elastic Compute Cloud) provides scalable computing capacity in the AWS cloud.',
        options: [
          { _id: '11-2-1', text: 'A database service', points: 0, isCorrect: false },
          { _id: '11-2-2', text: 'A virtual server service', points: 10, isCorrect: true },
          { _id: '11-2-3', text: 'A storage service', points: 0, isCorrect: false },
          { _id: '11-2-4', text: 'A networking service', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-3',
        questionText: 'What is Amazon S3 primarily used for?',
        explanation: 'Amazon S3 (Simple Storage Service) is an object storage service that offers industry-leading scalability, data availability, security, and performance.',
        options: [
          { _id: '11-3-1', text: 'Computing power', points: 0, isCorrect: false },
          { _id: '11-3-2', text: 'Object storage', points: 10, isCorrect: true },
          { _id: '11-3-3', text: 'Database hosting', points: 0, isCorrect: false },
          { _id: '11-3-4', text: 'Load balancing', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-4',
        questionText: 'What is the AWS Free Tier?',
        explanation: 'AWS Free Tier provides customers the ability to explore and try out AWS services free of charge up to specified limits.',
        options: [
          { _id: '11-4-1', text: 'A paid premium service', points: 0, isCorrect: false },
          { _id: '11-4-2', text: 'Free usage limits for AWS services', points: 10, isCorrect: true },
          { _id: '11-4-3', text: 'A type of EC2 instance', points: 0, isCorrect: false },
          { _id: '11-4-4', text: 'A storage class in S3', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-5',
        questionText: 'What is Amazon RDS?',
        explanation: 'Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale a relational database in the cloud.',
        options: [
          { _id: '11-5-1', text: 'A managed relational database service', points: 10, isCorrect: true },
          { _id: '11-5-2', text: 'A content delivery network', points: 0, isCorrect: false },
          { _id: '11-5-3', text: 'A serverless computing service', points: 0, isCorrect: false },
          { _id: '11-5-4', text: 'A monitoring service', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-6',
        questionText: 'What is AWS Lambda?',
        explanation: 'AWS Lambda is a serverless computing service that lets you run code without provisioning or managing servers.',
        options: [
          { _id: '11-6-1', text: 'A virtual server service', points: 0, isCorrect: false },
          { _id: '11-6-2', text: 'A serverless computing service', points: 10, isCorrect: true },
          { _id: '11-6-3', text: 'A database service', points: 0, isCorrect: false },
          { _id: '11-6-4', text: 'A storage service', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-7',
        questionText: 'What is Amazon CloudFront?',
        explanation: 'Amazon CloudFront is a content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally.',
        options: [
          { _id: '11-7-1', text: 'A content delivery network', points: 10, isCorrect: true },
          { _id: '11-7-2', text: 'A computing service', points: 0, isCorrect: false },
          { _id: '11-7-3', text: 'A database service', points: 0, isCorrect: false },
          { _id: '11-7-4', text: 'A monitoring service', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-8',
        questionText: 'What are AWS Regions?',
        explanation: 'AWS Regions are physical locations around the world where AWS clusters data centers, providing low latency and high availability.',
        options: [
          { _id: '11-8-1', text: 'Individual data centers', points: 0, isCorrect: false },
          { _id: '11-8-2', text: 'Geographic locations with multiple data centers', points: 10, isCorrect: true },
          { _id: '11-8-3', text: 'Virtual private clouds', points: 0, isCorrect: false },
          { _id: '11-8-4', text: 'Load balancer configurations', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-9',
        questionText: 'What is the AWS Well-Architected Framework?',
        explanation: 'The AWS Well-Architected Framework provides architectural best practices across five pillars: operational excellence, security, reliability, performance efficiency, and cost optimization.',
        options: [
          { _id: '11-9-1', text: 'A set of architectural best practices', points: 10, isCorrect: true },
          { _id: '11-9-2', text: 'A monitoring tool', points: 0, isCorrect: false },
          { _id: '11-9-3', text: 'A deployment service', points: 0, isCorrect: false },
          { _id: '11-9-4', text: 'A security service', points: 0, isCorrect: false }
        ]
      },
      {
        _id: '11-10',
        questionText: 'What is Amazon VPC?',
        explanation: 'Amazon VPC (Virtual Private Cloud) lets you provision a logically isolated section of the AWS Cloud where you can launch AWS resources.',
        options: [
          { _id: '11-10-1', text: 'A virtual private cloud service', points: 10, isCorrect: true },
          { _id: '11-10-2', text: 'A database service', points: 0, isCorrect: false },
          { _id: '11-10-3', text: 'A content delivery network', points: 0, isCorrect: false },
          { _id: '11-10-4', text: 'A serverless computing service', points: 0, isCorrect: false }
        ]
      }
    ],
    createdAt: '2024-01-05T10:30:00Z',
    updatedAt: '2024-01-05T10:30:00Z',
  },
];

// Function to get quiz by ID
export const getQuizById = (id: string): Quiz | undefined => {
  return mockQuizzes.find(quiz => quiz._id === id);
};

// Function to get all quizzes (for listing page)
export const getAllQuizzes = (): Quiz[] => {
  return mockQuizzes;
};

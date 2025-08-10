# Quiz App

A modern, full-stack quiz application that allows users to create, share, and take interactive quizzes.

## 🚀 Features

### Current Features
- ✅ User authentication (register/login)
- ✅ JWT-based security
- ✅ User roles (user/admin)
- ✅ Comprehensive quiz data models
- ✅ Tag-based quiz categorization
- ✅ Public/Private quiz visibility
- ✅ Point-based scoring system

### Planned Features (MVP)
- 🚧 Quiz creation interface
- 🚧 Quiz taking functionality
- 🚧 Results tracking and history
- 🚧 Public quiz discovery
- 🚧 User dashboard

### Future Features
- 📋 Room-based multiplayer quizzes
- 📊 Advanced analytics and statistics
- 🔔 Notification system
- 👥 Social features and sharing

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Material-UI (MUI)** - Component library
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 📁 Project Structure

```
quiz-app/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/     # Next.js app router pages
│   │   ├── components/ # Reusable React components
│   │   ├── stores/  # Zustand state management
│   │   ├── types/   # TypeScript type definitions
│   │   ├── api/     # API client functions
│   │   └── validations/ # Form validation schemas
│   └── package.json
├── server/          # Express.js backend API
│   ├── models/      # Mongoose data models
│   ├── routes/      # Express route handlers
│   ├── helper/      # Utility functions
│   ├── validators/  # Input validation rules
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create .env file with:
   # MONGO_DB_URI=your_mongodb_connection_string
   # SECRET=your_jwt_secret_key
   # PORT=8080
   # CLIENT_URL=http://localhost:3000
   
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   
   # Create .env.local file with:
   # NEXT_PUBLIC_API_URL=http://localhost:8080
   
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 🗄️ Data Models

### User
- Email, name, password
- Avatar and roles
- Authentication with JWT

### Quiz
- Title, description, author
- Tags for categorization
- Visibility settings (public/private/selected)
- Point-based scoring
- Questions with multiple options

### Question
- Question text and explanation
- Multiple choice options (1-6 per question)
- Point values for each option

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Quizzes (Planned)
- `GET /api/quizzes` - List public quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/take` - Submit quiz answers

## 🎯 Development Roadmap

### Phase 1: MVP Core Features
- [ ] Complete quiz CRUD operations
- [ ] Quiz creation interface
- [ ] Quiz taking functionality
- [ ] Basic results tracking

### Phase 2: Enhanced Experience
- [ ] User dashboard
- [ ] Quiz discovery and search
- [ ] Advanced analytics
- [ ] Social sharing

### Phase 3: Multiplayer Features
- [ ] Room-based quizzes
- [ ] Real-time collaboration
- [ ] Leaderboards
- [ ] Notification system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- Next.js team for the amazing React framework
- MongoDB for the flexible database solution

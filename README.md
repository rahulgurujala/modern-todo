# 📝 Modern Todo Application

A beautiful, full-stack todo application built with **FastAPI** and **React** that helps you organize your tasks efficiently with a modern, intuitive interface.

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![React](https://img.shields.io/badge/React-19.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC.svg)

[Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

## ✨ Features

### 🔐 **Authentication & User Management**
- Secure user registration and login
- JWT-based authentication
- User profile management
- Password change functionality

### 📋 **Todo Management**
- Create, read, update, and delete todos
- Rich todo descriptions
- Multiple priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Cancelled)
- Due date management

### 🔍 **Advanced Filtering & Search**
- Search todos by title and description
- Filter by status, priority, and completion state
- Date-based filtering (due before/after specific dates)
- Pagination support for large todo lists

### 📊 **Analytics & Insights**
- Personal todo statistics dashboard
- Priority and status breakdowns
- Overdue todo tracking
- Due soon notifications

### 🎨 **Modern UI/UX**
- Beautiful, responsive design with shadcn/ui components
- Dark/light theme support
- Intuitive navigation with React Router
- Real-time updates with React Query
- Toast notifications for user feedback

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM with Pydantic integration
- **SQLite** - Database (easily configurable for PostgreSQL/MySQL)
- **JWT** - Authentication tokens
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Query** - Server state management
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client

## 🚀 Installation

### Prerequisites
- **Python 3.12+**
- **Node.js 18+**
- **pnpm** (recommended) or npm

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install Python dependencies**
   ```bash
   # Using uv (recommended)
   uv sync

   # Or using pip
   pip install -r requirements.txt
   ```

4. **Set environment variables** (optional)
   ```bash
   export SECRET_KEY="your-secret-key-here"
   export DATABASE_URL="sqlite:///./todo.db"  # or your preferred database
   ```

5. **Run the backend server**
   ```bash
   # Using uv
   uv run python -m app.main

   # Or using python directly
   python -m app.main
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set environment variables** (optional)
   ```bash
   # Create .env file
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

4. **Run the frontend development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📖 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/login/json` - Login with JSON payload
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile
- `POST /auth/change-password` - Change password
- `POST /auth/refresh` - Refresh access token

### Todo Endpoints
- `GET /todos/` - Get todos with filtering and pagination
- `POST /todos/` - Create a new todo
- `GET /todos/{id}` - Get specific todo
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo
- `POST /todos/{id}/complete` - Mark todo as completed
- `POST /todos/{id}/pending` - Mark todo as pending
- `GET /todos/stats/overview` - Get user todo statistics
- `GET /todos/overdue` - Get overdue todos
- `GET /todos/due-soon` - Get todos due soon

### Interactive API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Project Structure

```
todo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── database/       # Database configuration
│   │   ├── models/         # SQLModel data models
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app entry point
│   ├── pyproject.toml      # Python dependencies
│   └── README.md
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── todos/      # Todo-specific components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # React app entry point
│   ├── package.json        # Node.js dependencies
│   └── README.md
└── README.md               # This file
```

## 🎯 Usage

1. **Register** a new account or **login** with existing credentials
2. **Create todos** with titles, descriptions, priorities, and due dates
3. **Organize** your todos using filters and search
4. **Track progress** with the statistics dashboard
5. **Stay on top** of overdue and upcoming tasks

## 🚀 Deployment

### Backend Deployment
The FastAPI backend can be deployed using:
- **Docker** (recommended)
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**
- Any ASGI-compatible hosting service

### Frontend Deployment
The React frontend can be deployed using:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Environment Variables

**Backend:**
- `SECRET_KEY` - JWT secret key
- `DATABASE_URL` - Database connection string

**Frontend:**
- `VITE_API_BASE_URL` - Backend API URL

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **PEP 8** for Python code
- Use **TypeScript** for all new frontend code
- Write **tests** for new features
- Update **documentation** as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the amazing Python web framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [React Query](https://tanstack.com/query) for excellent server state management
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<div align="center">

**Happy Todo-ing!** 🎉

Made with ❤️ by developers, for developers

</div> 
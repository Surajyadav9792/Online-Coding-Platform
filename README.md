# 💻 Online Coding Platform 

An advanced full-stack coding platform that enables users to practice programming, run code in real-time, and get automated evaluation similar to platforms like LeetCode and HackerRank.

---

## 📌 Overview

This project is designed to provide an interactive environment where users can solve coding problems, test their solutions, and receive instant feedback. It includes a role-based system where only authorized admins can manage problems.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization
- Secure user login and signup system using JWT
- Role-based access control (Admin / User)
- Protected routes and user-specific data access

### 🧩 Problem Management (Admin Only)
- Only admin can:
  - Add new problems
  - Update existing problems
  - Delete problems
- Each problem includes:
  - Description
  - Constraints
  - Input/Output format
  - Test cases

### ⚡ Real-Time Code Execution
- Execute code directly in the browser
- Supports multiple programming languages via Judge0 API
- Custom input support

### ✅ Automated Evaluation System
- Submissions are evaluated against predefined test cases
- Result status includes:
  - Accepted
  - Wrong Answer
  - Runtime Error

### 📊 Submission Tracking
- Stores user submissions with results
- Users can view previous attempts and performance

### 🤖 AI-Based Coding Assistant
- Provides:
  - Code explanations
  - Debugging suggestions
  - Hints for problem solving

### 🎥 Video-Based Learning
- Problem explanations through videos
- Enhances learning experience

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Code Execution Engine
- Judge0 API

---

## 🏗️ System Architecture (High-Level)

User → Frontend → Backend → Judge0 API → Response → User

---

## 🔗 Project Repositories

- **Frontend:**  https://github.com/Surajyadav9792/Online-Coding-Platform-Frontend-Part
- **Backend:**  https://github.com/Surajyadav9792/Online-Coding-Platform-Backend-Part

---

## 📌 Future Improvements

- 🏆 Leaderboard system  
- 💬 Discussion forum  
- 📈 Performance analytics  
- ⚙️ Execution optimization  

---

## 👨‍💻 Author

**Suraj Yadav**

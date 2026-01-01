# 📘 ClassForge – Idea Submission Portal

ClassForge is a full-stack academic Idea Submission Portal inspired by platforms like Google Classroom, designed to manage student innovation workflows efficiently. The system enables students to submit ideas, faculty to review and merge similar submissions, and administrators to manage the entire platform with full control.

This project focuses on real-world academic use cases and is built using a modern MERN stack architecture with MongoDB Atlas as the database.

---

## 🎯 Project Purpose

The goal of ClassForge is to:
- Encourage structured idea submission among students
- Prevent duplicate ideas through faculty-controlled merging
- Provide transparent review and feedback workflows
- Maintain a centralized innovation repository
- Support role-based dashboards with analytics

---

## 🧱 Technology Stack

### Frontend
- React (Vite, JSX)
- React Router DOM
- Axios
- CSS Modules (custom UI)
- White & Light Blue theme

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt for password hashing
- Nodemailer for OTP & email verification

### Database
- MongoDB Atlas  
- Database Name: `classforge`  
- Hosted remotely (no local storage, no mock data)

---

## 👥 User Roles & Access Control

### 🧑‍🎓 Student
- Email domain: `@karunya.edu.in`
- Can submit, edit, and track ideas

### 👨‍🏫 Faculty
- Email domain: `@karunya.edu`
- Can review, approve, reject, edit, and merge ideas

### 🛠️ Admin
- Full system access
- User, idea, and analytics control

Roles are automatically assigned during signup based on email domain.

---

## 🔐 Authentication & Security Features

- Signup & Login with JWT
- Email verification using OTP
- Forgot password with OTP reset
- Secure password hashing using bcrypt
- Role-based protected routes
- Token-based session management

---

## 🧑‍🎓 Student Dashboard Features

- Submit new ideas with:
  - Title
  - Description
  - Domain
  - Tags
- View idea status:
  - Pending
  - Approved
  - Rejected
  - Merged
- Edit or delete ideas before approval
- View faculty feedback
- Receive notifications for approvals, rejections, merges
- Analytics cards:
  - Total ideas
  - Approved ideas
  - Pending ideas
  - Success percentage

---

## 👨‍🏫 Faculty Dashboard Features

- View all submitted student ideas
- Search and filter ideas by domain, status, and tags
- Approve or reject ideas with feedback
- Edit ideas for clarity or correction
- Merge duplicate or similar ideas while preserving contributors
- Track merge history
- Send notifications to students

---

## 🛠️ Admin Dashboard Features

- View system-wide analytics
- Manage students and faculty users
- Full CRUD access on all ideas
- Override faculty decisions if required
- View activity logs and idea lifecycle
- Manage platform configuration

---

## 🔔 Notification System

- Stored in MongoDB
- Read / unread status
- Triggered on:
  - Idea submission
  - Approval
  - Rejection
  - Merge
  - Feedback updates

---



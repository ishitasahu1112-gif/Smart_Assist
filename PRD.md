# Product Requirements Document (PRD) - Lumina App

## 1. Introduction
**Product Name:** Lumina
**Description:** A smart notes and task management application designed to help users capture thoughts and organize their lives with the help of AI.
**Platform:** Web Application (Responsive)

## 2. Existing Features

### 2.1 Authentication
*   **Google Sign-In:** One-click login using Firebase Authentication.
*   **Email/Password:** Traditional sign-up and login flow.
*   **Session Management:** Persistent login state with automatic redirection based on auth status.
*   **User Profile:** Display user name and avatar (from Google or initials).

### 2.2 Notes Management
*   **Create & Edit:** Interface to write and save notes with a title and content.
*   **Delete:** Remove unwanted notes.
*   **AI-Powered Suggestions:**
    *   **Suggest:** AI generates a title or expands on content based on initial input.
    *   **Refine:** AI polishes the existing note content.
    *   **Integration:** Powered by Google Gemini API.
*   **Real-time Sync:** Notes are saved to Firestore and synced across devices in real-time.

### 2.3 Task Management
*   **Create Tasks:** Add tasks with description, due date, time, and priority (High, Medium, Low).
*   **Edit & Delete:** Modify task details or remove tasks.
*   **Status Tracking:** Mark tasks as completed/incomplete.
*   **Filtering:** Filter tasks by priority (All, High, Medium, Low).
*   **Sorting:** Intelligent sorting based on completion status, priority weighting (High > Medium > Low), and creation time.
*   **Reminders:**
    *   **Email Notifications:** Automated email reminders sent via EmailJS at specific intervals before the due date:
        *   24 hours before
        *   1 hour before
        *   5 minutes before
    *   **Browser Checks:** Client-side interval checks to trigger reminders.
    *   **Server-side Checks:** Firebase Cloud Functions scheduled to run every hour to ensure reliable delivery of 24h and 1h reminders.

### 2.4 Analytics Dashboard
*   **Visual Statistics:**
    *   Completed Tasks Count
    *   Completion Rate (%)
    *   Incomplete Rate (%)
*   **Timeframes:** Analytics adjustable by Day, Week, Month, and Year.

### 2.5 AI Mentor
*   **Chat Interface:** A dedicated "AI Mentor" chat bubble and panel.
*   **Contextual Assistance:** The AI is aware of the user's notes and tasks (planned) to provide contextual advice.
*   **API Key Management:** User can securely input their own Gemini API Key, stored locally in the browser.

### 2.6 User Settings
*   **Profile Management:** Input for phone number (intended for future WhatsApp integration).
*   **Key Management:** UI to update or remove the stored Google Gemini API Key.

## 3. Technical Architecture
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+ modules).
*   **Backend:** Firebase (Firestore, Authentication, Cloud Functions).
*   **Email Service:** EmailJS (Client-side & Server-side integration).
*   **AI Service:** Google Gemini API (via direct REST calls).
*   **Hosting:** Firebase Hosting.

## 4. Future Roadmap

### Phase 1: Enhanced User Experience (Q2 2024)
*   **Dark/Light Mode Toggle:** Full theme support based on user preference.
*   **Rich Text Editor:** Basic formatting for notes (Bold, Italic, Lists) using a lightweight library or `contenteditable`.
*   **Tags & Categories:** Ability to tag notes and tasks for better organization and searching.
*   **Search Functionality:** specific search bar to find notes and tasks by keywords.

### Phase 2: Mobile & PWA (Q3 2024)
*   **PWA Support:** Make the web app installable with offline capabilities (using Service Workers and Firestore offline persistence).
*   **Mobile Optimizations:** Improved touch targets and mobile-first navigation.
*   **Voice Notes:** Ability to record audio notes, transcribed via AI.

### Phase 3: Advanced AI & Integrations (Q4 2024)
*   **WhatsApp Integration:** Send task reminders via WhatsApp (using the collected phone number).
*   **Calendar View:** Visual calendar interface for tasks with drag-and-drop rescheduling.
*   **AI Chat Context:** Deepen the specific integration of the AI Mentor to "read" all notes/tasks to give holistic life advice.
*   **Collaboration:** Share notes or assign tasks to other users by email.

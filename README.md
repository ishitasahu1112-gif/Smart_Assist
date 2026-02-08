# Lumina - Smart Notes & Task Manager

Lumina is a modern, AI-powered productivity application designed to help you capture thoughts, organize tasks, and stay on top of your schedule. Built with **Vanilla JavaScript** and **Firebase**, it offers a seamless experience with real-time syncing across devices.

## 🚀 Deployment & Live Demo

This application is configured for **Firebase Hosting**.

**Once deployed**, the live application will be accessible at:
👉 **[https://antigravity-firebase-72e9d.firebaseapp.com](https://antigravity-firebase-72e9d.firebaseapp.com)**

### How to Deploy

To update the live site with the latest changes:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Deploy:**
   Run this command from the project root:
   ```bash
   firebase deploy
   ```

> **Note:** The Google Sign-In feature works out-of-the-box on the deployed URL as the domain is already authorized in Firebase Console.

---

## ✨ Features

- **📝 Smart Notes:** Create, edit, and organize notes. Use **AI Suggestions** to expand on your ideas or refine your writing.
- **✅ Task Management:** efficient task tracking with priorities (High, Medium, Low) and due dates.
- **🧠 AI Mentor:** Integrated **Google Gemini AI** to answer questions and provide contextual assistance.
- **🔔 Smart Reminders:** 
  - Automated email notifications (via EmailJS) sent **24 hours**, **1 hour**, and **5 minutes** before a task is due.
  - Client-side browser alerts.
- **📊 Analytics Dashboard:** Visualize your productivity with completion rates and task statistics.
- **🔐 Secure Authentication:** Sign in with Google or Email/Password.
- **☁️ Real-time Sync:** All data is instantly synced to the cloud via Google Firestore.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend / Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Serverless:** Firebase Cloud Functions (for scheduled reminders)
- **AI:** Google Gemini API
- **Email Service:** EmailJS

## 🏃‍♂️ Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishitasahu1112-gif/Smart_Assist.git
   cd Smart_Assist
   ```

2. **Serve the app locally:**
   Since this uses Firebase Auth, you need a local server (cannot run directly from file system). You can use Python, VS Code Live Server, or `serve`.

   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # OR using npx serve
   npx serve .
   ```

3. **Open in Browser:**
   Go to `http://localhost:8000` (or `http://localhost:3000` if using npx serve).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

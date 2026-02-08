
// Import usage from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    doc,
    query,
    orderBy,
    serverTimestamp,
    where,
    getDoc,
    setDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCa8d5S4eoQ3cG5FQKy9EbiAW0jRlXruds",
    authDomain: "antigravity-firebase-72e9d.firebaseapp.com",
    projectId: "antigravity-firebase-72e9d",
    storageBucket: "antigravity-firebase-72e9d.firebasestorage.app",
    messagingSenderId: "315031405103",
    appId: "1:315031405103:web:0d35a32f8688ecdd3f7cda",
    measurementId: "G-VV5X3SKNWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize EmailJS
const EMAILJS_PUBLIC_KEY = "Cpbw9QFgxOLhJ53O7";
const EMAILJS_SERVICE_ID = "service_tmskqar";
const EMAILJS_TEMPLATE_ID = "template_v9zl8hq";

// Initialize EmailJS with public key
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("EmailJS initialized");
}

// Check for reminders every minute for better accuracy (especially for 5m reminder)
setInterval(() => {
    checkTaskRemindersClientSide();
}, 60 * 1000);



// Debug Firestore Connection
try {
    const connectedRef = doc(db, ".info/connected");
    onSnapshot(connectedRef, (snap) => {
        if (snap.data()?.value === true) {
            console.log("Firestore connected!");
        } else {
            console.log("Firestore disconnected.");
        }
    });
} catch (e) {
    console.error("Error attaching connection listener:", e);
}

// Global Error Handler for Snapshots
function handleSnapshotError(error, context) {
    console.error(`Snapshot Error in ${context}:`, error);
    if (error.code === 'unavailable') {
        console.warn("Firestore is offline. Check your internet connection or Firebase config.");
    }
}

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const googleLoginBtn = document.getElementById('google-login-btn');
const emailAuthForm = document.getElementById('email-auth-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const authMessage = document.getElementById('auth-message');

// User Profile Elements
const userProfileSection = document.getElementById('user-profile-section');
const userAvatar = document.getElementById('user-avatar');
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logout-btn');

// Profile Modal Elements
const profileModal = document.getElementById('profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const userPhoneInput = document.getElementById('user-phone-input');
const saveProfileBtn = document.getElementById('save-profile-btn');

// Debugging initialization
console.log("DOM Elements Initialized");
console.log("saveProfileBtn:", saveProfileBtn);
console.log("userPhoneInput:", userPhoneInput);

if (!saveProfileBtn) console.error("CRITICAL: saveProfileBtn is NULL");
if (!userPhoneInput) console.error("CRITICAL: userPhoneInput is NULL");

// App DOM Elements (re-selecting inside module scope)
const notesContainer = document.getElementById('notes-container');
const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const closeNoteModal = document.getElementById('close-note-modal');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentInput = document.getElementById('note-content-input');
const noteModalTitle = document.getElementById('note-modal-title');

const tasksContainer = document.getElementById('tasks-container');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeTaskModal = document.getElementById('close-task-modal');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskDescInput = document.getElementById('task-desc-input');
const taskDateInput = document.getElementById('task-date-input');
const taskTimeInput = document.getElementById('task-time-input');
const priorityBtns = document.querySelectorAll('.priority-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskModalTitle = document.getElementById('task-modal-title');

// AI Elements
const aiMentorTrigger = document.getElementById('ai-mentor-trigger');
const aiChatPanel = document.getElementById('ai-chat-panel');
const closeAiChat = document.getElementById('close-ai-chat');
const aiChatMessages = document.getElementById('ai-chat-messages');
const aiChatInput = document.getElementById('ai-chat-input');
const sendAiChat = document.getElementById('send-ai-chat');
const aiSuggestBtn = document.getElementById('ai-suggest-btn');
const aiRefineBtn = document.getElementById('ai-refine-btn');
const aiNoteLoading = document.getElementById('ai-note-loading');
const aiSettingsModal = document.getElementById('ai-settings-modal');
const closeAiSettings = document.getElementById('close-ai-settings');
const saveAiSettings = document.getElementById('save-ai-settings');
const geminiApiKeyInput = document.getElementById('gemini-api-key-input');

// State
let currentUser = null;
let notes = [];
let tasks = [];
let noteUnsub = null;
let taskUnsub = null;

let currentEditNoteId = null;
let currentEditTaskId = null;
let currentTaskPriority = 'low';
let currentFilter = 'all';

// AI State
let geminiApiKey = 'AIzaSyApVZ1tEXyYntSZbGUpkjDZGlSM4MuR2iw';
let aiChatHistory = [];
let isAiGenerating = false;

// --- AUTHENTICATION ---

// Google Login
googleLoginBtn.addEventListener('click', async () => {
    console.log("Google Login Clicked");
    if (window.location.protocol === 'file:') {
        alert("Google Sign-In requires a web server (http://localhost...). It won't work with file:// protocol. Please run a local server.");
        console.error("Google Sign-In blocked: File protocol detected.");
        return;
    }

    const provider = new GoogleAuthProvider();
    try {
        console.log("Starting signInWithPopup...");
        await signInWithPopup(auth, provider);
        console.log("signInWithPopup successful");
        // Overlay will be hidden by onAuthStateChanged
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        showAuthError(error.message);
        alert("Sign-In Error: " + error.message);
    }
});

// Email Login/Signup
emailAuthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Try login first
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        // If user not found, try sign up
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                // For simplified UX, try creating account if login fails
                // NOTE: In production, better to have explicit Sign Up vs Login or handle cleaner.
                // Re-attempting as signup for invalid credential might be confusing if password was just wrong.
                // Let's assume explicit intent based on error? 
                // Actually 'invalid-credential' is generic now.
                // Let's try create if 'invalid-credential' is NOT the error, but that's risky.

                // Better approach: Just show error. User can't "Toggle" signup in this simple UI.
                // Let's make the button try Login, if fails with "user-not-found" (legacy) or similar, suggest signup?
                // Firebase v9 throws 'auth/invalid-credential' for both wrong pass and no user often to prevent enumeration.

                // Let's just try to create user if login fails, and capture that error too.
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (createError) {
                if (createError.code === 'auth/email-already-in-use') {
                    showAuthError("Incorrect password.");
                } else {
                    showAuthError(createError.message);
                }
            }
        } else {
            showAuthError(error.message);
        }
    }
});

function showAuthError(msg) {
    authMessage.textContent = msg;
    authMessage.style.color = '#ef4444'; // Red
}

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        // Logged In
        loginOverlay.classList.add('hidden');
        updateUserProfileUI(user);
        setupRealtimeListeners(user.uid);
    } else {
        // Logged Out
        loginOverlay.classList.remove('hidden');
        userProfileSection.classList.add('hidden');
        notesContainer.innerHTML = '';
        tasksContainer.innerHTML = '';
        if (noteUnsub) noteUnsub();
        if (taskUnsub) taskUnsub();
        notes = [];
        tasks = [];
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

function updateUserProfileUI(user) {
    userProfileSection.classList.remove('hidden');

    // Name
    const name = user.displayName || user.email.split('@')[0];
    userNameDisplay.textContent = name;

    // Avatar
    if (user.photoURL) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="User">`;
    } else {
        const initials = name.substring(0, 2).toUpperCase();
        userAvatar.textContent = initials;
    }
}

// Open Profile Modal on clicking name/avatar (excluding logout btn)
userProfileSection.addEventListener('click', (e) => {
    if (!e.target.closest('#logout-btn')) {
        openProfileModal();
    }
});

async function openProfileModal() {
    if (!currentUser) return;
    openModalImpl(profileModal);

    // Fetch current phone
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid)); // Need to import getDoc
        if (userDoc.exists() && userDoc.data().phoneNumber) {
            userPhoneInput.value = userDoc.data().phoneNumber;
        }
    } catch (e) { console.error(e); }
}

console.log("Attaching listener to saveProfileBtn");
saveProfileBtn.addEventListener('click', async () => {
    console.log("Save Profile Btn Clicked");
    const phone = userPhoneInput.value.trim();
    console.log("Phone value:", phone);
    console.log("Current user:", currentUser);

    if (!currentUser) {
        console.error("No current user in save profile");
        return;
    }

    try {
        // Create user doc if not exists or update
        // We need setDoc with merge:true to be safe ifdoc doesn't exist, but updateDoc is fine if we know it exists. 
        // Let's use setDoc (need import)
        await setDoc(doc(db, 'users', currentUser.uid), {
            phoneNumber: phone
        }, { merge: true });
        closeModalImpl(profileModal);
        alert("Phone number saved!");
    } catch (e) {
        console.error(e);
        alert("Failed to save phone number.");
    }
});

closeProfileModal.addEventListener('click', () => closeModalImpl(profileModal));

// --- REALTIME DATA SYNC ---

function setupRealtimeListeners(uid) {
    // Notes Listener
    const notesQuery = query(
        collection(db, 'users', uid, 'notes'),
        orderBy('updatedAt', 'desc')
    );

    noteUnsub = onSnapshot(notesQuery, (snapshot) => {
        notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNotes();
    });

    // Tasks Listener
    const tasksQuery = query(
        collection(db, 'users', uid, 'tasks'),
        orderBy('createdAt', 'desc') // Sort later in memory or use composite index
    );

    taskUnsub = onSnapshot(tasksQuery, (snapshot) => {
        tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Note: Client-side sorting is easier without managing complex composite indexes for every variant
        renderTasks();
        updateAnalytics();
        checkTaskRemindersClientSide(); // Check for reminders after sync
    });
}


// --- NOTES FUNCTIONALITY ---

function renderNotes() {
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <p>No notes yet. Start writing!</p>
            </div>`;
        return;
    }

    notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-card';
        noteEl.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-date">${formatToIST(note.updatedAt)}</div>
            <button class="edit-note-btn" data-id="${note.id}" title="Edit Note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="delete-note-btn" data-id="${note.id}" title="Delete Note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;

        noteEl.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-note-btn') && !e.target.closest('.edit-note-btn')) {
                openNoteModal(note);
            }
        });

        const editBtn = noteEl.querySelector('.edit-note-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteModal(note);
        });

        const deleteBtn = noteEl.querySelector('.delete-note-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });

        notesContainer.appendChild(noteEl);
    });
}

async function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) return;
    if (!currentUser) return;

    // Optimistic UI: Close immediately
    const tempEditId = currentEditNoteId; // Capture ID before clearing
    closeModalImpl(noteModal);

    // Clear fields
    currentEditNoteId = null;
    noteTitleInput.value = '';
    noteContentInput.value = '';

    try {
        if (tempEditId) {
            // Edit existing
            await updateDoc(doc(db, 'users', currentUser.uid, 'notes', tempEditId), {
                title,
                content,
                updatedAt: serverTimestamp() // Firestore server time
            });
        } else {
            // Create new
            await addDoc(collection(db, 'users', currentUser.uid, 'notes'), {
                title: title || 'Untitled Note',
                content,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (e) {
        console.error("Error saving note: ", e);
        alert("Failed to save note. Check console.");
    }
}

async function deleteNote(id) {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'notes', id));
        } catch (e) {
            console.error("Error deleting note: ", e);
        }
    }
}

function openNoteModal(note = null) {
    if (note) {
        currentEditNoteId = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteModalTitle.textContent = 'Edit Note';
    } else {
        currentEditNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteModalTitle.textContent = 'New Note';
    }
    openModalImpl(noteModal);
    noteTitleInput.focus();
}


// --- TASKS FUNCTIONALITY ---

function renderTasks() {
    tasksContainer.innerHTML = '';

    // Client-side filtering and sorting
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        return task.priority === currentFilter;
    });

    // Sort: Incomplete first, then by priority (High > Medium > Low), then CreatedAt
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - (priorityWeight[a.priority] || 0);
        }
        // Timestamp handling for sort
        const tA = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA; // Newer first
    });

    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.</p>
            </div>`;
        return;
    }

    filteredTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
            </div>
            <div class="task-content">
                <span class="task-text">${escapeHtml(task.description)}</span>
                <div class="task-meta">
                     <span class="task-tag tag-${task.priority}">${task.priority}</span>
                     ${task.dueDate ? `<span class="task-date due-date">Due: ${formatDueDate(task.dueDate)}</span>` : ''}
                     <span class="task-date">Created: ${formatToIST(task.createdAt).split(',')[0]}</span>
                </div>
            </div>
            <button class="edit-task-btn" data-id="${task.id}" title="Edit Task">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="delete-task-btn" data-id="${task.id}" title="Delete Task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;

        const checkbox = taskEl.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => toggleTask(task));

        const editBtn = taskEl.querySelector('.edit-task-btn');
        editBtn.addEventListener('click', () => openTaskModal(task));

        const deleteBtn = taskEl.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        tasksContainer.appendChild(taskEl);
    });
}

async function saveTask() {
    const desc = taskDescInput.value.trim();
    const dateVal = taskDateInput.value;
    const timeVal = taskTimeInput.value;

    if (!desc) return;
    if (!currentUser) return;

    // Optimistic UI: Close immediately
    const tempEditId = currentEditTaskId; // Capture ID before clearing
    closeModalImpl(taskModal);

    // Clear fields and reset state
    taskDescInput.value = '';
    taskDateInput.value = '';
    taskTimeInput.value = '';
    const priorityToSave = currentTaskPriority; // Capture before reset
    setPriority('low'); // Reset priority
    currentEditTaskId = null; // Clear edit mode

    let finalDueDate = null;
    if (dateVal) {
        finalDueDate = dateVal;
        if (timeVal) {
            finalDueDate += 'T' + timeVal; // ISO string suffix
        }
    }

    try {
        if (tempEditId) {
            // Edit existing task
            const updateData = {
                description: desc,
                dueDate: finalDueDate,
                priority: priorityToSave,
                updatedAt: serverTimestamp()
            };

            // Reset reminder flags if due date changed
            const originalTask = tasks.find(t => t.id === tempEditId);
            if (originalTask && originalTask.dueDate !== finalDueDate) {
                updateData.reminder24hSent = false;
                updateData.reminder1hSent = false;
                updateData.reminder5mSent = false;
            }

            await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', tempEditId), updateData);
        } else {
            // Create new task
            await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
                description: desc,
                dueDate: finalDueDate,
                priority: priorityToSave,
                completed: false,
                createdAt: serverTimestamp(),
                completedAt: null,
                // Email reminder fields
                reminderEmail: currentUser.email,
                reminder24hSent: false,
                reminder1hSent: false,
                reminder5mSent: false
            });
        }
    } catch (e) {
        console.error(e);
        // Ideally show error toast here if it fails later
    }
}

async function toggleTask(task) {
    if (!currentUser) return;

    const newStatus = !task.completed;
    try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', task.id), {
            completed: newStatus,
            completedAt: newStatus ? new Date().toISOString() : null
            // Storing ISO string for completedAt to simplify analytics logic 
            // (or use serverTimestamp and convert in analytics) -> Let's use ISO for analytics consistency
        });
    } catch (e) {
        console.error(e);
    }
}

async function deleteTask(id) {
    if (!currentUser) return;
    try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
    } catch (e) { console.error(e); }
}

let isCheckingReminders = false;
async function checkTaskRemindersClientSide() {
    if (isCheckingReminders || !currentUser || typeof emailjs === 'undefined') return;
    isCheckingReminders = true;

    try {
        const now = new Date();
        const incompleteTasks = tasks.filter(t => !t.completed && t.dueDate);

        for (const task of incompleteTasks) {
            const dueDate = new Date(task.dueDate);
            const msUntilDue = dueDate - now;
            const hoursUntilDue = msUntilDue / (1000 * 60 * 60);

            let reminderType = null;
            let updateField = null;

            if (hoursUntilDue <= 24 && hoursUntilDue > 23 && !task.reminder24hSent) {
                reminderType = "24-hour";
                updateField = "reminder24hSent";
            } else if (hoursUntilDue <= 1 && hoursUntilDue > 0 && !task.reminder1hSent) {
                reminderType = "1-hour";
                updateField = "reminder1hSent";
            } else if (hoursUntilDue <= (5 / 60) && hoursUntilDue > 0 && !task.reminder5mSent) {
                reminderType = "5-minute";
                updateField = "reminder5mSent";
            }

            if (reminderType) {
                console.log(`Attempting to send ${reminderType} reminder for: ${task.description}`);

                try {
                    const taskRef = doc(db, 'users', currentUser.uid, 'tasks', task.id);

                    // Use a transaction to ensure only one tab/instance sends the email
                    await runTransaction(db, async (transaction) => {
                        const taskDoc = await transaction.get(taskRef);
                        if (!taskDoc.exists()) return;

                        const taskData = taskDoc.data();

                        // Check if the reminder was already sent (by another tab)
                        if (taskData[updateField]) {
                            console.log(`${reminderType} reminder already sent by another instance.`);
                            return;
                        }

                        // Mark as sent BEFORE sending the email to "lock" it
                        transaction.update(taskRef, {
                            [updateField]: true,
                            updatedAt: serverTimestamp()
                        });

                        // Now send the email
                        console.log(`Sending browser-based ${reminderType} reminder for: ${task.description}`);
                        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                            to_email: task.reminderEmail || currentUser.email,
                            to_name: currentUser.displayName || "Lumina User",
                            task_description: task.description,
                            due_date: formatDueDate(task.dueDate),
                            hours_until_due: Math.ceil(hoursUntilDue),
                        });

                        console.log(`${reminderType} email reminder sent successfully!`);
                    });
                } catch (err) {
                    console.error("Failed to execute reminder transaction/email:", err);
                }
            }
        }
    } finally {
        isCheckingReminders = false;
    }
}

// --- AI COMPANION & MENTOR LOGIC ---

async function callGeminiAPI(prompt, systemInstruction = "") {
    if (!geminiApiKey) {
        openAiSettingsModal();
        throw new Error("API Key missing");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: systemInstruction ? `${systemInstruction}\n\nUser: ${prompt}` : prompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.message.includes("API_KEY_INVALID") || data.error.code === 429 || data.error.status === "RESOURCE_EXHAUSTED") {
                localStorage.removeItem('gemini_api_key');
                geminiApiKey = '';
                openAiSettingsModal();
            }
            throw new Error(data.error.message);
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

function openAiSettingsModal() {
    geminiApiKeyInput.value = geminiApiKey;
    aiSettingsModal.classList.remove('hidden');
}

async function handleAiSuggest() {
    if (isAiGenerating) return;

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) {
        alert("Please enter a title or some keywords first so I can suggest ideas!");
        return;
    }

    isAiGenerating = true;
    aiNoteLoading.classList.remove('hidden');
    aiSuggestBtn.disabled = true;

    const systemPrompt = "You are a creative writing assistant for a notes app called Lumina. Your goal is to help the user expand their ideas. If they provide a short title, suggest a better one and expand the content. If they provide content, summarize it into a title and add 2-3 extra helpful points.";
    const userPrompt = `Title: ${title}\nContent: ${content}\n\nPlease suggest an improved Title and Content. Format your response exactly like this:\nTITLE: [Suggested Title]\nCONTENT: [Suggested Content]`;

    try {
        const result = await callGeminiAPI(userPrompt, systemPrompt);

        // Simple parsing
        const titleMatch = result.match(/TITLE:\s*(.*)/i);
        const contentMatch = result.match(/CONTENT:\s*([\s\S]*)/i);

        if (titleMatch) noteTitleInput.value = titleMatch[1].trim();
        if (contentMatch) noteContentInput.value = contentMatch[1].trim();

    } catch (error) {
        console.error("Suggestion failed:", error);
    } finally {
        isAiGenerating = false;
        aiNoteLoading.classList.add('hidden');
        aiSuggestBtn.disabled = false;
    }
}

async function handleAiRefine() {
    if (isAiGenerating) return;

    const content = noteContentInput.value.trim();
    if (!content) return;

    isAiGenerating = true;
    aiNoteLoading.classList.remove('hidden');
    aiRefineBtn.disabled = true;

    const systemPrompt = "You are a professional editor. Please refine and polish the user's note content to make it more professional, clear, and well-structured, while keeping the original meaning.";
    const userPrompt = `Please refine this note content:\n\n${content}`;

    try {
        const refinedContent = await callGeminiAPI(userPrompt, systemPrompt);
        noteContentInput.value = refinedContent.trim();
    } catch (error) {
        console.error("Refinement failed:", error);
    } finally {
        isAiGenerating = false;
        aiNoteLoading.classList.add('hidden');
        aiRefineBtn.disabled = false;
    }
}

function appendMessage(text, role) {
    const msgEl = document.createElement('div');
    msgEl.className = `ai-message ${role}`;
    msgEl.textContent = text;
    aiChatMessages.appendChild(msgEl);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

async function handleAiChat() {
    const userText = aiChatInput.value.trim();
    if (!userText || isAiGenerating) return;

    appendMessage(userText, 'user');
    aiChatInput.value = '';

    isAiGenerating = true;
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'ai-message assistant loading';
    loadingMsg.textContent = 'Mentor is thinking...';
    aiChatMessages.appendChild(loadingMsg);

    // Get context from ALL notes (RAG-like behavior)
    let notesContext = "Here is the user's current knowledge base (Notes):\n\n";
    if (notes.length === 0) {
        notesContext += "(No notes available yet).\n";
    } else {
        notes.forEach((note, index) => {
            notesContext += `[Note ${index + 1}] Title: ${note.title}\nContent: ${note.content}\n---\n`;
        });
    }

    // Get context of current note if modal is open (prioritize this)
    let currentEditingContext = "";
    if (!noteModal.classList.contains('hidden')) {
        currentEditingContext = `\nIMMEDIATE CONTEXT: The user is currently editing a specific note with Title: "${noteTitleInput.value}" and Content: "${noteContentInput.value}". Pay special attention to this.`;
    }

    const systemPrompt = `You are Lumina Mentor, a wise and helpful assistant. 

${notesContext}
${currentEditingContext}

INSTRUCTIONS:
1. Answer the user's question based PRIMARILY on the data provided in the Notes above.
2. If you find the answer in the notes, explicitly cite the Note Title (e.g., "According to your note 'Grocery List'...").
3. If the answer is NOT found in the notes, explicitly state: "I couldn't find specific information about that in your notes." before offering general knowledge or advice.
4. Be concise and helpful.`;

    try {
        const aiResponse = await callGeminiAPI(userText, systemPrompt);
        aiChatMessages.removeChild(loadingMsg);
        appendMessage(aiResponse, 'assistant');
    } catch (error) {
        if (aiChatMessages.contains(loadingMsg)) {
            aiChatMessages.removeChild(loadingMsg);
        }
        appendMessage(`Error: ${error.message || "Unknown error occurred."}. Please check your API key settings.`, 'assistant');
        console.error("Full AI Error:", error);
    } finally {
        isAiGenerating = false;
    }
}

function openTaskModal(task = null) {
    if (task) {
        // Edit mode
        currentEditTaskId = task.id;
        taskDescInput.value = task.description;

        // Parse due date if exists
        if (task.dueDate) {
            const [datePart, timePart] = task.dueDate.split('T');
            taskDateInput.value = datePart || '';
            taskTimeInput.value = timePart || '';
        } else {
            taskDateInput.value = '';
            taskTimeInput.value = '';
        }

        setPriority(task.priority || 'low');
        taskModalTitle.textContent = 'Edit Task';
    } else {
        // Create mode
        currentEditTaskId = null;
        taskDescInput.value = '';
        taskDateInput.value = '';
        taskTimeInput.value = '';
        setPriority('low');
        taskModalTitle.textContent = 'New Task';
    }
    openModalImpl(taskModal);
    taskDescInput.focus();
}

function setPriority(priority) {
    currentTaskPriority = priority;
    priorityBtns.forEach(btn => {
        if (btn.dataset.value === priority) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}


// --- ANALYTICS FUNCTIONALITY ---

function updateAnalytics() {
    // Logic mostly same, but need to handle Firestore Timestamps vs Dates
    const timeframe = document.getElementById('analytics-timeframe').value;
    const now = new Date();
    const startOfTimeframe = getStartOfTimeframe(now, timeframe);

    let relevantTasks = tasks.filter(task => {
        // Handle creation date (Firestore Timestamp)
        let createdAt;
        if (task.createdAt && task.createdAt.toDate) {
            createdAt = task.createdAt.toDate();
        } else {
            createdAt = new Date(task.createdAt || Date.now()); // Fallback
        }

        // Handle completedAt (String ISO or Timestamp)
        let completedAt = null;
        if (task.completedAt) {
            completedAt = new Date(task.completedAt); // Parses ISO string fine
        }

        if (task.completed && completedAt) {
            return completedAt >= startOfTimeframe;
        }
        return createdAt >= startOfTimeframe;
    });

    const completedCount = relevantTasks.filter(t => t.completed).length;
    const totalCount = relevantTasks.length;
    const incompleteCount = totalCount - completedCount;

    const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const incompleteRate = totalCount === 0 ? 0 : Math.round((incompleteCount / totalCount) * 100);

    animateValue("stat-completed-count", parseInt(document.getElementById("stat-completed-count").innerText) || 0, completedCount, 1000);

    document.getElementById("stat-completion-rate").innerText = `${completionRate}% `;
    document.getElementById("progress-completion").style.width = `${completionRate}% `;

    document.getElementById("stat-incomplete-rate").innerText = `${incompleteRate}% `;
    document.getElementById("progress-incomplete").style.width = `${incompleteRate}% `;
}

function getStartOfTimeframe(now, timeframe) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    if (timeframe === 'day') return date;

    if (timeframe === 'week') {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        date.setDate(diff);
        return date;
    }

    if (timeframe === 'month') {
        date.setDate(1);
        return date;
    }

    if (timeframe === 'year') {
        date.setMonth(0, 1);
        return date;
    }
    return date;
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    let pStartTime = null;
    const obj = document.getElementById(id);

    function step(timestamp) {
        if (!pStartTime) pStartTime = timestamp;
        const progress = timestamp - pStartTime;
        const objP = Math.min(progress / duration, 1);
        obj.innerHTML = Math.floor(start + (range * objP));
        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}


// --- UTILS & EVENT LISTENERS ---

// --- UTILS & EVENT LISTENERS ---

function formatToIST(dateInput) {
    if (!dateInput) return 'Just now';

    // Handle Firestore Timestamp
    const dateObj = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);

    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'Just now';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(dateObj);
}

function openModalImpl(modal) {
    modal.classList.remove('hidden');
}

function closeModalImpl(modal) {
    modal.classList.add('hidden');
}

function formatDueDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        // If it has time (contains T), show time.
        const options = { month: 'short', day: 'numeric' };
        if (dateStr.includes('T')) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return date.toLocaleDateString('en-IN', options);
    } catch (e) { return dateStr; }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Bindings
addNoteBtn.addEventListener('click', () => openNoteModal());
closeNoteModal.addEventListener('click', () => closeModalImpl(noteModal));
cancelNoteBtn.addEventListener('click', () => closeModalImpl(noteModal));
saveNoteBtn.addEventListener('click', saveNote);

addTaskBtn.addEventListener('click', openTaskModal);
closeTaskModal.addEventListener('click', () => closeModalImpl(taskModal));
cancelTaskBtn.addEventListener('click', () => closeModalImpl(taskModal));
saveTaskBtn.addEventListener('click', saveTask);

document.getElementById('analytics-timeframe').addEventListener('change', updateAnalytics);

[noteModal, taskModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalImpl(modal);
    });
});

priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => setPriority(btn.dataset.value));
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// AI Event Listeners
// AI Event Listeners
const aiMentorContainer = document.querySelector('.ai-mentor-container');
let isDragging = false;
let hasMoved = false;

// Drag Logic with Mouse/Touch
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragMouseDown;

    function dragMouseDown(e) {
        // Don't prevent default immediately to allow click events to start
        hasMoved = false;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        pos3 = clientX;
        pos4 = clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        // e.preventDefault(); // Optional: prevent scrolling on touch if desired

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);

        if (!clientX || !clientY) return;

        // Calculate the new cursor position:
        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;

        // Threshold for "drag" vs "click"
        if (Math.abs(pos1) > 1 || Math.abs(pos2) > 1) {
            hasMoved = true;
            isDragging = true;
        }

        // Set the element's new position:
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;

        // Boundaries
        const maxTop = window.innerHeight - element.offsetHeight;
        const maxLeft = window.innerWidth - element.offsetWidth;

        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop > maxTop) newTop = maxTop;
        if (newLeft > maxLeft) newLeft = maxLeft;

        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";

        // Important: clear right/bottom so left/top take effect if they were set by CSS
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.position = 'fixed'; // Ensure it's fixed
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;

        // Small delay to let click handler fire if it wasn't a drag
        setTimeout(() => {
            isDragging = false;
        }, 50);
    }
}

// Initialize Draggable
if (aiMentorContainer) {
    makeDraggable(aiMentorContainer, aiMentorTrigger);
}

// Toggle Chat (Click) with Adaptive Positioning
aiMentorTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hasMoved) {
        console.log("Drag detected, skipping toggle");
        hasMoved = false; // Reset
        return;
    }

    // Toggle hidden first
    const isHidden = aiChatPanel.classList.toggle('hidden');

    if (!isHidden) {
        console.log("Opening Chat - Calculating Position");

        // Get dimensions
        const iconRect = aiMentorTrigger.getBoundingClientRect();
        const panelWidth = 280; // Match CSS
        const panelHeight = 400; // Match CSS
        const gap = 20;

        // Window dimensions
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Default to opening TOP-LEFT of icon (icon is bottom-right usually)
        let openUp = true;
        let openLeft = true;

        // Check vertical space
        // Space above: iconRect.top
        // Space below: winH - iconRect.bottom
        if (iconRect.top < panelHeight + gap && (winH - iconRect.bottom) > panelHeight + gap) {
            // Not enough space above, but enough below -> Open DOWN
            openUp = false;
        }

        // Check horizontal space
        // Space left: iconRect.right
        // Space right: winW - iconRect.left
        // Ideally align right edge with icon right edge (openLeft)
        if (iconRect.right < panelWidth && (winW - iconRect.left) > panelWidth) {
            // Not enough space to Left align, but enough Right -> Open RIGHT
            openLeft = false;
        }

        // Apply styles
        aiChatPanel.style.bottom = openUp ? `calc(100% + ${gap}px)` : 'auto';
        aiChatPanel.style.top = openUp ? 'auto' : `calc(100% + ${gap}px)`;

        aiChatPanel.style.right = openLeft ? '0' : 'auto';
        aiChatPanel.style.left = openLeft ? 'auto' : '0';

        // Adjust Transform Origin for Animation
        let verticalOrigin = openUp ? 'bottom' : 'top';
        let horizontalOrigin = openLeft ? 'right' : 'left';
        aiChatPanel.style.transformOrigin = `${verticalOrigin} ${horizontalOrigin}`;
    }
});

// Close chat when clicking outside
document.addEventListener('click', (e) => {
    if (!aiChatPanel.classList.contains('hidden') &&
        !aiChatPanel.contains(e.target) &&
        !aiMentorTrigger.contains(e.target)) {
        aiChatPanel.classList.add('hidden');
    }
});

sendAiChat.addEventListener('click', handleAiChat);
aiChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAiChat();
});

aiSuggestBtn.addEventListener('click', handleAiSuggest);
aiRefineBtn.addEventListener('click', handleAiRefine);

closeAiSettings.addEventListener('click', () => {
    aiSettingsModal.classList.add('hidden');
});

saveAiSettings.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    if (key) {
        geminiApiKey = key;
        localStorage.setItem('gemini_api_key', key);
        aiSettingsModal.classList.add('hidden');
        alert("Gemini API Key saved! AI features enabled.");
    }
});

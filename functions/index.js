const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const https = require("https");

initializeApp();
const db = getFirestore();

// EmailJS configuration
const EMAILJS_SERVICE_ID = "service_tmskqar";
const EMAILJS_TEMPLATE_ID = "template_v9zl8hq";
const EMAILJS_PUBLIC_KEY = "Cpbw9QFgxOLhJ53O7";

/**
 * Sends an email using EmailJS REST API
 */
async function sendEmail(toEmail, userName, taskDescription, dueDate, hoursUntilDue) {
    const emailData = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
            to_email: toEmail,
            to_name: userName,
            task_description: taskDescription,
            due_date: dueDate,
            hours_until_due: hoursUntilDue,
        },
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(emailData);

        const options = {
            hostname: "api.emailjs.com",
            port: 443,
            path: "/api/v1.0/email/send",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`EmailJS API returned status ${res.statusCode}`));
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Scheduled function that runs every hour to check for tasks
 * that need reminders
 */
exports.checkTaskReminders = onSchedule("every 1 hours", async (event) => {
    console.log("Checking for task reminders...");

    try {
        // Get all users
        const usersSnapshot = await db.collection("users").get();

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            console.log(`Checking tasks for user: ${userId}`);

            // Get user's email from auth (stored in tasks)
            const tasksSnapshot = await db
                .collection("users")
                .doc(userId)
                .collection("tasks")
                .where("completed", "==", false)
                .get();

            const now = new Date();

            for (const taskDoc of tasksSnapshot.docs) {
                const task = taskDoc.data();

                // Skip if no due date
                if (!task.dueDate) continue;

                // Parse due date
                const dueDate = new Date(task.dueDate);
                const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

                // Check if we need to send 24h reminder
                if (hoursUntilDue <= 24 && hoursUntilDue > 23 && !task.reminder24hSent) {
                    console.log(`Sending 24h reminder for task: ${task.description}`);

                    try {
                        await sendEmail(
                            task.reminderEmail || "user@example.com",
                            "User",
                            task.description,
                            dueDate.toLocaleString(),
                            "24",
                        );

                        // Mark reminder as sent
                        await taskDoc.ref.update({
                            reminder24hSent: true,
                        });

                        console.log("24h reminder sent successfully");
                    } catch (error) {
                        console.error("Error sending 24h reminder:", error);
                    }
                }

                // Check if we need to send 1h reminder
                if (hoursUntilDue <= 1 && hoursUntilDue > 0 && !task.reminder1hSent) {
                    console.log(`Sending 1h reminder for task: ${task.description}`);

                    try {
                        await sendEmail(
                            task.reminderEmail || "user@example.com",
                            "User",
                            task.description,
                            dueDate.toLocaleString(),
                            "1",
                        );

                        // Mark reminder as sent
                        await taskDoc.ref.update({
                            reminder1hSent: true,
                        });

                        console.log("1h reminder sent successfully");
                    } catch (error) {
                        console.error("Error sending 1h reminder:", error);
                    }
                }
            }
        }

        console.log("Task reminder check completed");
        return null;
    } catch (error) {
        console.error("Error in checkTaskReminders:", error);
        throw error;
    }
});

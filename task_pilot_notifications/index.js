// const admin = require("firebase-admin");

// // Replace the path below with the path to your Firebase service account key JSON file
// const serviceAccount = require("../serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// async function checkOverdueTasks() {
//   const now = new Date();
//   const tasksSnapshot = await admin.firestore()
//     .collection("tasks")
//     .where("status", "!=", "Completed")
//     .get();

//   const overdueTasks = [];
//   tasksSnapshot.forEach((doc) => {
//     const task = doc.data();
//     if (task.deadline.toDate() < now) {
//       overdueTasks.push({
//         assignee: task.assignee,
//         title: task.title,
//         priority: task.priority,
//         deadline: task.deadline.toDate().toLocaleDateString(),
//       });
//     }
//   });

//   const limitedTasks = overdueTasks.slice(0, 10);
//   limitedTasks.forEach((task) => {
//     sendNotification(task.assignee, `Task "${task.title}" (Priority: ${task.priority}) is overdue! Deadline was ${task.deadline}`);
//   });
// }

// function sendNotification(userId, message) {
//   admin.firestore().collection("employeeNotifications").add({
//     userId: userId,
//     message: message,
//     timestamp: admin.firestore.FieldValue.serverTimestamp(),
//   });
// }

// // Call the function manually (e.g., from a script or an endpoint)
// checkOverdueTasks().catch(console.error);
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.checkAndSendNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  console.log('Running checkAndSendNotifications function');
  console.log('Current time:', now.toISOString());
  console.log('Checking tasks due by:', threeDaysFromNow.toISOString());

  try {
    const tasksSnapshot = await db.collection('tasks').get();
    console.log('Fetched tasks count:', tasksSnapshot.size);

    const batch = db.batch();

    tasksSnapshot.forEach(doc => {
      const task = doc.data();
      const deadline = task.deadline.toDate(); // Ensure the deadline is in Date format
      const timeRemaining = (deadline - now) / (1000 * 60 * 60 * 24); // Time remaining in days

      console.log(`Task "${task.title}" - deadline: ${deadline.toISOString()}, time remaining: ${timeRemaining} days`);

      if (timeRemaining <= 3 || deadline < now) {
        let message = `Task "${task.title}" `;
        if (deadline < now) {
          message += `is overdue! Deadline was ${deadline.toLocaleDateString()}.`;
        } else {
          message += `is due in ${Math.ceil(timeRemaining)} days.`;
        }

        const notification = {
          message: message,
          userId: task.assignee,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          title: task.title,
          priority: task.priority,
          deadline: deadline
        };

        const notificationRef = db.collection('employee-notifications').doc();
        batch.set(notificationRef, notification);
      }
    });

    await batch.commit();
    console.log('Notifications generated and sent successfully.');
  } catch (error) {
    console.error('Error checking and sending notifications:', error);
  }
});

// Function to clear notifications collection for admin side
exports.clearAdminNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  console.log('Running clearAdminNotifications function');

  try {
    const notificationsSnapshot = await db.collection('notifications').get();
    console.log('Fetched notifications count:', notificationsSnapshot.size);

    const batch = db.batch();

    notificationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Admin notifications cleared');
  } catch (error) {
    console.error('Error clearing admin notifications:', error);
  }
});

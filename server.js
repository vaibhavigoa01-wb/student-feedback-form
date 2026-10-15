
// Import the required modules
const express = require("express");
const path = require("path");

// Create the Express application
const app = express();
const PORT = 3000;

// Store submitted feedback temporarily in memory
const feedbackList = [];

// Middleware to read JSON data from requests
app.use(express.json());

// Serve the frontend files
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"));
});

// POST route to receive student feedback
app.post("/submit-feedback", (req, res) => {
    const { name, email, subject, rating, message } = req.body;

    // Check that every field is provided as text
    const fields = [name, email, subject, rating, message];

    if (
        fields.some(
            field => typeof field !== "string" || field.trim() === ""
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Error: All fields are required."
        });
    }

    // Remove unnecessary spaces
    const studentName = name.trim();
    const studentEmail = email.trim();
    const subjectName = subject.trim();
    const feedbackMessage = message.trim();

    // Validate student name
    if (studentName.length < 2 || studentName.length > 60) {
        return res.status(400).json({
            success: false,
            message: "Name must contain 2 to 60 characters."
        });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(studentEmail) || studentEmail.length > 254) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    // Validate subject name
    if (subjectName.length < 2 || subjectName.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Subject must contain 2 to 100 characters."
        });
    }

    // Validate rating: only whole numbers from 1 to 5
    if (!/^[1-5]$/.test(rating)) {
        return res.status(400).json({
            success: false,
            message: "Rating must be a number between 1 and 5."
        });
    }

    // Validate feedback message
    if (feedbackMessage.length < 10 || feedbackMessage.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Feedback must contain 10 to 1000 characters."
        });
    }

    // Create the feedback record
    const newFeedback = {
        id: feedbackList.length + 1,
        name: studentName,
        email: studentEmail,
        subject: subjectName,
        rating: Number(rating),
        message: feedbackMessage,
        submittedAt: new Date().toISOString()
    };

    // Save the feedback temporarily
    feedbackList.push(newFeedback);

    // Send a successful response
    return res.status(201).json({
        success: true,
        message: "Thank you! Your feedback has been submitted successfully."
    });
});

// Handle invalid JSON requests
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON data."
        });
    }

    return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
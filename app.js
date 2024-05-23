// Importing required modules
const express = require('express');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001; // Changed port to 3001

// Initializing Express app
const app = express();

// To connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test');

// For Defining the schema and model
const courseSchema = new mongoose.Schema({
    code: String,
    description: String,
    units: Number,
    tags: [String]
});

const Course = mongoose.model('Course', courseSchema);

// Middleware used
app.use(express.json());

app.get('/courses', async (req, res) => {
    try {
        // Retrieve all courses from the database
        const allCourses = await Course.find();

        // Combine all courses into a single array
        const CoursesArray = allCourses.reduce((acc, curr) => {
            return acc.concat(Object.values(curr.toObject()).filter(Array.isArray).flat());
        }, []);

        // Sort the combined array alphabetically by description
        CoursesArray.sort((a, b) => a.description.localeCompare(b.description));

        // Send the sorted courses in the response
        res.send(CoursesArray);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Route to get courses by query using BSIS or BSIT
app.get('/courses/:query', async (req, res) => {
    const query = req.params.query.toUpperCase();

    // Validate the query parameter
    if (query !== 'BSIS' && query !== 'BSIT') {
        return res.status(400).send('Invalid Course. Please provide BSIS or BSIT.');
    }

    try {
        const allCourses = await Course.find();

        // For Combining all courses into a single array
        const coursesArray = allCourses.reduce((acc, curr) => {
            return acc.concat(Object.values(curr.toObject()).filter(Array.isArray).flat());
        }, []);

        // For filtering the courses based on the query
        const filteredCourses = coursesArray.filter(course =>
            course.tags.includes(query) &&
            (course.tags.includes('BSIS') || course.tags.includes('BSIT'))
        );

        // To Extract the name and specialization or description of each course
        const coursesExtract = filteredCourses.map(course => ({
            name: course.code,
            specialization: course.description
        }));

        res.send(coursesExtract);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Code to start server
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on port ${PORT}`);
    } catch (err) {
        console.error('Error populating initial data:', err);
    }
});
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const Internship = require('./src/models/Internship');

async function fixInternshipImage() {
    try {
        const uri = 'mongodb://127.0.0.1:27017/upwise';
        await mongoose.connect(uri);

        // Update UI/UX Product Design Mastery
        const res = await Internship.updateOne(
            { title: "UI/UX Product Design Mastery" },
            { $set: { thumbnail: "https://images.unsplash.com/photo-1561070791-23c14d802cb3?q=80&w=800&auto=format&fit=crop" } }
        );

        console.log('Updated:', res.nModified || res.modifiedCount, 'internship(s)');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixInternshipImage();

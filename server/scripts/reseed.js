require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course');
const User = require('../src/models/User');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upwise';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Load course data
    const raw = require(path.resolve(__dirname, '../../my-app/src/data/coursesData.js'));
    const coursesData = raw.default || raw;
    console.log('Loaded', coursesData.length, 'courses from data file');

    // Clear and re-insert courses
    await Course.deleteMany({});
    const toInsert = coursesData.map(c => {
        const { id: legacyId, ...rest } = c;
        if (rest.level) rest.level = rest.level.charAt(0).toUpperCase() + rest.level.slice(1);
        return {
            ...rest,
            legacyId,
            priceNumber: typeof rest.price === 'number' ? rest.price : 99,
            createdAt: new Date()
        };
    });
    await Course.insertMany(toInsert);

    const courses = await Course.find({}).lean();
    console.log('Inserted', courses.length, 'courses');

    // Update user purchases using Mongoose save() so subdoc _ids are generated
    const ids = courses.map(c => c._id);
    const users = await User.find({});
    let updated = 0;
    for (const user of users) {
        try {
            user.purchasedCourses = ids.map(id => ({
                courseId: id,
                price: 99,
                purchasedAt: new Date(),
                status: 'active'
            }));
            await user.save();
            updated++;
            console.log('OK:', user.email, '- subdoc _id:', user.purchasedCourses[0]?._id);
        } catch (err) {
            // Fallback: use raw update for users with schema validation issues
            console.log('WARN: Mongoose save failed for', user.email, '- using raw update');
            const purchasesWithIds = ids.map(id => ({
                _id: new mongoose.Types.ObjectId(),
                courseId: id,
                price: 99,
                purchasedAt: new Date(),
                status: 'active'
            }));
            await mongoose.connection.db.collection('users').updateOne(
                { _id: user._id },
                { $set: { purchasedCourses: purchasesWithIds } }
            );
            updated++;
        }
    }

    console.log('Done! Updated', updated, 'of', users.length, 'users');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

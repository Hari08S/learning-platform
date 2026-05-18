const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Internship = require('../server/src/models/Internship');

async function checkInternships() {
    try {
        const uri = 'mongodb://127.0.0.1:27017/upwise';
        await mongoose.connect(uri);
        const internships = await Internship.find({}, 'title thumbnail').lean();
        console.log(JSON.stringify(internships, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkInternships();

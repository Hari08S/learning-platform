const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Course = require('../models/Course.js');

async function run() {
    try {
        const uri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upwise').replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);

        const courses = await Course.find({});
        for (let course of courses) {
            let updated = false;
            for (let i = 0; i < course.curriculum.length; i++) {
                let currentBody = course.curriculum[i].body;
                if (!currentBody || currentBody.trim().length < 10) {
                    updated = true;
                    // Add some rich default content
                    course.curriculum[i].body = `<div class='lesson-content' style='font-family: inherit; line-height: 1.8; color: #374151;'>
                        <h2 style='font-weight: 800; font-size: 1.6rem; color: #111827; margin-bottom: 12px;'>Module: ${course.curriculum[i].title}</h2>
                        <p style='margin-bottom: 24px;'>Welcome to this comprehensive lesson. In this module, we will be covering the fundamental concepts and practical applications of the topic at hand. It's designed to give you both the theoretical background and the hands-on experience you need to excel.</p>
                        
                        <h3 style='font-weight: 700; font-size: 1.3rem; color: #1f2937; margin-top: 32px; margin-bottom: 12px;'>Key Learning Objectives</h3>
                        <ul style='margin-left: 20px; margin-bottom: 28px; list-style-type: disc; display: flex; flex-direction: column; gap: 8px;'>
                            <li>Understand the core principles and underlying architecture.</li>
                            <li>Analyze real-world case studies to see these concepts in action.</li>
                            <li>Implement best practices confidently in your own projects.</li>
                            <li>Develop strategies to troubleshoot common pitfalls and errors.</li>
                        </ul>

                        <h3 style='font-weight: 700; font-size: 1.3rem; color: #1f2937; margin-top: 32px; margin-bottom: 12px;'>Deep Dive: Theory & Practice</h3>
                        <p style='margin-bottom: 16px;'>When starting out, it's crucial to lay a solid foundation. Our approach combines robust theoretical frameworks with practical, hands-on exercises. By the end of this deep dive, you will have a clear understanding of the 'why' behind the 'how'.</p>
                        <p style='margin-bottom: 24px;'>Consider the importance of scalability, maintainability, and clean design patterns. As we progress through the curriculum, you'll see how these isolated concepts interlock to form a complete, robust system architecture.</p>
                        
                        <div style='background: #fdf2f8; padding: 20px; border-left: 5px solid #ec4899; margin: 32px 0; border-radius: 8px;'>
                            <strong style='color: #be185d; font-size: 1.1rem; display: block; margin-bottom: 8px;'>💡 Pro Tip: Leverage the Community</strong>
                            <p style='margin: 0;'>Always review the official documentation and community forums (like Stack Overflow or dedicated Discord channels) when encountering unfamiliar errors. The ecosystem is continually evolving, and staying connected is key to continuous growth!</p>
                        </div>

                        <h3 style='font-weight: 700; font-size: 1.3rem; color: #1f2937; margin-top: 32px; margin-bottom: 12px;'>Summary and Next Steps</h3>
                        <p style='margin-bottom: 16px;'>We've covered a lot of ground today. Take a moment to digest these new concepts. It is highly recommended to review the supplementary materials and documentation links provided.</p>
                        <p style='margin-bottom: 32px; font-weight: 600; color: #4f46e5;'>Keep up the great work! Your dedication to learning is paving the way to mastery.</p>
                    </div>`;
                }
            }
            if (updated) {
                await Course.updateOne({ _id: course._id }, { $set: { curriculum: course.curriculum } });
                console.log('Updated content for course:', course.title);
            }
        }
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();

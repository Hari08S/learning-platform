// migrateQuizzesIntoCourses.js
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');   // your model (collection: quizzes)
const Course = require('../models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upwise';

/**
 * Normalize an incoming quiz doc's questions into canonical course.quiz.questions shape:
 * - options: [{id, text}]
 * - correctOptionId: string | null
 * - text: string
 * - points: number
 */
function normalizeQuestion(q, qi) {
  // q may have: choices (array of strings) + answerIndex, or options already
  let options = [];
  if (Array.isArray(q.options) && q.options.length) {
    options = q.options.map((o, idx) => ({
      id: o.id != null ? String(o.id) : (o._id != null ? String(o._id) : String(idx)),
      text: o.text ?? o.label ?? (typeof o === 'string' ? o : '')
    }));
  } else if (Array.isArray(q.choices) && q.choices.length) {
    options = q.choices.map((txt, idx) => ({ id: String(idx), text: String(txt) }));
  }

  let correctOptionId = null;
  if (q.correctOptionId != null) correctOptionId = String(q.correctOptionId);
  else if (q.answerIndex != null && Number.isFinite(Number(q.answerIndex)) && options[Number(q.answerIndex)]) {
    correctOptionId = options[Number(q.answerIndex)].id;
  } else if (q.answer != null) {
    // attempt to map textual answer to an option id
    const matchIdx = (Array.isArray(q.choices) ? q.choices.findIndex(c => String(c) === String(q.answer)) : -1);
    if (matchIdx >= 0 && options[matchIdx]) correctOptionId = options[matchIdx].id;
  }

  const text = q.text ?? q.question ?? q.title ?? `Question ${qi + 1}`;

  return {
    _id: q._id ?? q.id ?? `q${qi + 1}`,
    id: q.id ?? (q._id ? String(q._id) : `q${qi + 1}`),
    text: text,
    options,
    correctOptionId,
    points: Number(q.points || 1)
  };
}

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const quizzes = await Quiz.find({}).lean();
    if (!quizzes || quizzes.length === 0) {
      console.log('No quiz docs found in quizzes collection. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }

    const dryRun = String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false';
    const deleteSource = String(process.env.DELETE_SOURCE || 'false').toLowerCase() === 'true';

    console.log(`Found ${quizzes.length} quiz docs. dryRun=${dryRun} deleteSource=${deleteSource}`);

    for (const qdoc of quizzes) {
      const courseId = qdoc.courseId;
      if (!courseId) {
        console.warn('Skipping quiz (no courseId):', qdoc._id);
        continue;
      }

      const course = await Course.findById(courseId).lean();
      if (!course) {
        console.warn('No matching course for quiz', qdoc._id.toString(), 'courseId:', String(courseId));
        continue;
      }

      // Build canonical quiz object for Course.quiz
      const mapped = {
        _id: qdoc._id ?? course._id,
        title: qdoc.title ?? `${course.title} — Quiz`,
        estimatedMins: qdoc.estimatedMins ?? qdoc.estimatedMinutes ?? 10,
        passingPercentage: qdoc.passingPercentage ?? qdoc.passThreshold ?? 50,
        questions: Array.isArray(qdoc.questions) ? qdoc.questions.map(normalizeQuestion) : []
      };

      // If course already has an embedded quiz, show diff and skip unless FORCE=true
      if (course.quiz && Array.isArray(course.quiz.questions) && course.quiz.questions.length > 0) {
        const force = String(process.env.FORCE || 'false').toLowerCase() === 'true';
        console.log(`Course ${course._id} already has embedded quiz (${course.quiz.questions.length} questions). force=${force}`);
        if (!force) {
          console.log('Skipping migration for this course. (Use FORCE=true to override)');
          continue;
        }
      }

      console.log(`--- Migrating quiz ${qdoc._id} → Course ${course._id}`);
      console.log('Mapped quiz summary:', {
        title: mapped.title,
        estimatedMins: mapped.estimatedMins,
        passingPercentage: mapped.passingPercentage,
        questionsCount: mapped.questions.length
      });

      if (!dryRun) {
        // set the course.quiz and hasQuiz flag
        await Course.findByIdAndUpdate(course._id, {
          $set: { quiz: mapped, hasQuiz: true }
        });
        console.log('Saved quiz into course', course._id.toString());

        if (deleteSource) {
          try {
            await Quiz.deleteOne({ _id: qdoc._id });
            console.log('Deleted original quiz doc', qdoc._id.toString());
          } catch (e) {
            console.warn('Failed to delete source quiz doc', qdoc._id, e && e.message);
          }
        }
      } else {
        console.log('(dry-run) would write quiz to course and' + (deleteSource ? ' delete source' : ' keep source'));
      }
    }

    console.log('Migration complete.');
    if (dryRun) console.log('DRY RUN was enabled. Rerun with DRY_RUN=false to apply changes.');
    if (deleteSource && dryRun) console.log('DELETE_SOURCE requested but DRY_RUN=true — nothing deleted.');

  } catch (err) {
    console.error('Migration error', err);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

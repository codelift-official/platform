const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:CodeLift15July@db.yuznthzgyrkrxhzldmdi.supabase.co:5432/postgres';

async function repairCourse() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL database');

  // 1. Ensure table schema has quiz_questions column
  await client.query("ALTER TABLE public.course_topics ADD COLUMN IF NOT EXISTS quiz_questions jsonb DEFAULT '[]'::jsonb;");
  await client.query("ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS quiz_questions jsonb DEFAULT '[]'::jsonb;");
  console.log('Verified database schema columns');

  // 2. Read course data
  const jsonPath = path.resolve(__dirname, '..', 'data', 'python-56-modules.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const courseData = JSON.parse(raw);

  // 3. Find existing course in DB
  const courseRes = await client.query(
    "SELECT id, title, slug FROM public.courses WHERE title ILIKE $1 OR id = $2 LIMIT 1",
    ['%Python Programming: Beginner to Advanced (56 Modules)%', 'course-1789658119246-og24151']
  );

  let courseId;
  if (courseRes.rows.length > 0) {
    courseId = courseRes.rows[0].id;
    console.log(`Found existing course in DB: ${courseId} (${courseRes.rows[0].title})`);
    
    // Update course metadata to ensure it is published and elective
    await client.query(
      `UPDATE public.courses 
       SET title = $1, description = $2, course_type = 'elective', is_free = true, is_published = true, price = 0
       WHERE id = $3`,
      [courseData.title, courseData.description, courseId]
    );
  } else {
    courseId = `course-python-56m-${Date.now()}`;
    const slug = 'python-programming-beginner-to-advanced';
    console.log(`Creating course row in DB: ${courseId}`);
    await client.query(
      `INSERT INTO public.courses (id, title, slug, description, category_id, course_type, price, is_free, is_published, is_approved)
       VALUES ($1, $2, $3, $4, 'cat-web', 'elective', 0, true, true, true)`,
      [courseId, courseData.title, slug, courseData.description]
    );
  }

  // 4. Clean previous modules (cascades to topics)
  await client.query("DELETE FROM public.course_modules WHERE course_id = $1", [courseId]);
  console.log(`Cleared previous modules for course ${courseId}`);

  // 5. Insert modules and topics
  let totalTopicsInserted = 0;
  for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
    const mod = courseData.modules[mIdx];
    const modId = `mod-${Date.now()}-${mIdx}-${Math.random().toString(36).slice(2, 6)}`;
    const modQuiz = Array.isArray(mod.quizQuestions) ? JSON.stringify(mod.quizQuestions) : '[]';

    await client.query(
      `INSERT INTO public.course_modules (id, course_id, title, order_index, quiz_questions)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [modId, courseId, mod.title, mIdx, modQuiz]
    );

    if (Array.isArray(mod.topics) && mod.topics.length > 0) {
      for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
        const top = mod.topics[tIdx];
        const topId = `top-${Date.now()}-${mIdx}-${tIdx}-${Math.random().toString(36).slice(2, 6)}`;
        const topQuiz = Array.isArray(top.quizQuestions) ? JSON.stringify(top.quizQuestions) : '[]';
        const contentMd = top.contentMd || top.content_md || top.content || `# ${top.title}\n\nContent for this lecture.`;

        await client.query(
          `INSERT INTO public.course_topics (id, module_id, title, content_md, order_index, quiz_questions)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
          [topId, modId, top.title, contentMd, tIdx, topQuiz]
        );
        totalTopicsInserted++;
      }
    }
  }

  console.log(`\n🎉 Successfully restored course ${courseId}:`);
  console.log(`- Modules inserted: ${courseData.modules.length}`);
  console.log(`- Topics inserted: ${totalTopicsInserted}`);

  // Verify in DB
  const verifyMods = await client.query("SELECT count(*)::int as c FROM public.course_modules WHERE course_id = $1", [courseId]);
  const verifyTops = await client.query(
    "SELECT count(*)::int as c FROM public.course_topics t JOIN public.course_modules m ON t.module_id = m.id WHERE m.course_id = $1",
    [courseId]
  );
  console.log(`- Verified in DB: ${verifyMods.rows[0].c} modules, ${verifyTops.rows[0].c} topics.`);

  await client.end();
}

repairCourse().catch(err => {
  console.error('Repair failed:', err);
  process.exit(1);
});

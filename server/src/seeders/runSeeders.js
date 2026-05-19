const bcrypt = require('bcrypt');
const db = require('../models');

async function runSeeders() {
  try {
    console.log('Synchronizing database...');
    // Caution: force: true drops all tables before recreating them
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // 1. Create Departments
    console.log('Seeding departments...');
    const depts = await db.Department.bulkCreate([
      { name: 'Computer Science and Engineering', code: 'CSE' },
      { name: 'Electrical and Electronic Engineering', code: 'EEE' },
      { name: 'Business Administration', code: 'BBA' }
    ]);

    // 2. Create Users
    console.log('Seeding users...');
    const defaultPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const usersToCreate = [
      {
        student_id: 'admin01',
        full_name: 'System Admin',
        email: 'admin@campuslink.edu',
        password_hash: defaultPassword,
        role: 'admin',
        is_verified: true
      }
    ];

    // Faculties
    for (let i = 1; i <= 5; i++) {
      usersToCreate.push({
        student_id: `fac${i}`,
        full_name: `Faculty Member ${i}`,
        email: `faculty${i}@campuslink.edu`,
        password_hash: userPassword,
        role: 'faculty',
        department_id: depts[i % 3].id,
        is_verified: true
      });
    }

    // Students
    for (let i = 1; i <= 30; i++) {
      usersToCreate.push({
        student_id: `stu2023${i.toString().padStart(3, '0')}`,
        full_name: `Student ${i}`,
        email: `student${i}@campuslink.edu`,
        password_hash: userPassword,
        role: 'student',
        department_id: depts[i % 3].id,
        batch: `2023`,
        is_verified: true
      });
    }

    const createdUsers = await db.User.bulkCreate(usersToCreate);
    const students = createdUsers.filter(u => u.role === 'student');
    const faculties = createdUsers.filter(u => u.role === 'faculty');

    // 3. Create Courses
    console.log('Seeding courses...');
    const coursesToCreate = [];
    for (let i = 1; i <= 10; i++) {
      coursesToCreate.push({
        code: `COURSE${100 + i}`,
        title: `Introduction to Topic ${i}`,
        department_id: depts[i % 3].id,
        credit_hours: 3.0,
        semester: (i % 8) + 1
      });
    }
    const courses = await db.Course.bulkCreate(coursesToCreate);

    // 4. Enrollments, Attendance & Marks
    console.log('Seeding enrollments and academics...');
    for (let i = 0; i < 20; i++) {
      const enrollment = await db.Enrollment.create({
        user_id: students[i].id,
        course_id: courses[i % 10].id,
        academic_year: '2025-2026',
        semester: courses[i % 10].semester
      });

      // Attendance
      await db.Attendance.bulkCreate([
        { enrollment_id: enrollment.id, class_date: new Date(), status: 'present', marked_by: faculties[0].id },
        { enrollment_id: enrollment.id, class_date: new Date(Date.now() - 86400000), status: 'late', marked_by: faculties[0].id }
      ]);

      // Marks
      await db.Mark.bulkCreate([
        { enrollment_id: enrollment.id, exam_type: 'CT1', marks_obtained: 15, total_marks: 20, recorded_by: faculties[0].id },
        { enrollment_id: enrollment.id, exam_type: 'midterm', marks_obtained: 40, total_marks: 50, recorded_by: faculties[0].id }
      ]);
    }

    // 5. Events
    console.log('Seeding events...');
    const eventsToCreate = [];
    for (let i = 1; i <= 8; i++) {
      eventsToCreate.push({
        organizer_id: faculties[i % 5].id,
        title: `Campus Event ${i}`,
        description: `This is the description for event ${i}`,
        location_type: 'auditorium',
        venue: `Main Auditorium ${i}`,
        start_time: new Date(Date.now() + i * 86400000), // Future days
        end_time: new Date(Date.now() + i * 86400000 + 7200000), // + 2 hours
        is_public: true
      });
    }
    await db.Event.bulkCreate(eventsToCreate);

    // 6. Posts
    console.log('Seeding posts...');
    const postsToCreate = [];
    for (let i = 1; i <= 15; i++) {
      postsToCreate.push({
        author_id: students[i % students.length].id,
        content: `This is an interesting post #${i} by student.`,
        visibility: 'public'
      });
    }
    await db.Post.bulkCreate(postsToCreate);

    // 7. Notices
    console.log('Seeding notices...');
    const noticesToCreate = [];
    for (let i = 1; i <= 5; i++) {
      noticesToCreate.push({
        posted_by: faculties[i % faculties.length].id,
        department_id: i % 2 === 0 ? null : depts[0].id,
        title: `Notice Update ${i}`,
        content: `Please read this important notice regarding topic ${i}.`,
        priority: 'important'
      });
    }
    await db.Notice.bulkCreate(noticesToCreate);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit();
  }
}

runSeeders();

const { Enrollment, Course, Attendance, Mark, SemesterResult, Routine, User, Department } = require('../models');
const { Op } = require('sequelize');

const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Course, include: [Department] }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Course, attributes: ['id', 'code', 'title', 'credit_hours'] },
        { model: Attendance, order: [['class_date', 'DESC']] }
      ]
    });

    const data = enrollments.map(e => {
      const total = e.Attendances.length;
      const present = e.Attendances.filter(a => a.status === 'present').length;
      const late = e.Attendances.filter(a => a.status === 'late').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : null;
      return {
        enrollment_id: e.id,
        course: e.Course,
        records: e.Attendances,
        summary: { total, present, late, absent: total - present - late, percentage }
      };
    });

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMarks = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Course, attributes: ['id', 'code', 'title', 'credit_hours'] },
        { model: Mark, order: [['recorded_at', 'DESC']] }
      ]
    });

    const data = enrollments.map(e => ({
      enrollment_id: e.id,
      course: e.Course,
      marks: e.Marks
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCgpa = async (req, res) => {
  try {
    const results = await SemesterResult.findAll({
      where: { user_id: req.user.id },
      order: [['published_at', 'ASC']]
    });
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRoutine = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id } });
    const courseIds = enrollments.map(e => e.course_id);

    const routine = await Routine.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      include: [
        { model: Course, attributes: ['id', 'code', 'title'] },
        { model: User, as: 'Instructor', attributes: ['id', 'full_name'] }
      ],
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });
    res.status(200).json(routine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Faculty: mark attendance for an enrollment
const markAttendance = async (req, res) => {
  try {
    const { enrollment_id, class_date, status } = req.body;
    const record = await Attendance.create({
      enrollment_id,
      class_date,
      status,
      marked_by: req.user.id
    });
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Faculty: record a mark
const recordMark = async (req, res) => {
  try {
    const { enrollment_id, exam_type, marks_obtained, total_marks } = req.body;
    const mark = await Mark.create({
      enrollment_id,
      exam_type,
      marks_obtained,
      total_marks,
      recorded_by: req.user.id,
      recorded_at: new Date()
    });
    res.status(201).json(mark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getEnrolledCourses, getAttendance, getMarks, getCgpa, getRoutine, markAttendance, recordMark };

const sequelize = require('../config/database');

const User = require('./User');
const Department = require('./Department');
const Connection = require('./Connection');
const Chat = require('./Chat');
const ChatMember = require('./ChatMember');
const Message = require('./Message');
const FileAttachment = require('./FileAttachment');
const Notification = require('./Notification');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Attendance = require('./Attendance');
const Mark = require('./Mark');
const SemesterResult = require('./SemesterResult');
const Routine = require('./Routine');
const Event = require('./Event');
const EventRSVP = require('./EventRSVP');
const Post = require('./Post');
const PostLike = require('./PostLike');
const PostComment = require('./PostComment');
const Notice = require('./Notice');

// Define Associations

// --- Users & Departments ---
User.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(User, { foreignKey: 'department_id' });

// --- Connections ---
Connection.belongsTo(User, { as: 'Requester', foreignKey: 'requester_id' });
Connection.belongsTo(User, { as: 'Addressee', foreignKey: 'addressee_id' });
User.hasMany(Connection, { foreignKey: 'requester_id' });
User.hasMany(Connection, { foreignKey: 'addressee_id' });

// --- Chats & Messages ---
Chat.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });
Chat.hasMany(ChatMember, { foreignKey: 'chat_id' });
ChatMember.belongsTo(Chat, { foreignKey: 'chat_id' });
ChatMember.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(ChatMember, { foreignKey: 'user_id' });

Chat.hasMany(Message, { foreignKey: 'chat_id' });
Message.belongsTo(Chat, { foreignKey: 'chat_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });

Message.hasMany(FileAttachment, { foreignKey: 'message_id' });
FileAttachment.belongsTo(Message, { foreignKey: 'message_id' });

// --- Notifications ---
Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });

// --- Academics ---
Course.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Course, { foreignKey: 'department_id' });

Enrollment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Enrollment, { foreignKey: 'user_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Enrollment, { foreignKey: 'course_id' });

Attendance.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Enrollment.hasMany(Attendance, { foreignKey: 'enrollment_id' });
Attendance.belongsTo(User, { as: 'Marker', foreignKey: 'marked_by' });

Mark.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Enrollment.hasMany(Mark, { foreignKey: 'enrollment_id' });
Mark.belongsTo(User, { as: 'Recorder', foreignKey: 'recorded_by' });

SemesterResult.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(SemesterResult, { foreignKey: 'user_id' });

Routine.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Routine, { foreignKey: 'course_id' });
Routine.belongsTo(User, { as: 'Instructor', foreignKey: 'instructor_id' });

// --- Events ---
Event.belongsTo(User, { as: 'Organizer', foreignKey: 'organizer_id' });
User.hasMany(Event, { foreignKey: 'organizer_id' });

EventRSVP.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(EventRSVP, { foreignKey: 'event_id' });
EventRSVP.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(EventRSVP, { foreignKey: 'user_id' });

// --- Posts ---
Post.belongsTo(User, { as: 'Author', foreignKey: 'author_id' });
User.hasMany(Post, { foreignKey: 'author_id' });

PostLike.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(PostLike, { foreignKey: 'post_id' });
PostLike.belongsTo(User, { foreignKey: 'user_id' });

PostComment.belongsTo(Post, { foreignKey: 'post_id' });
Post.hasMany(PostComment, { foreignKey: 'post_id' });
PostComment.belongsTo(User, { foreignKey: 'user_id' });

// --- Notices ---
Notice.belongsTo(User, { as: 'Poster', foreignKey: 'posted_by' });
Notice.belongsTo(Department, { foreignKey: 'department_id' });

const db = {
  sequelize,
  User,
  Department,
  Connection,
  Chat,
  ChatMember,
  Message,
  FileAttachment,
  Notification,
  Course,
  Enrollment,
  Attendance,
  Mark,
  SemesterResult,
  Routine,
  Event,
  EventRSVP,
  Post,
  PostLike,
  PostComment,
  Notice
};

module.exports = db;

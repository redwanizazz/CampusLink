const { Event, EventRSVP, User, Department, Notification } = require('../models');
const { Op } = require('sequelize');
const { emitNotification, broadcastEventUpdate } = require('../socket/index');

const getEvents = async (req, res) => {
  try {
    const { location_type, upcoming } = req.query;
    const where = {};
    if (location_type) where.location_type = location_type;
    if (upcoming === 'true') where.start_time = { [Op.gte]: new Date() };

    const events = await Event.findAll({
      where,
      include: [{ model: User, as: 'Organizer', attributes: ['id', 'full_name', 'avatar_url'] }],
      order: [['start_time', 'ASC']]
    });
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Organizer', attributes: ['id', 'full_name', 'avatar_url'] },
        {
          model: EventRSVP,
          include: [{ model: User, attributes: ['id', 'full_name', 'avatar_url'] }]
        }
      ]
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, location_type, venue, start_time, end_time, is_public, contact_info } = req.body;
    const event = await Event.create({
      organizer_id: req.user.id,
      title,
      description,
      location_type,
      venue,
      start_time,
      end_time,
      is_public: is_public !== false,
      contact_info
    });
    res.status(201).json(event);

    try {
      const organizer = await User.findByPk(req.user.id, { attributes: ['full_name'] });
      broadcastEventUpdate({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        venue: event.venue,
        organizer_id: req.user.id,
        organizer_name: organizer?.full_name,
      });
    } catch (e) {
      console.error('event_update broadcast error:', e.message);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, organizer_id: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });
    await event.update(req.body);
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, organizer_id: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event not found or unauthorized' });
    await event.destroy();
    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rsvpEvent = async (req, res) => {
  try {
    const { status } = req.body;
    const [rsvp, created] = await EventRSVP.upsert({
      event_id: req.params.id,
      user_id: req.user.id,
      status,
      responded_at: new Date()
    }, { returning: true });
    res.status(created ? 201 : 200).json(rsvp);

    if (created) {
      try {
        const event = await Event.findByPk(req.params.id, { attributes: ['id', 'title', 'organizer_id'] });
        if (event && event.organizer_id !== req.user.id) {
          const rsvpUser = await User.findByPk(req.user.id, { attributes: ['full_name'] });
          const notif = await Notification.create({
            user_id: event.organizer_id,
            type: 'rsvp',
            content: `${rsvpUser.full_name} responded "${status}" to your event "${event.title}"`,
            link_url: `/events/${event.id}`,
          });
          emitNotification(event.organizer_id, notif.toJSON());
        }
      } catch (e) {
        console.error('Notification error (rsvpEvent):', e.message);
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const organized = await Event.findAll({
      where: { organizer_id: req.user.id },
      order: [['start_time', 'ASC']]
    });
    const rsvps = await EventRSVP.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Event, include: [{ model: User, as: 'Organizer', attributes: ['id', 'full_name'] }] }]
    });
    res.status(200).json({ organized, attending: rsvps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const exportAttendees = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: EventRSVP,
        include: [{ model: User, attributes: ['full_name', 'email', 'student_id', 'batch'] }]
      }]
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isOrganizer = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOrganizer && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const rows = [
      ['Name', 'Email', 'Student ID', 'Batch', 'RSVP Status', 'Responded At'],
      ...event.EventRSVPs.map(r => [
        r.User?.full_name ?? '',
        r.User?.email ?? '',
        r.User?.student_id ?? '',
        r.User?.batch ?? '',
        r.status,
        r.responded_at ? new Date(r.responded_at).toISOString() : '',
      ])
    ];

    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_attendees.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, rsvpEvent, getMyEvents, exportAttendees };

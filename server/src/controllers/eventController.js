const { Event, EventRSVP, User, Department, Notification } = require('../models');
const { Op } = require('sequelize');
const { emitNotification } = require('../socket/index');

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

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, rsvpEvent, getMyEvents };

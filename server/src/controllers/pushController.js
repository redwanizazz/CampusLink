const webPush = require('web-push');
const { PushSubscription } = require('../models');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    `mailto:${process.env.SMTP_FROM || 'noreply@campuslink.edu'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not set — web push notifications disabled.');
}

const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }
    await PushSubscription.upsert({
      user_id: req.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    console.error('push subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unsubscribe = async (req, res) => {
  try {
    await PushSubscription.destroy({ where: { user_id: req.user.id } });
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    console.error('push unsubscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendPushToUser = async (userId, payload) => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;
  try {
    const subs = await PushSubscription.findAll({ where: { user_id: userId } });
    await Promise.allSettled(
      subs.map(sub =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        ).catch(async (err) => {
          if (err.statusCode === 410) await sub.destroy();
        })
      )
    );
  } catch (err) {
    console.error('sendPushToUser error:', err.message);
  }
};

module.exports = { subscribe, unsubscribe, sendPushToUser };

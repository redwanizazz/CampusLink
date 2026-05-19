const { User, Connection, Department } = require('../models');
const { Op } = require('sequelize');

const discoverUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDeptId = req.user.department_id; // To prioritize same department

    // Get all users involved in existing connections (pending or accepted) with current user
    const existingConnections = await Connection.findAll({
      where: {
        [Op.or]: [{ requester_id: userId }, { addressee_id: userId }]
      }
    });

    const excludedUserIds = [userId, ...existingConnections.map(c => 
      c.requester_id === userId ? c.addressee_id : c.requester_id
    )];

    // Fetch users not in the excluded list
    const users = await User.findAll({
      where: {
        id: { [Op.notIn]: excludedUserIds },
        role: { [Op.ne]: 'admin' } // Don't suggest the admin
      },
      attributes: ['id', 'full_name', 'avatar_url', 'role', 'batch', 'department_id'],
      include: [{ model: Department, attributes: ['name', 'code'] }]
    });

    // Sort: Same department first, then others
    users.sort((a, b) => {
      if (a.department_id === userDeptId && b.department_id !== userDeptId) return -1;
      if (a.department_id !== userDeptId && b.department_id === userDeptId) return 1;
      return 0;
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error discovering users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendRequest = async (req, res) => {
  try {
    const { addressee_id } = req.body;
    const requester_id = req.user.id;

    if (requester_id === parseInt(addressee_id)) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      where: {
        [Op.or]: [
          { requester_id, addressee_id },
          { requester_id: addressee_id, addressee_id: requester_id }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Connection or request already exists' });
    }

    await Connection.create({
      requester_id,
      addressee_id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findOne({
      where: { id: connectionId, addressee_id: userId, status: 'pending' }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    connection.status = 'accepted';
    await connection.save();

    res.status(200).json({ message: 'Request accepted' });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findOne({
      where: { id: connectionId, addressee_id: userId, status: 'pending' }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Request not found or unauthorized' });
    }

    await connection.destroy();

    res.status(200).json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findOne({
      where: { 
        id: connectionId, 
        status: 'accepted',
        [Op.or]: [{ requester_id: userId }, { addressee_id: userId }]
      }
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }

    await connection.destroy();

    res.status(200).json({ message: 'Connection removed' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ requester_id: userId }, { addressee_id: userId }]
      },
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'full_name', 'avatar_url', 'role', 'batch'], include: [Department] },
        { model: User, as: 'Addressee', attributes: ['id', 'full_name', 'avatar_url', 'role', 'batch'], include: [Department] }
      ]
    });

    // Format output so the 'connected user' is always cleanly extracted
    const formatted = connections.map(conn => {
      const isRequester = conn.requester_id === userId;
      return {
        connection_id: conn.id,
        connected_since: conn.updated_at,
        user: isRequester ? conn.Addressee : conn.Requester
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const incoming = await Connection.findAll({
      where: { addressee_id: userId, status: 'pending' },
      include: [{ model: User, as: 'Requester', attributes: ['id', 'full_name', 'avatar_url', 'role', 'batch'], include: [Department] }]
    });

    const outgoing = await Connection.findAll({
      where: { requester_id: userId, status: 'pending' },
      include: [{ model: User, as: 'Addressee', attributes: ['id', 'full_name', 'avatar_url', 'role', 'batch'], include: [Department] }]
    });

    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  discoverUsers,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getConnections,
  getPendingRequests
};

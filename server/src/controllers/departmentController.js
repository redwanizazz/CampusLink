const { Department } = require('../models');

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getDepartments };

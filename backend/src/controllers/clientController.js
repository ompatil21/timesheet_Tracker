const Client = require('../models/Client');

// @desc    Get clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  const clients = await Client.find({ user: req.user.id });
  res.status(200).json(clients);
};

// @desc    Create client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  const { name, ordinaryRate, casualLoading, supervisorRate, saturdayRate, sundayRate, holidayRate } = req.body;

  if (!name || ordinaryRate === undefined) {
    res.status(400);
    throw new Error('Please add an employer name and ordinary rate');
  }

  const toRate = (val) => (val !== undefined && val !== '' && val !== null ? Number(val) : undefined);

  const client = await Client.create({
    name,
    ordinaryRate: Number(ordinaryRate),
    casualLoading: casualLoading !== undefined && casualLoading !== '' ? Number(casualLoading) : 0,
    supervisorRate: toRate(supervisorRate),
    saturdayRate: toRate(saturdayRate),
    sundayRate: toRate(sundayRate),
    holidayRate: toRate(holidayRate),
    user: req.user.id,
  });

  res.status(201).json(client);
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Employer not found');
  }

  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const toRate = (val) => (val !== undefined && val !== '' && val !== null ? Number(val) : undefined);

  const allowedUpdates = {
    name: req.body.name,
    ordinaryRate: req.body.ordinaryRate !== undefined ? Number(req.body.ordinaryRate) : undefined,
    casualLoading: req.body.casualLoading !== undefined && req.body.casualLoading !== '' ? Number(req.body.casualLoading) : undefined,
    supervisorRate: toRate(req.body.supervisorRate),
    saturdayRate: toRate(req.body.saturdayRate),
    sundayRate: toRate(req.body.sundayRate),
    holidayRate: toRate(req.body.holidayRate),
  };
  // Remove undefined keys so we don't unset fields that weren't sent
  Object.keys(allowedUpdates).forEach(k => allowedUpdates[k] === undefined && delete allowedUpdates[k]);

  const updatedClient = await Client.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
  });

  res.status(200).json(updatedClient);
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Employer not found');
  }

  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await client.deleteOne();

  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
};

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
  const { name, ordinaryRate, casualLoading, saturdayRate, sundayRate, holidayRate } = req.body;

  if (!name || ordinaryRate === undefined) {
    res.status(400);
    throw new Error('Please add an employer name and ordinary rate');
  }

  const client = await Client.create({
    name,
    ordinaryRate,
    casualLoading: casualLoading || 0,
    saturdayRate: saturdayRate || undefined,
    sundayRate: sundayRate || undefined,
    holidayRate: holidayRate || undefined,
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

  const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {
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

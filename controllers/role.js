const { BadRequestError, NotFoundError } = require('../errors');
const Roles = require('../model/config');
const { StatusCodes } = require('http-status-codes');

const createRole = async (req, res) => {
  const { name, permissions } = req.body;

  if (permissions?.length <= 0) {
    throw new BadRequestError('No permissions set for role');
  }

  const data = await Roles.create({
    name,
    permissions,
  });


  res.status(StatusCodes.OK).json({ data });
};

const getRoles = async (req, res) => {
  const data = await Roles.find();

  res.status(StatusCodes.OK).json({ data });
};

module.exports = {
  createRole,
  getRoles,
};

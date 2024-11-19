const { BadRequestError, NotFoundError } = require('../errors');
const TestimonyModel = require('../model/testimony');
const { StatusCodes } = require('http-status-codes');

const CreateTestimony = async (req, res) => {
  const { name, phone, testimony, media, public } = req.body;

  if (!testimony) {
    throw new BadRequestError('Please enter your testimony');
  }

  function sanitizeString(str) {
    str = str?.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, '');
    return str.trim();
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const year = today.getFullYear();

  const data = {
    name: name ? sanitizeString(name) : '',
    phone: phone ? sanitizeString(phone) : '',
    public,
    testimony: sanitizeString(testimony),
    media,
    date: `${month.toString()?.padStart(2, '0')}/${day
      .toString()
      ?.padStart(2, '0')}/${year}`,
  };

  await TestimonyModel.create(data);

  res.status(StatusCodes.CREATED).json({
    mesage: `Testimony recorded`,
  });
};

const GetTestimony = async (req, res) => {
  const { name, phone, fromDate, toDate, public } = req.query;

  const pageOptions = {
    page: parseInt(req.query.page - 1, 10) || 0,
    limit: parseInt(req.query.limit, 10) || 10,
  };

  let queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  if (phone) {
    queryObject.phone = phone;
  }
  if (public) {
    queryObject.public = public;
  }

  if (fromDate || toDate) {
    queryObject.date = { $gte: fromDate, $lte: toDate };
  }

  const testimony = TestimonyModel.find(queryObject)
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort([['createdAt', -1]]);

  const Count = await TestimonyModel.countDocuments(queryObject);

  const result = await testimony;
  const totalPage = Math.round(Count / pageOptions.limit);

  const pagination =
    Math.round(Count % pageOptions.limit) === 0 ? totalPage : totalPage + 1;
  res.status(StatusCodes.OK).json({
    data: result,
    length: result.length,
    totalElement: Count,
    totalPage: pagination,
    numberofElement: result?.length,
    current: pageOptions?.page,
  });
};

module.exports = {
  CreateTestimony,
  GetTestimony,
};

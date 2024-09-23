const { BadRequestError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const NoteModel = require('../model/note');
const SaveNote = async (req, res) => {
  const { memberId, comment } = req.body;

  const findNote = await NoteModel.findOne({ memberId });

  if (findNote?._id && findNote?.notes?.length > 0) {
    const note = await NoteModel.findOneAndUpdate(
      { memberId },
      {
        $push: {
          notes: [
            {
              createdBy: { name: req.user.name, userId: req.user.userId },
              comment,
            },
          ],
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(StatusCodes.OK)
      .json({ message: `Note saved`, data: note });
  }

  const data = {
    notes: [
      {
        createdBy: { name: req.user.name, userId: req.user.userId },
        comment,
      },
    ],
    memberId: memberId,
  };
  const note = await NoteModel.create(data);

  res.status(StatusCodes.OK).json({ message: `Note saved`, data: note });
};

const GetNote = async (req, res) => {
  const { id } = req.params;

  const note = await NoteModel.findOne({ memberId: id });

  res.status(StatusCodes.OK).json({ data: note });
};

const DeleteNote = async (req, res) => {
  const { memberId, noteId } = req.params;

  await NoteModel.findOneAndUpdate(
    { memberId },
    { $pull: { notes: { _id: noteId } } },
    { safe: true, multi: true }
  );

  res.status(StatusCodes.OK).json({ message: 'Note removed' });
};

const UpdateNote = async (req, res) => {
  res.send('hello');
};

module.exports = {
  SaveNote,
  GetNote,
  DeleteNote,
  UpdateNote,
};

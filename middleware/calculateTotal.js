const generateXLS = require("./generateExcel");


const CalculateTotal = async ({ data, type, activityId, activityName }) => {
  let female = 0;
  let male = 0;
  let child = 0;
  let teenFemale = 0;
  let teenMale = 0;
  let total = 0;

  const exc = await generateXLS({ data, type, activityName, activityId });

  return {
    female,
    male,
    child,
    teenFemale,
    teenMale,
    total,
    exc,
  };
};

module.exports = CalculateTotal;

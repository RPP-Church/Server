const ExcelJS = require('exceljs');

const generateXLS = ({ data, type, activityName, activityId }) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`List of ${type} count `, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Initialize the row index
    let rowIndex = 3;

    let row = worksheet.getRow(rowIndex);
    row.values = [
      'S/N',
      'Names of Member',
      'Phone Number',
      'Address',
      'Gender',
      //   'Number of Car',
      //   'Car Revenue',
      //   'Number of Bus',
      //   'Bus Revenue',
      //   'Total Revenue',
      //   'Name of Staff',
    ];
    row.font = { bold: true };

    const columnWidths = [30, 30, 30];

    row.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });
    let totalMotoform = 0;
    let totalTriform = 0;
    let totalBusform = 0;
    let totalCarform = 0;

    let female = 0;

    // // Loop over the grouped data
    // for (var i in data) {
    //   let namesOfMember = '';
    //   let phone = '';
    //   let gender = '';
    //   let address = '';

    //   if (
    //     data[i].attendance.find(
    //       (c) => c.serviceId?.toString() === activityId?.toString()
    //     )
    //   ) {
    //     if (data[i].attendance.find((c) => c.attendance === type)) {
    //       namesOfMember = {
    //         name: `${data[i]?.firstName} ${data[i]?.lastName}`,
    //       };
    //       phone = data[i].phone;
    //       gender = data[i].gender;
    //       address = data[i].address;

    //       //   if (data[i].category === 'Adult') {
    //       //     if (data[i].gender === 'Female') {
    //       //       female += 1;
    //       //     } else {
    //       //       male += 1;
    //       //     }
    //       //   } else if (data[i].category === 'Teen') {
    //       //     if (data[i].gender === 'Female') {
    //       //       teenFemale += 1;
    //       //     } else {
    //       //       teenMale += 1;
    //       //     }
    //       //   } else {
    //       //     child += 1;
    //       //   }
    //       //   total = +female + male + teenFemale + teenMale + child;

    //       const row = worksheet.getRow(rowIndex + i + 1);
    //       row.getCell('A').value = i + 1;
    //       row.getCell('B').value = namesOfMember || '';
    //       row.getCell('C').value = phone || '';
    //       row.getCell('D').value = address || '';
    //       //   row.getCell('E').value = triTotal;
    //       //   row.getCell('F').value = car?.length > 0 ? car.length : 0;
    //       //   row.getCell('G').value = carTotal;
    //       //   row.getCell('H').value = bus.length;
    //       //   row.getCell('I').value = busTotal;
    //       //   row.getCell('J').value = motoTotal + triTotal + carTotal + busTotal;
    //       //   row.getCell('K').value = item.name;
    //       //   row.getCell('B').alignment = { wrapText: true };
    //     } else {
    //       console.log('not type');
    //     }
    //   }
    // }

    data.forEach((item, index) => {
      let name = '';
      let phone = '';
      let gender = '';
      let address = '';
      if (
        item.attendance.find(
          (c) => c.serviceId?.toString() === activityId?.toString()
        )
      ) {
        name = `${item.firstName} ${item.lastName}`;
        phone = item.phone;
        gender = item.gender;
        address = item.address;
      }
      //   let namesOfMember = [];
      //   for (let i = 0; i < item.length; i++) {
      //     //   if (
      //     //     item.data[i].group === 'Motocycle' &&
      //     //     item.name === item.data[i].createdBy
      //     //   ) {
      //     //     motoTotal += Number(item.data[i].amount);
      //     //     motocycle = [...motocycle, item.data[i].group];
      //     //   }
      //     //   if (
      //     //     item.data[i].group === 'Tricycle' &&
      //     //     item.name === item.data[i].createdBy
      //     //   ) {
      //     //     triTotal += Number(item.data[i].amount);
      //     //     tricycle = [...tricycle, item.data[i].group];
      //     //   }
      //     //   if (
      //     //     item.data[i].group === 'Bus' &&
      //     //     item.name === item.data[i].createdBy
      //     //   ) {
      //     //     busTotal += Number(item.data[i].amount);
      //     //     bus = [...bus, item.data[i].group];
      //     //   }
      //     //   if (
      //     //     item.data[i].group === 'Car' &&
      //     //     item.name === item.data[i].createdBy
      //     //   ) {
      //     //     carTotal += Number(item.data[i].amount);
      //     //     car = [...car, item.data[i].group];
      //     //   }
      //   }
      //   //   if (Number(motocycle.length) > 0) {
      //   //     totalMotoform += Number(motocycle.length);
      //   //   }
      //   //   if (Number(tricycle.length) > 0) {
      //   //     totalTriform += Number(tricycle.length);
      //   //   }
      //   //   if (Number(bus.length) > 0) {
      //   //     totalBusform += Number(bus.length);
      //   //   }
      //   //   if (Number(car.length) > 0) {
      //   //     totalCarform += Number(car.length);
      //   //   }
      const row = worksheet.getRow(rowIndex + index + 1);
      row.getCell('A').value = index + 1;
      row.getCell('B').value = name;
      row.getCell('C').value = phone;
      row.getCell('D').value = address;
      row.getCell('E').value = gender;
      //   row.getCell('F').value = car?.length > 0 ? car.length : 0;
      //   row.getCell('G').value = carTotal;
      //   row.getCell('H').value = bus.length;
      //   row.getCell('I').value = busTotal;
      //   row.getCell('J').value = motoTotal + triTotal + carTotal + busTotal;
      //   row.getCell('K').value = item.name;
      //   row.getCell('B').alignment = { wrapText: true };
    });

    const endRow = worksheet.lastRow._number + 1;
    // // Increment the row index
    rowIndex += data.length;
    worksheet.getCell(`B${endRow}`).value = {
      formula: `SUM(B4:B${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`C${endRow}`).value = {
      formula: `SUM(C4:C${endRow - 1})`,
      date1904: false,
    };

    worksheet.getCell(`D${endRow}`).value = {
      formula: `SUM(D4:D${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`E${endRow}`).value = {
      formula: `SUM(E4:E${endRow - 1})`,
      date1904: false,
    };

    worksheet.getCell(`F${endRow}`).value = {
      formula: `SUM(F4:F${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`G${endRow}`).value = {
      formula: `SUM(G4:G${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`H${endRow}`).value = {
      formula: `SUM(H4:H${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`I${endRow}`).value = {
      formula: `SUM(I4:I${endRow - 1})`,
      date1904: false,
    };
    worksheet.getCell(`J${endRow}`).value = {
      formula: `SUM(J4:J${endRow - 1})`,
      date1904: false,
    };

    worksheet.getCell(`A${endRow}`).value = 'TOTAL';

    // Merge cells for the logo
    // worksheet.mergeCells(
    //   `A1:${String.fromCharCode(65 + worksheet.columns.length - 1)}1`
    // );

    worksheet.getRow(1).height = 40;

    // Define the border style
    const borderStyle = {
      style: 'thin', // You can use 'thin', 'medium', 'thick', or other valid styles
      color: { argb: '00000000' },
    };

    // Loop through all cells and apply the border style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: borderStyle,
          bottom: borderStyle,
        };
      });
    });

    // Generate the XLS file
    return workbook.xlsx.writeBuffer();
  } catch (error) {
    console.log(error);
  }
};

const CalculateTotal = async ({ data, type, activityId, activityName }) => {
  let female = 0;
  let male = 0;
  let child = 0;
  let teenFemale = 0;
  let teenMale = 0;
  let total = 0;
  //   for (var i in data) {
  //     if (
  //       data[i].attendance.find(
  //         (c) => c.serviceId?.toString() === activityId?.toString()
  //       )
  //     ) {
  //       if (data[i].attendance.find((c) => c.attendance === type)) {
  //         if (data[i].category === 'Adult') {
  //           if (data[i].gender === 'Female') {
  //             female += 1;
  //           } else {
  //             male += 1;
  //           }
  //         } else if (data[i].category === 'Teen') {
  //           if (data[i].gender === 'Female') {
  //             teenFemale += 1;
  //           } else {
  //             teenMale += 1;
  //           }
  //         } else {
  //           child += 1;
  //         }
  //         total = +female + male + teenFemale + teenMale + child;
  //       } else {
  //         console.log('not type');
  //       }
  //     }
  //   }

  const exc = await generateXLS({ data, type, activityName, activityId });

  console.log(data.length, 'exc');
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

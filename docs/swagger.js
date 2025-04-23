const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RPP Church API',
      description: "The API to track attendance and manage memeber's data",
      contact: {
        name: 'Okoromi Victor',
        email: 'okoromivictorsunday@gmail.com',
      },
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local server',
      },
      {
        url: 'https://rppserver.resurrectionpowerparish.ng/api/v1',
        description: 'Live server',
      },
    ],
  },
  // looks for configuration in specified directories
  apis: ['./route/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

module.exports = swaggerSpec;

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'My API Description',
  },
};

const options = {
  swaggerDefinition,
  apis: ['./route/*.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
// function swaggerDocs(app, port) {
//   // Swagger Page
//   app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//   // Documentation in JSON format
//   app.get('/docs.json', (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerSpec);
//   });
// }
module.exports = swaggerSpec;

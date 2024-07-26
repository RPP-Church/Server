const { CreateAdmin, LoginAdmin } = require('../controllers/auth.js');
const express = require('express');

const router = express.Router();

/** POST Methods */
/**
 * @openapi
 * '/auth/register':
 *  post:
 *     tags:
 *     - Admin Controller
 *     summary: Create an admin
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - name
 *              - phone
 *              - password
 *            properties:
 *              name:
 *                type: string
 *                default: johndoe
 *              phone:
 *                type: string
 *                default: 09012345675
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */


/** POST Methods */
/**
 * @openapi
 * '/auth/login':
 *  post:
 *     tags:
 *     - Admin Controller
 *     summary: Login 
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - phone
 *              - password
 *            properties:
 *              phone:
 *                type: string
 *                default: 09012345675
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.post('/register', CreateAdmin);
router.post('/login', LoginAdmin);
router.get('/', LoginAdmin);

module.exports = router;

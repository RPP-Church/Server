const {
  CreateActivities,
  GetActivities,
  CaptureActivityforMember,
} = require('../controllers/activities');
const express = require('express');

const router = express.Router();

/** POST Methods */
/**
 * @openapi
 * '/activities':
 *  post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *     - Activity Controller
 *     summary: Create church activity
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - date
 *              - serviceName
 *            properties:
 *              date:
 *                type: string
 *                default: ''
 *              serviceName:
 *                type: string
 *                default: ''
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

/** GET Methods */
/**
 * @openapi
 * '/activities':
 *  get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *     - Activity Controller
 *     summary: Get activity
 *     parameters:
 *      - date: date
 *        in: path
 *        description: Date of the activity
 *      - serviceName: serviceName
 *        in: path
 *        description: The activity name
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.route('/').post(CreateActivities).get(GetActivities);
router.route('/member').post(CaptureActivityforMember);

module.exports = router;

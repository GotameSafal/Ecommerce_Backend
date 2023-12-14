import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js'
import { khaltiPaymentCheck, khaltipay } from '../controllers/khalti.js';
let router = express.Router();
router.route('/khalti-pay').post(isAuthenticated, khaltipay);
router.route('/khalti-lookup').post(isAuthenticated, khaltiPaymentCheck)
export default router

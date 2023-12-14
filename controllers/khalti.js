import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import axios from "axios";
export const khaltipay = catchAsyncError(async (req, res, next) => {
  const payload = req.body;
  console.log(payload)
  const data = await axios.post(`${process.env.KHALTI_URL}/epayment/initiate/`, payload, {
    headers: { Authorization: `key ${process.env.KHALTI_KEY}` },
  });
  console.log(data)
  if (data) res.status(200).json({ success: true, data });
});

export const khaltiPaymentCheck = catchAsyncError(async (req, res, next) => {
  const { data } = await axios.post(
    `${process.env.KHALTI_URL}/epayment/lookup/`,
    req.body,
    { headers: { Authorization: `key ${process.env.KHALTI_KEY}` } }
  );
  if (data) {
    res.status(200).json({ success: true, data });
  }
});

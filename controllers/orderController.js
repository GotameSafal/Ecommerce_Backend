import { Order } from "../models/ordermodel.js";
import Product from "../models/productmodel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandler } from "../utils/errorHandler.js";

// create new order
export const newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shipping,
    orderItems,
    paymentInfo,
    shippingPrice,
    taxPrice,
    totalPrice,
    orderStatus,
  } = req.body;
  const order = await Order.create({
    shipping,
    orderItems,
    paymentInfo,
    shippingPrice,
    taxPrice,
    totalPrice,
    orderStatus,
    createdAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Order successfully placed",
    order,
  });
});

// get single order  accessible by admin
export const getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) return next(new ErrorHandler("Order not found", 400));

  res.status(200).json({
    success: true,
    order,
  });
});

// get all users order
export const getmyOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });
  if (!order) return next(new ErrorHandler("product not found", 400));

  res.status(200).json({
    success: true,
    order,
  });
});

// get all orders accessible by admin only
export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orderList = await Order.find().populate("user").sort({ createdAt: -1 });
  const total = await Order.countDocuments();
  let totalamount = 0;
  orderList.forEach((elem) => {
    totalamount += elem.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalamount,
    orderList,
    total,
  });
});

// update order status by admin only
export const updateOrder = catchAsyncError(async (req, res, next) => {
  console.log(req.body.orderStatus);
  const order = await Order.findById(req.params.id);
  if (order.orderStatus === "delivered")
    return next(new ErrorHandler("product already delivered"), 400);
  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  if (req.body.orderStatus == "delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "successfully order status changed",
  });
});

const updateStock = catchAsyncError(async (id, quantity) => {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
});

// delete order accessible by only admin
export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("product not found", 400));
  await Order.findByIdAndDelete({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "order successfully deleted",
  });
});

import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/usermodel.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import Product from "../models/productmodel.js";
// regestering the user
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { password, username, repassword, email } = req.body;
  let user = await User.findOne({ email });
  if (user)
    return res.status(409).json({
      success: false,
      message: "user already registered",
    });
  if (password !== repassword)
    return next(
      new ErrorHandler("Your password and confirmPassword does not match", 400)
    );
  user = await User.create({
    email,
    password,
    name: username,
  });
  sendToken(user, res, "Registered successfully", 201);
});

// logging the user
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter in valid field", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return next(new ErrorHandler("Please enter valid email password", 404));

  const comparePassword = await user.comparePassword(password);
  if (!comparePassword)
    return next(new ErrorHandler("Please enter valid email password", 400));
  sendToken(user, res, "Successfully logged in", 200);
});

// logout user
export const logoutUser = catchAsyncError(async (req, res, next) => {

  res.status(200).json({
    success: true,
    message: "successfully logged out",
  });
});

//resetting the password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  const message = `Your reset password token send to ${resetPasswordUrl}. please ignor if its not you`;

  try {
    await sendEmail({
      email: user.email,
      subject: "ecommerce password recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Reset token send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = req.params.token;
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new ErrorHandler("Invalid token or token expired try again", 400)
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(
      new ErrorHandler(
        "password and confirm password does not match. Try again",
        400
      )
    );
  user.password = req.body.password;
  await user.save();
  sendToken(user, res, "successfully logged in", 200);
});

export const getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateName = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "successfully updated",
    user,
  });
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const comparePassword = user.comparePassword(req.body.currentPassword);
  if (!comparePassword)
    return next(new ErrorHandler("password validation failed", 400));

  if (req.body.newPassword !== req.body.confirmPassword)
    return next(new ErrorHandler("passwrod validation failed", 400));

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, res, "password successfully updated", 200);
});

// get all user accessible by only admin
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const user = await User.find();
  const no_of_user = user.length;
  res.status(200).json({
    success: true,
    no_of_user,
    user,
  });
});

// get single user by its id accessible by only admin
export const getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 400));

  res.status(200).json({
    success: true,
    user,
  });
});

// remover the user by its id only accessible by admin
export const removeUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 400));

  if (user.role === "admin")
    return next(
      new ErrorHandler(
        `${user.name} has same authority as you so can't remove`,
        400
      )
    );
  const deletedUser = await user.remove();
  res.status(200).json({
    success: true,
    deletedUser,
    message: "this user has been removed",
  });
});

// update role of user, accessible by only admin
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("user not found", 400));
  if (!role) return next(new ErrorHandler("user role is not defined", 400));
  user.role = role;
  await user.save();

  res.status(201).json({
    success: true,
    message: "successfully updated user role",
  });
});

// creating and updating review
export const createReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const reviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (reviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.no_of_reviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.avg_rating = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

// get all reviews
export const getAllReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) return next(new ErrorHandler("product not found", 400));
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// delete reviews
export const deleteReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) return next(new ErrorHandler("product not found", 400));
  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const no_of_reviews = reviews.length;
  const avg_rating = avg / product.reviews.length;

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    no_of_reviews,
    avg_rating,
  });

  res.status(200).json({
    success: true,
  });
});

export const addAddress = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  if (!user)
    return next(new ErrorHandler("please login to access this resource", 400));
  user.address.push(req.body);
  await user.save({ validateBeforeSave: false });
  return res.status(201).json({
    success: true,
    message: "Address successfully added",
  });
});

export const deleteAddress = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  if (!user)
    return next(new ErrorHandler("please login to access this resource", 400));
  user.address = user.address.filter(
    (addr) => addr._id.toString() !== req.params.id.toString()
  );
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "address has been deleted" });
});

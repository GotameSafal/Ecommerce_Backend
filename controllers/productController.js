import Product from "../models/productmodel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
// to get all products
export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination();
  let product = await apiFeature.query;
  const total = await Product.countDocuments();
  const filteredProductCount = product.length;
  res.status(200).json({
    success: true,
    message: "product retrieved",
    product,
    filteredProductCount,
    total,
  });
});

//  to create products
export const createProduct = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  const fileUri = getDataUri(files);
  const uploadPromises = fileUri.map(async (file) => {
    const result = await cloudinary.v2.uploader.upload(file.content);
    return result;
  });
  const myCloud = await Promise.all(uploadPromises);
  const images = myCloud.map((image) => ({
    public_id: image.public_id,
    url: image.url,
  }));
  const product = await Product.create({
    ...req.body,
    images,
    sizes: JSON.parse(req.body.sizes),
    colors: JSON.parse(req.body.colors),
  });
  res.status(201).json({
    success: true,
    message: "product added",
    product,
  });
});

// to delete products
export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const _id = req.params.id;
  let product = await Product.findById(_id);
  if (!product) return next(new ErrorHandler("bad request", 400));
  product.images.map(async (image) => {
    await cloudinary.v2.uploader.destroy(image.public_id);
  });
  product = await Product.findByIdAndDelete(_id);
  res.status(200).json({
    success: true,
    message: "item deleted",
    product,
  });
});

// to update products
export const updateProduct = catchAsyncError(async (req, res, next) => {
  const _id = req.params.id;
  console.log(_id)
  console.log(req)
  console.log(req.body)
  let product = await Product.findById(_id);
  if (!product) return next(new ErrorHandler("bad request", 400));
  const files = req.files;
  let images = [];
  if (files) {
    const fileUri = getDataUri(files);
    const uploadPromises = fileUri.map(async (file) => {
      const result = await cloudinary.v2.uploader.upload(file.content);
      return result;
    });
    const myCloud = await Promise.all(uploadPromises);
    images = myCloud.map((image) => ({
      public_id: image.public_id,
      url: image.url,
    }));
  }
  product = await Product.findByIdAndUpdate(
    _id,
    {
      ...req.body,
      images: [...product.images, ...images],
      sizes: JSON.parse(req.body.sizes),
      colors: JSON.parse(req.body.colors),
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    product,
    message: "Product successfully updated",
  });
});

// to get single products
export const getProduct = catchAsyncError(async (req, res, next) => {
  const _id = req.params.id;
  const product = await Product.findById(_id);
  if (!product) return next(new ErrorHandler("bad request", 400));
  res.status(200).json({
    success: true,
    product,
  });
});

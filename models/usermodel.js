import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [4, "Your name should be more than 8 characters"],
    maxLength: [30, "your name should be less than 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: [true, "email already exits"],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  address: [
    {
      province: {
        type: String,
        required: true,
        default: "Bagmati",
      },
      town: {
        type: String,
        required: true,
      },
      zipPostalCode: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        defalut: "Nepal",
      },
      phoneNo: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: [true, "Please enter email"],
        validate: validator.isEmail,
      },
      username: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],

  role: {
    type: String,
    default: "other",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// hashing password before saving in database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// session id generation
UserSchema.methods.getjwtToken = async function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.EXPIRE_DATE,
    }
  );
};
// comparing password to login
UserSchema.methods.comparePassword = async function (getPassword) {
  return await bcrypt.compare(getPassword, this.password);
};

// generating reset password
UserSchema.methods.generateResetToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = await crypto
    .Hash("sha25")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export const User = new mongoose.model("user", UserSchema);

const mongoose = require("mongoose");

// Schema cho User
const userSchema = new mongoose.Schema({
  // Số điện thoại của User và là duy nhấtnhất
  PhoneNumber: { type: String, required: true, unique: true },
  //Email của User
  Email: { type: String, required: true, unique: true },
  //Họ của User
  FirstName: { type: String, required: true },
  //Tên của User
  LastName: { type: String, required: true },
  //Role của User
  Role: {
    type: String,
    required: true,
    enum: ["Admin", "User", "Staff"],
  },
});

//Schema cho Category
const CategorySchema = new mongoose.Schema({
  //Tên của Category
  Name: {
    type: String,
    required: true,
  },
  //Hình ảnh của Category
  Image: {
    type: String,
    required: true,
  },
});

// Schema cho Property
const propertySchema = new mongoose.Schema({
  //Tiêu đề của Property
  Title: {
    type: String,
    required: true,
  },
  // Giá tiền của Property
  Price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Mô tả của Property
  Description: {
    type: String,
    required: true,
    maxLength: 500,
  },
  // Địa chỉ của Property
  Address: {
    type: String,
    required: true,
  },
  // Chiều dài
  Length: {
    type: Number,
    required: true,
    min: 0,
  },
  // Chiều rộng
  Width: {
    type: Number,
    required: true,
    min: 0,
  },
  // Diện tích
  Area: {
    type: Number,
    required: true,
    min: 0,
  },

  // Số phòng của Property
  NumberOfRooms: {
    type: Number,
    required: true,
    min: 0,
  },
  // Liên kết đến bảng User
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Liên kết đến bảng Category
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  // Liên kết đến bảng State
  State: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  // Liên kết đến bảng Type
  Type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Type",
    required: true,
  },
  // Liên kết đến bảng Location
  Location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  // Liên kết đến bảng Amenities
  Amenities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenities",
      required: true,
    },
  ],
});

//Schema cho State
const stateSchema = new mongoose.Schema({
  // Tên của State
  Name: {
    type: String,
    required: true,
  },
  // Mô tả của State
  Description: {
    type: String,
    required: true,
  },
});

//Schema cho Type
const typeSchema = new mongoose.Schema({
  // Tên của Type
  Name: {
    type: String,
    required: true,
  },
  // Mô tả của Type
  Description: {
    type: String,
    required: true,
  },
  //Approved hay chưa
  Approved: {
    type: Boolean,
    default: false,
  },
});

//Schema cho Location
const locationSchema = new mongoose.Schema({
  // Tên của Location vd: Q7 RiverSide
  Name: {
    type: String,
    required: true,
  },
  // Mô tả của Location
  Description: {
    type: String,
    required: true,
  },
});

//Schema cho Amenities
const AmenitiesSchema = new mongoose.Schema({
  // Tên của Amenities
  Name: {
    type: String,
    required: true,
  },
  // Mô tả của Amenities
  Description: {
    type: String,
    required: true,
  },
  //Liên kết đến bảng Property
  Property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
});

//Schema cho Image
const propertyImageSchema = new mongoose.Schema({
  //Lưu ảnh bằng buffer
  Image: [
    {
      type: Buffer,
      required: true,
    },
  ],
  //Liên kết đến bảng Property
  Property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
});

//Schema cho Notification
const notificationSchema = new mongoose.Schema({
  //Title của Notification
  Title: {
    type: String,
    required: true,
  },
  // Nội dung của Notification
  Content: {
    type: String,
    required: true,
  },
});

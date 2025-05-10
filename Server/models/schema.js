const mongoose = require("mongoose");

//------------------------------------------------------------------
//Schema cho AuditLog
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String },
  userId: { type: String },
  userName: { type: String },
  role: { type: String },
  resource: { type: String },
  resourceId: { type: String },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  previousData: { type: Object },
  newData: { type: Object },
  status: { type: String, enum: ["success", "fail"], default: "success" },
});
//------------------------------------------------------------------
// Schema cho Account
const accountSchema = new mongoose.Schema({
  PhoneNumber: { type: String, required: true, unique: true }, //Phone làm id
  Email: { type: String, required: true, unique: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Role: {
    type: String,
    required: true,
    enum: ["Admin", "User", "Staff"],
  },
  Status: {
    type: String,
    required: true,
    enum: ["Block", "Active"],
  },
  Password: { type: String, required: true }, // Password cho admin phân role, cập quyền
});

//------------------------------------------------------------------
//Schema cho Category
const categorySchema = new mongoose.Schema({
  //Tên của Category
  Name: {
    type: String,
    required: true,
  },
  // //Hình ảnh của Category
  // Image: {
  //   type: String,
  //   required: true,
  // },
});

//------------------------------------------------------------------
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
  // Liên kết đến bảng Account
  Account: {
    type: String,
    required: true,
  },

  // Liên kết đến bảng State
  State: {
    type: String,
    required: true,
    enum: ["Cho thuê", "Đã thuê", "Đăng bán"],
  },
  // Trạng thái hiển thị phần duyệt bài
  Approved: {
    type: Boolean,
    default: false,
  },
  Label: {
    type: String,
  },
  // Liên kết đến bảng Location
  Location: {
    type: String,
    required: true,
  },
  Type: {
    bedroom: {
      type: Number,
      required: true,
      min: 0,
    },
    bathroom: {
      type: Number,
      required: true,
      min: 0,
    },
    yearBuilt: {
      type: Number,
      // required: true,
      min: 0,
    },
    garage: {
      type: Number,
      required: true,
      min: 0,
    },
    sqft: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
  },
  Amenities: [
    {
      type: String,
    },
  ],
  Images: [
    {
      type: String,
      required: true,
    },
  ],
  //new
  maindoor_direction: {
    type: String,
  },
  Balcony_direction: {
    type: String,
  },
  Type_apartment: {
    type: String,
  },
  interior_condition: {
    type: String,
    required: true,
  },
  deposit_amount: {
    type: String,
  },
  type_documents: {
    type: String,
  },
  highlight: {
    type: Boolean,
    default: false,
  },
});
//Schema cho người dùng liên hệ 
const contactSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  phone:{
    type: String,
    required: true,
  },
  post:{
    type: String,
    required: true,
  },
  typeofPost:{
    type: String,
    required: true,
  },
  createAt:{
    type: Date,
    default: Date.now,
  },
  email:{
    type: String,
    required: true,
  },
  status:{
    type: String,
    enum:["Chưa liên hệ", "Đã liên hệ"],
    default: "Chưa liên hệ",
  },
 
})

// //------------------------------------------------------------------
// //Schema cho Type
// const typeSchema = new mongoose.Schema({
//   // Tên của Type
//   Name: {
//     type: String,
//     required: true,
//   },
//   // Mô tả của Type
//   Description: {
//     type: String,
//     required: true,
//   },
//   //Approved hay chưa
//   Approved: {
//     type: Boolean,
//     default: false,
//   },
// });

//Schema cho Location
const locationSchema = new mongoose.Schema({
  // Tên của Location vd: Q7 RiverSide
  Name: {
    type: String,
    required: true,
  },
});

//------------------------------------------------------------------
//Schema cho Amenities
const amenitiesSchema = new mongoose.Schema({
  // Tên của Amenities
  Name: {
    type: String,
    required: true,
  },
});

//------------------------------------------------------------------
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
//OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL 5 phút
})

//------------------------------------------------------------------
//Model
const PropertySchema = mongoose.model("Property", propertySchema);

const LocationSchema = mongoose.model("Location", locationSchema);
const AmenitiesSchema = mongoose.model("Amenities", amenitiesSchema);
const CategorySchema = mongoose.model("Category", categorySchema);
const NotificationSchema = mongoose.model("Notification", notificationSchema);
const AuditLogSchema = mongoose.model("AuditLog", auditLogSchema);
const ContactSchema= mongoose.model("Contact", contactSchema);
const OtpSchema= mongoose.model("Otp", otpSchema);

module.exports = {
  Account: mongoose.model("Account", accountSchema),
  Property: PropertySchema,
  Contact: ContactSchema,
  Otp: OtpSchema,

  Location: LocationSchema,
  Amenities: AmenitiesSchema,
  Category: CategorySchema,
  Notification: NotificationSchema,
  AuditLog: AuditLogSchema,
};

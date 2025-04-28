const mongoose = require("mongoose");

//------------------------------------------------------------------
//Schema cho AuditLog
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
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
  Password: { type: String, required: false }, // Password cho admin phân role, cập quyền
});

//------------------------------------------------------------------
//Schema cho Category
const categorySchema = new mongoose.Schema({
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
  // Số phòng của Property
  NumberOfRooms: {
    type: Number,
    required: true,
    min: 0,
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
    enum: ["Cho thuê", "Đã thuê", "Bán", "Đã bán"],
  },
  // Trạng thái hiển thị phần duyệt bài
  Approved: {
    type: Boolean,
    default: false,
  },
  Label:{
    type: String,

  },
  // Liên kết đến bảng Location
  Location: {
    type: String,
    required: true,
  },
  Type:{
      bedroom:{
        type: Number,
        required: true,
        min: 0,
      },
      bathroom:{
        type: Number,
        required: true,
        min: 0,
      },
      yearBuilt:{
        type: Number,
        required: true,
        min: 0,
      },
      garage:{
        type: Number,
        required: true,
        min: 0,
      },
      sqft: {
        type: Number,
        required: true,
        min: 0,
      },
      category:{
        type: String,
        required: true,
      }
  },
  Video: {
    type: {
      data: Buffer,         // Dữ liệu video
      contentType: String,  // Kiểu MIME của video
    },
    required: false,
  },
  // Liên kết đến bảng Amenities
  Amenities: [
    {
      type: String,
      required: true,
    },
  ],
});

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
  // Mô tả của Location
  Description: {
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
  createdAt: {
    type: Date,
    default: Date.now,
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

//------------------------------------------------------------------
//Model
const PropertySchema = mongoose.model("Property", propertySchema);
const PropertyImageSchema = mongoose.model(
  "PropertyImage",
  propertyImageSchema
);

const LocationSchema = mongoose.model("Location", locationSchema);
const AmenitiesSchema = mongoose.model("Amenities", amenitiesSchema);
const CategorySchema = mongoose.model("Category", categorySchema);
const NotificationSchema = mongoose.model("Notification", notificationSchema);
const AuditLogSchema = mongoose.model("AuditLog", auditLogSchema);

module.exports = {
  Account: mongoose.model("Account", accountSchema),
  Property: PropertySchema,
  PropertyImage: PropertyImageSchema,

  Location: LocationSchema,
  Amenities: AmenitiesSchema,
  Category: CategorySchema,
  Notification: NotificationSchema,
  AuditLog: AuditLogSchema,
};

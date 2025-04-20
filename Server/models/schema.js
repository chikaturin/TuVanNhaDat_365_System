const mongoose = require("mongoose");

//------------------------------------------------------------------
//Schema cho AuditLog
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
// Schema cho User
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Dùng phone number làm _id
    Email: { type: String, required: true, unique: true },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Role: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Staff"],
    },
    Password: { type: String, required: false }, // Password cho admin phân role, cập quyền
    State:{
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    }
  },
  { _id: false }
);

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
    type: String,
    required: true,
    enum: ["Cho thuê", "Đã thuê", "Bán", "Đã bán"],
  },
  // Trạng thái hiển thị phần duyệt bài
  Approved: {
    type: Boolean,
    default: false,
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
const UserSchema = mongoose.model("Account", userSchema);
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
  User: UserSchema,
  Property: PropertySchema,
  PropertyImage: PropertyImageSchema,

  Location: LocationSchema,
  Amenities: AmenitiesSchema,
  Category: CategorySchema,
  Notification: NotificationSchema,
  AuditLog: AuditLogSchema,
};

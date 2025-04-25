const {
  Location,
  Category,
  Notification,
  Amenities,
  Account,
} = require("../../models/schema");

const { logAction } = require("../utils/auditlog");
const { decode } = require("jsonwebtoken");

const addAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { Name, Description, Icon } = req.body;
    const existingAmenities = await Amenities.findOne({ Name });
    if (existingAmenities) {
      return res.status(400).json({ message: "Tiện ích đã tồn tại" });
    }
    if (!Name || !Description || !Icon) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const newAmenities = new Amenities({
      Name,
      Description,
      Icon,
    });
    await newAmenities.save();
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const user = await Account.findById(req.decoded?.PhoneNumber);

    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_amenities",
      description: `Thêm tiện ích ${Name}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: newAmenities,
      status: "success",
    });
    res.status(201).json({ message: "Thêm tiện ích thành công" });
  } catch (error) {
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);
    await logAction({
      action: "add_amenities",
      description: "Lỗi khi thêm tiện ích",
      userId: req.decoded?._id,
      userName: user.Namedecoded?.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    console.error("Lỗi trong addAmenities:", error);
    res.status(500).json({ message: "error", error: error.message });
  }
};

const getListAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const amenities = await Amenities.find();
    if (!amenities) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);
    await logAction({
      action: "get_amenities",
      description: "Lấy danh sách tiện ích",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: amenities,
      status: "success",
    });
    res.status(200).json({ message: "Lấy tiện ích thành công", amenities });
  } catch (error) {
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);

    await logAction({
      action: "get_amenities",
      description: "Lỗi khi lấy danh sách tiện ích",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    console.error("Lỗi trong getListAmenities:", error);
    res.status(500).json({ message: "error", error });
  }
};

const addLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { Name, Description } = req.body;
    // Tìm xem đã có location này chưa
    const existingLocation = await Location.findOne({ Name });
    if (existingLocation) {
      return res.status(400).json({ message: "Địa điểm đã tồn tại" });
    }
    if (!Name || !Description) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const newLocation = new Location({
      Name,
      Description,
    });

    await newLocation.save();
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const user = await Account.findById(req.decoded?.PhoneNumber);

    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_location",
      description: `Thêm địa điểm ${Name}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: newLocation,
      status: "success",
    });
    res.status(201).json({ message: "Thêm địa điểm thành công" });
  } catch (error) {
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);

    await logAction({
      action: "add_location",
      description: "Lỗi khi thêm địa điểm",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    console.error("Lỗi trong addLocation:", error);
    res.status(500).json({ message: "error", error: error.message });
  }
};

const removeLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { id } = req.params;
    const deleteLocation = await Location.findByIdAndDelete(id);

    // Ghi lại hành động vào audit log
    const user = await Account.findById(req.decoded?.PhoneNumber);

    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    await logAction({
      action: "remove_location",
      description: `Xóa địa điểm ${id}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "success",
    });
    if (!deleteLocation) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    res.status(200).json({ message: "Xóa địa thành công" });
  } catch (error) {
    console.error("Lỗi trong deleteLocation:", error);
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);

    await logAction({
      action: "remove_location",
      description: "Lỗi khi xóa địa điểm",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    res.status(500).json({ message: "error", error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { Name, Image } = req.body;
    if (!Name || !Image) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingCategory = await Category.findOne({ Name });
    if (existingCategory) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }
    const newCategory = new Category({
      Name,
      Image,
    });
    await newCategory.save();
    const user = await Account.findById(req.decoded?.PhoneNumber);

    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_category",
      description: `Thêm danh mục ${Name}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: newCategory,
      status: "success",
    });
    res.status(201).json({ message: "Thêm danh mục thành công" });
  } catch (error) {
    console.error("Lỗi trong addCate:", error);
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);

    await logAction({
      action: "add_category",
      description: "Lỗi khi thêm danh mục",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    res.status(500).json({ message: "error", error: error.message });
  }
};

const removeCategory = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" || checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { id } = req.params;
    const deleteCategory = await Location.findByIdAndDelete(id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Không tìm thấy phân loại" });
    }
    // Ghi lại hành động vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);

    await logAction({
      action: "remove_category",
      description: `Xóa phân loại ${id}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "success",
    });

    res.status(200).json({ message: "Xóa phân loại thành công" });
  } catch (error) {
    console.error("Lỗi trong delete category:", error);
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findById(req.decoded?.PhoneNumber);
    await logAction({
      action: "remove_category",
      description: "Lỗi khi xóa phân loại",
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    res.status(500).json({ message: "error", error });
  }
};

const addNotification = async (req, res) => {
  try {
    const { Title, Content } = req.body;
    if (!Title || !Content) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const newNotification = new Notification({
      Title,
      Content,
    });
    await newNotification.save();
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_notification",
      description: `Thêm thông báo ${Title}`,
      userId: req.decoded?._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: newNotification,
      status: "success",
    });
    res.status(201).json({ message: "Thêm thông báo thành công" });
  } catch (error) {
    console.error("Lỗi trong addNotification:", error);
    res.status(500).json({ message: "error", error });
  }
};

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, Content } = req.body;
    if (!Title || !Content) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { Title, Content },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }
    res
      .status(200)
      .json({ message: "Cập nhật thông báo thành công", updatedNotification });
  } catch (error) {
    console.error("Lỗi trong updateNotification:", error);
    res.status(500).json({ message: "error", error });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }
    res.status(200).json({ message: "Xóa thông báo thành công" });
  } catch (error) {
    console.error("Lỗi trong deleteNotification:", error);
    res.status(500).json({ message: "error", error });
  }
};

const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find();
    if (!notifications) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }
    res
      .status(200)
      .json({ message: "Lấy thông báo thành công", notifications });
  } catch (error) {
    console.error("Lỗi trong getNotification:", error);
    res.status(500).json({ message: "error", error });
  }
};

module.exports = {
  addLocation,
  addCategory,
  addNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  addAmenities,
};

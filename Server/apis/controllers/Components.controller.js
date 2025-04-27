const {
  Location,
  Category,
  Notification,
  Amenities,
  Account,
} = require("../../models/schema");

const { logAction } = require("../utils/auditlog");
const { decode } = require("jsonwebtoken");
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

const addAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { Name } = req.body;
    const existingAmenities = await Amenities.findOne({ Name });
    if (existingAmenities) {
      return res.status(400).json({ message: "Tiện ích đã tồn tại" });
    }
    if (!Name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const newAmenities = new Amenities({
      Name,
    });
    await newAmenities.save();
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_amenities",
      description: `Thêm tiện ích ${Name}`,
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
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
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    await logAction({
      action: "add_amenities",
      description: "Lỗi khi thêm tiện ích",
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
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

const updateAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { id } = req.params;
    const { Name } = req.body;
    if (!Name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const updatedAmenities = await Amenities.findByIdAndUpdate(
      id,
      { Name },
      { new: true }
    );
    if (!updatedAmenities) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }
    await updatedAmenities.save();
    res
      .status(201)
      .json({ message: "Cập nhật tiện ích thành công", updatedAmenities });
  } catch (error) {
    console.error("Lỗi trong updateAmenities:", error);
    res.status(500).json({ message: "error", error });
  }
};

const removeAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { id } = req.params;
    const deleteAmenities = await Amenities.findByIdAndDelete(id);
    if (!deleteAmenities) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }

    getClientIp(req);

    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    // Ghi lại hành động vào audit log
    await logAction({
      action: "remove_amenities",
      description: `Xóa tiện ích ${id}`,
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "success",
    });
    console.log("Xóa tiện ích thành công", deleteAmenities);
    res.status(201).json({ message: "Xóa tiện ích thành công" });
  } catch (error) {
    console.error("Lỗi trong removeAmenities:", error);
    // Ghi lại lỗi vào audit log
    getClientIp(req);
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    await logAction({
      action: "remove_amenities",
      description: "Lỗi khi xóa tiện ích",
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    res.status(500).json({ message: "error", error });
  }
};

const getListAmenities = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const amenities = await Amenities.find();
    if (!amenities) {
      return res.status(404).json({ message: "Không tìm thấy tiện ích" });
    }

    res.status(201).json({ message: "Lấy tiện ích thành công", amenities });
  } catch (error) {
    console.error("Lỗi trong getListAmenities:", error);
    res.status(500).json({ message: "error", error });
  }
};

// -------------------------------------------------Location------------------------------------------------
const getLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const locations = await Location.find();
    if (!locations) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }
    res.status(201).json({ message: "Lấy địa điểm thành công", locations });
  } catch (error) {
    console.error("Lỗi trong getLocation:", error);
    res.status(500).json({ message: "error", error });
  }
};

const addLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { Name } = req.body;
    const existingLocation = await Location.findOne({ Name });
    if (existingLocation) {
      return res.status(400).json({ message: "Địa điểm đã tồn tại" });
    }
    if (!Name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const newLocation = new Location({
      Name,
    });

    await newLocation.save();
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_location",
      description: `Thêm địa điểm ${Name}`,
      userId: user._id,
      userName: user.First + " " + user.LastName,
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
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "add_location",
      description: "Lỗi khi thêm địa điểm",
      userId: user._id,
      userName: user.First + " " + user.LastName,
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

const updateLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { id } = req.params;
    const { Name } = req.body;
    if (!Name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { Name },
      { new: true }
    );
    if (!updatedLocation) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm" });
    }
    res
      .status(201)
      .json({ message: "Cập nhật địa điểm thành công", updatedLocation });
  } catch (error) {
    console.error("Lỗi trong updateLocation:", error);
    res.status(500).json({ message: "error", error });
  }
};

const removeLocation = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { id } = req.params;
    const deleteLocation = await Location.findByIdAndDelete(id);

    // Ghi lại hành động vào audit log
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    await logAction({
      action: "remove_location",
      description: `Xóa địa điểm ${id}`,
      userId: req.decoded?._id,
      userName: user.FirstName + " " + user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "success",
    });
    if (!deleteLocation) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    res.status(201).json({ message: "Xóa địa thành công" });
  } catch (error) {
    console.error("Lỗi trong deleteLocation:", error);
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "remove_location",
      description: "Lỗi khi xóa địa điểm",
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });
    res.status(500).json({ message: "error", error: error.message });
  }
};

// -------------------------------------------------Category------------------------------------------------
const addCategory = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { Name } = req.body;
    if (!Name) {
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
    });
    await newCategory.save();
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    // Ghi lại hành động vào audit log
    await logAction({
      action: "add_category",
      description: `Thêm danh mục ${Name}`,
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
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
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "add_category",
      description: "Lỗi khi thêm danh mục",
      userId: user._id,
      userName: user.FirstName + " " + user.LastName,
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
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }

    const { id } = req.params;
    console.log("ID:", id);
    const deleteCategory = await Category.findByIdAndDelete(id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Không tìm thấy phân loại" });
    }
    // Ghi lại hành động vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "remove_category",
      description: `Xóa phân loại ${id}`,
      userId: user._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "success",
    });

    res.status(201).json({ message: "Xóa phân loại thành công" });
  } catch (error) {
    console.error("Lỗi trong delete category:", error);
    // Ghi lại lỗi vào audit log
    const getClientIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    await logAction({
      action: "remove_category",
      description: "Lỗi khi xóa phân loại",
      userId: user._id,
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

const listCategory = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const categories = await Category.find();
    if (!categories) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.status(201).json({ message: "Lấy danh mục thành công", categories });
  } catch (error) {
    res.status(500).json({ message: "error", error });
    console.error("Lỗi trong listCategory:", error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });
    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(403).json({ message: "Khong co quyen truy cap" });
    }
    const { id } = req.params;
    const { Name } = req.body;
    if (!Name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { Name },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res

      .status(201)
      .json({ message: "Cập nhật danh mục thành công", updatedCategory });
  } catch (error) {
    console.error("Lỗi trong updateCategory:", error);
    res.status(500).json({ message: "error", error });
  }
};

// -------------------------------------------------Notification------------------------------------------------
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
      .status(201)
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
    res.status(201).json({ message: "Xóa thông báo thành công" });
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
      .status(201)
      .json({ message: "Lấy thông báo thành công", notifications });
  } catch (error) {
    console.error("Lỗi trong getNotification:", error);
    res.status(500).json({ message: "error", error });
  }
};

module.exports = {
  addNotification,
  updateNotification,
  deleteNotification,
  getNotification,

  getLocation,
  addLocation,
  updateLocation,
  removeLocation,

  addAmenities,
  getListAmenities,
  updateAmenities,
  removeAmenities,

  listCategory,
  addCategory,
  updateCategory,
  removeCategory,
};

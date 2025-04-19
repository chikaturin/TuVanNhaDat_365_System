const { Location, Category, Notification } = require("../../models/schema");

const addLocation = async (req, res) => {
  try {
    const { Name, Description } = req.body;
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
    res.status(201).json({ message: "Thêm địa điểm thành công" });
  } catch (error) {
    console.error("Lỗi trong addLocation:", error);
    res.status(500).json({ message: "error", error });
  }
};

const removeLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteLocation = await Location.findByIdAndDelete(id);
    if (!deleteLocation) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }
    res.status(200).json({ message: "Xóa địa thành công" });
  } catch (error) {
    console.error("Lỗi trong deleteLocation:", error);
    res.status(500).json({ message: "error", error });
  }
};

const addcategory = async (req, res) => {
  try {
    const { Name, Image } = req.body;
    if (!Name || !Image) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const newCategory = new Category({
      Name,
      Image,
    });
    await newCategory.save();
    res.status(201).json({ message: "Thêm danh mục thành công" });
  } catch (error) {
    console.error("Lỗi trong addCate:", error);
    res.status(500).json({ message: "error", error });
  }
};

const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCategory = await Location.findByIdAndDelete(id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Không tìm thấy phân loại" });
    }
    res.status(200).json({ message: "Xóa phân loại thành công" });
  } catch (error) {
    console.error("Lỗi trong delete category:", error);
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
  addcategory,
  addNotification,
  updateNotification,
  deleteNotification,
  getNotification,
};

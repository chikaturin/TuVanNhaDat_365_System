const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
dotenv.config();
const { Property, Amenities, Account } = require("../../models/schema");
const sharp = require("sharp");
const { logAction } = require("../utils/auditlog");
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
const cloudinary = require("cloudinary").v2;

const postContentImage = async (req, res) => {
  try {
    const {
      Title,
      Price,
      Description,
      Address,
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      Amenities,
      interior_condition,
      deposit_amount,
      type_documents,
      Balcony_direction,
      Type_apartment,
      maindoor_direction,
    } = req.body;
    
    const requiredFields = [
      Title,
      Price,
      Description,
      Address,
<<<<<<< HEAD
=======
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      interior_condition,
      deposit_amount,
    ];

    if (
      requiredFields.some(
        (field) =>
          field === undefined ||
          field === null ||
          (Array.isArray(field) && field.length === 0)
      )
    ) {
      return res
        .status(401)
        .json({ message: "Vui lòng điền đầy đủ các trường." });
    }

    if (!req.decoded?.PhoneNumber) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const files = req.files;

    if (!files || files.length < 4 || files.length > 9) {
      return res.status(401).json({
        error: "Bạn phải upload ít nhất 4 ảnh và không quá 9 ảnh.",
      });
    }

    const imageUrls = files.map((file) => file.path);

    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(400).json({ error: "Trường Amenities không hợp lệ." });
    }

    // Tạo property
    const property = new Property({
      Title,
      Price,
      Description,
      Address,
      Account: req.decoded?.PhoneNumber,
      State,
      Location,
      Amenities: parsedAmenities,
      interior_condition,
      deposit_amount,
      maindoor_direction,
      Type: {
        bedroom,
        bathroom,
        yearBuilt,
        garage,
        sqft,
        category,
      },
      Images: imageUrls,
    });

    // Xử lý trường hợp chung cư
    if (category === "Chung cư") {
      if (!Balcony_direction || !Type_apartment) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình chung cư",
        });
      }
      property.maindoor_direction = maindoor_direction;
      property.Balcony_direction = Balcony_direction;
      property.Type_apartment = Type_apartment;
    }

    // Xử lý trường hợp đăng bán
    if (State === "Đăng bán") {
      if (!type_documents) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình bán",
        });
      }
      property.type_documents = type_documents;
    }

    const savedProperty = await property.save();

    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (user) {
      await logAction({
        action: "create",
        description: "Tạo bài đăng mới thành công " + savedProperty._id,
        userId: req.decoded?.PhoneNumber,
        userName: user.FirstName + " " + user.LastName,
        role: user.Role,
        ipAddress: getClientIp(req),
        previousData: null,
        newData: savedProperty,
        status: "success",
      });
    }

    res.status(201).json({
      message: "Tạo property thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const {
      Title,
      Price,
      Description,
      Address,
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      Amenities,
      interior_condition,
      deposit_amount,
      type_documents,
      Balcony_direction,
      Type_apartment,
      maindoor_direction,
    } = req.body;

    const requiredFields = [
      Title,
      Price,
      Description,
      Address,
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      Amenities,
      interior_condition,
      deposit_amount,
    ];

    if (
      requiredFields.some(
        (field) =>
          field === undefined ||
          field === null ||
          (Array.isArray(field) && field.length === 0)
      )
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ các trường." });
    }

    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(401).json({ error: "Trường Amenities không hợp lệ." });
    }
    const { _id } = req.params;
    const oldProperty = await Property.findById(_id);
    if (!oldProperty) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng." });
    }
    const property = {
      Title,
      Price,
      Description,
      Address,
      Account: req.decoded?.PhoneNumber,
      State,
      Location,
      Amenities: parsedAmenities,
      interior_condition,
      deposit_amount,
      Type: {
        bedroom,
        bathroom,
        yearBuilt,
        garage,
        sqft,
        category,
      },
    };
    if (category === "Chung cư") {
      if (!Balcony_direction || !Type_apartment || !maindoor_direction) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình chung cư",
        });
      }
      property.maindoor_direction = maindoor_direction;
      property.Balcony_direction = Balcony_direction;
      property.Type_apartment = Type_apartment;
    }

    // Xử lý trường hợp đăng bán
    if (State === "Đăng bán") {
      if (!type_documents) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình bán",
        });
      }
      property.type_documents = type_documents;
    }

    const files = req.files;

    for (const oldUrl of oldProperty.Images) {
      const segments = oldUrl.split("/");
      const fileName = segments[segments.length - 1].split(".")[0];
      const publicId = `Homez/${fileName}`;
      await cloudinary.uploader.destroy(publicId);
    }

    if (!files || files.length < 4 || files.length > 9) {
      return res.status(401).json({
        error: "Bạn phải upload ít nhất 4 ảnh và không quá 9 ảnh.",
      });
    }

    const imageUrls = files.map((file) => file.path);
    property.Images = imageUrls;

<<<<<<< HEAD
      for (const file of files) {
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        webpImages.push(webpBuffer);
      }

      console.log("Tổng số ảnh đã xử lý:", webpImages.length);

      const imageDoc = new PropertyImage({
        Image: webpImages,
        Property: savedProperty._id,
      });

      await imageDoc.save();
      console.log("Đã lưu PropertyImage thành công");
    }

    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    // Lưu audit log
    await logAction({
      action: "create",
      description: "Tạo bài đăng mới thành công " + savedProperty._id,
      userId: user._id,
      userName: user.FirstName+" "+user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: savedProperty,
      status: "success",
=======
    const savedProperty = await Property.findByIdAndUpdate(_id, property, {
      new: true,
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c
    });
    await savedProperty.save();

    res.status(201).json({
      message: "Cập nhật bài đăng thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
<<<<<<< HEAD
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "create",
      description: "Lỗi khi tạo bài đăng mới",
      userId: user._id,
      userName: user.FirstName+ " "+ user.LastName,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });

=======
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPropertyAD = async (req, res) => {
  try {
    const checkToken = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (
      !checkToken ||
      (checkToken.Role !== "Admin" && checkToken.Role !== "Staff")
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const posts = await Property.aggregate([
      { $match: { Approved: { $ne: true } } },
      {
        $lookup: {
          from: "accounts",
          localField: "Account",
          foreignField: "PhoneNumber",
          as: "Account",
        },
      },
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    return res
      .status(200)
      .json({ message: "Lấy bài đăng thành công", data: posts });
  } catch (error) {
    console.error("Lỗi trong getPropertyAD:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
const getProperty = async (req, res) => {
  try {
    const posts = await Property.aggregate([
      { $match: { Approved: { $ne: false } } },
      {
        $lookup: {
          from: "accounts",
          localField: "Account",
          foreignField: "PhoneNumber",
          as: "Account",
        },
      },
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }
    return res
      .status(200)
      .json({ message: "Lấy bài đăng thành công", data: posts });
  } catch (error) {
    console.error("Lỗi trong getPropertyAD:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getPropertyDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const checkToken = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (
      !checkToken ||
      (checkToken.Role !== "Admin" && checkToken.Role !== "Staff")
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const posts = await Property.aggregate([
      {
        $match: {
          Approved: { $ne: true },
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "Account",
          foreignField: "PhoneNumber",
          as: "Account",
        },
      },
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    return res
      .status(201)
      .json({ message: "Lấy bài đăng thành công", data: posts });
  } catch (error) {
    console.error("Lỗi trong getPropertyAD:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái bài đăng
const updateStatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Property.findByIdAndUpdate(id, {
      $set: { Approved: true },
    });

    if (!post) {
      return res.status(401).json({ message: "Không tìm thấy thông tin" });
    }

    res.status(201).json({ message: "update success" });
  } catch (err) {
    console.error("Lỗi trong updateStatePost:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa bài đăng
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const Post = await Property.findByIdAndDelete(id);
    if (!Post) {
      res.status(401).json({ message: "Can not find post" });
    }
    res.status(200).json({ message: "Delete post success" });
  } catch (error) {
    console.error("Lỗi trong deletePost:", error);
    res.status(500).json({ message: "error", error });
  }
};

<<<<<<< HEAD
// Cập nhật bài đăng
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const post = await Property.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy thông tin" });
    }

    res.status(200).json({ message: "Cập nhật thông tin thành công" });
  } catch (error) {
    console.error("Lỗi trong updatePost:", error);
    res.status(500).json({ message: "error", error });
  }
};

const getListPost = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const posts = await Property.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Property.countDocuments();

    res.status(200).json({
      posts,
      totalPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    console.error("Lỗi trong getListPost:", error);
    res.status(500).json({ message: "error", error });
  }
};

const getListPostWithApprovedTrue = async (req, res) => {
  try{
    const posts = await Property.find({ Approved: true })
    res.status(200).json({
      message: "Lấy danh sách bài đăng thành công",
      posts,
    });
  }
  catch (error) {
    console.error("Lỗi trong getListPostWithApprovedTrue:", error);
    res.status(500).json({ message: "error", error });
  }
}

=======
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c
module.exports = {
  postContentImage,
  getPropertyAD,
  getProperty,
  getPropertyDetail,
  updateStatePost,
  deletePost,
  updatePost,
<<<<<<< HEAD
  getListPost,
  getListPostWithApprovedTrue,
=======
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c
};

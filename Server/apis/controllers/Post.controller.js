const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
dotenv.config();
const { Property, Amenities, Account } = require("../../models/schema");
const sharp = require("sharp");
const { logAction } = require("../utils/auditlog");
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
const fs = require("fs");
const path = require("path");

const postContentImage = async (req, res) => {
  console.log("postContentImage", req.body);
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

    console.log("files", files);

    if (!files || files.length < 4 || files.length > 9) {
      files.forEach((file) => fs.unlinkSync(file.path));
      return res.status(401).json({
        error: "Bạn phải upload ít nhất 4 ảnh và không quá 9 ảnh.",
      });
    }

    const imageUrls = [];

    for (const file of files) {
      const inputPath = file.path;
      const webpFilename = file.filename.split(".")[0] + ".webp";
      const outputPath = path.join(
        path.dirname(inputPath),
        `webp_${webpFilename}`
      );

      try {
        await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);

        fs.unlinkSync(inputPath);

        imageUrls.push(`${process.env.URL_IMAGES}/${`webp_${webpFilename}`}`);
      } catch (err) {
        console.error("Error converting image to webp:", err);
        return res.status(500).json({ message: "Lỗi chuyển ảnh sang webp" });
      }
    }

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
      if (!Balcony_direction) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình chung cư",
        });
      }
      property.maindoor_direction = maindoor_direction;
      property.Balcony_direction = Balcony_direction;
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
    if (State === "Cho thuê") {
      if (!deposit_amount) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình cho thuê",
        });
      }
      property.deposit_amount = deposit_amount;
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
  console.log("updatePost", req.body);
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
      Images,
    } = req.body;

    const { _id } = req.params;
    const checkRole = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(401).json({ error: "Trường Amenities không hợp lệ." });
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
      maindoor_direction,
      Type: {
        bedroom,
        bathroom,
        yearBuilt,
        garage,
        sqft,
        category,
      },
      Images,
    };

    const files = req.files;

    console.log("files", files);
    const imageUrls = [];

    if (Array.isArray(Images)) {
      Images.forEach((url) => {
        if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      });
    } else if (typeof Images === "string" && Images.trim() !== "") {
      if (!imageUrls.includes(Images)) {
        imageUrls.push(Images);
      }
    }

    if (files) {
      for (const file of files) {
        const inputPath = file.path;
        const webpFilename = file.filename.split(".")[0] + ".webp";
        const outputPath = path.join(
          path.dirname(inputPath),
          `webp_${webpFilename}`
        );

        try {
          await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);

          fs.unlinkSync(inputPath);

          imageUrls.push(`${process.env.URL_IMAGES}/${`webp_${webpFilename}`}`);
        } catch (err) {
          console.error("Error converting image to webp:", err);
          return res.status(500).json({ message: "Lỗi chuyển ảnh sang webp" });
        }
      }
    }
    property.Images = imageUrls;

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

    if (State === "Đăng bán") {
      if (!type_documents) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình bán",
        });
      }
      property.type_documents = type_documents;
    }

    const savedProperty = await Property.findByIdAndUpdate(_id, property, {
      new: true,
    });
    await savedProperty.save();

    res.status(201).json({
      message: "Cập nhật bài đăng thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePostUser = async (req, res) => {
  console.log("updatePostUser", req.body);
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
      Images,
    } = req.body;

    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(401).json({ error: "Trường Amenities không hợp lệ." });
    }
    const { _id } = req.params;
    const property = {
      Title,
      Price,
      Description,
      Address,
      Account: req.decoded?.PhoneNumber,
      State,
      Location,
      Approved: false,
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
      Images,
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

    const files = req.files;
    const imageUrls = [];

    if (Array.isArray(Images)) {
      Images.forEach((url) => {
        if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      });
    } else if (typeof Images === "string" && Images.trim() !== "") {
      if (!imageUrls.includes(Images)) {
        imageUrls.push(Images);
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const inputPath = file.path;
        const webpFilename = file.filename.split(".")[0] + ".webp";
        const outputPath = path.join(
          path.dirname(inputPath),
          `webp_${webpFilename}`
        );

        try {
          await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
          fs.unlinkSync(inputPath);

          const imageUrl = `${process.env.URL_IMAGES}/webp_${webpFilename}`;
          if (!imageUrls.includes(imageUrl)) {
            imageUrls.push(imageUrl);
          }
        } catch (err) {
          console.error("Error converting image to webp:", err);
          return res.status(500).json({ message: "Lỗi chuyển ảnh sang webp" });
        }
      }
    }

    property.Images = imageUrls;

    if (State === "Đăng bán") {
      if (!type_documents) {
        return res.status(401).json({
          message: "Vui lòng điền đầy đủ các trường cho loại hình bán",
        });
      }
      property.type_documents = type_documents;
    }

    const savedProperty = await Property.findByIdAndUpdate(_id, property, {
      new: true,
    });
    await savedProperty.save();

    res.status(201).json({
      message: "Cập nhật bài đăng thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
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

    const posts = await Property.aggregate([
      {
        $match: {
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

const addHighlightTag = async (req, res) => {
  try {
    const { _id } = req.params;
    const property = await Property.findById(_id);
    if (!property) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }
    property.highlight === true
      ? (property.highlight = false)
      : (property.highlight = true);
    await property.save();
    res.status(200).json({
      message: "Thay đổi trạng thái highlight thành công",
      highlight: property.highlight,
    });
  } catch (error) {
    console.error("Lỗi trong addHighlightTag:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const listingPortUser = async (req, res) => {
  try {
    const PhoneNumber = req.decoded.PhoneNumber;
    const posts = await Property.aggregate([
      { $match: { Account: PhoneNumber } },
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

module.exports = {
  postContentImage,
  getPropertyAD,
  getProperty,
  getPropertyDetail,
  updateStatePost,
  deletePost,
  updatePost,
  addHighlightTag,
  updatePostUser,
  listingPortUser,
};

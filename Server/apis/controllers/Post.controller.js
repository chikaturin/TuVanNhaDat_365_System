const dotenv = require("dotenv");
dotenv.config();
const {
  Property,
  PropertyImage,
  Amenities,
  Account,
} = require("../../models/schema");
const sharp = require("sharp");
const { logAction } = require("../utils/auditlog");
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

const postContentImage = async (req, res) => {
  try {
    const {
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      NumberOfRooms,
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      Amenities,
    } = req.body;

    const requiredFields = [
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      NumberOfRooms,
      bedroom,
      bathroom,
      yearBuilt,
      garage,
      sqft,
      category,
      State,
      Location,
      Amenities,
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

    // Đảm bảo Amenities luôn là mảng
    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(401).json({ error: "Trường Amenities không hợp lệ." });
    }

    const property = new Property({
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      NumberOfRooms,
      Account: req.decoded?.PhoneNumber,
      State,
      Location,
      Amenities: parsedAmenities,
      Type: {
        bedroom,
        bathroom,
        yearBuilt,
        garage,
        sqft,
        category,
      },
    });

    const savedProperty = await property.save();
    const files = req.files?.images;

    if (!files || files.length < 4 || files.length > 9) {
      console.log("Lỗi số lượng file:", files.length);
      return res.status(402).json({
        error: "Bạn phải upload ít nhất 4 ảnh và không quá 9 ảnh.",
      });
    }

    if (files && files.length > 0) {
      const webpImages = [];

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
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: savedProperty,
      status: "success",
    });

    res.status(201).json({
      message: "Tạo property thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
    const user = await Account.findOne({
      PhoneNumber: req.decoded?.PhoneNumber,
    });

    await logAction({
      action: "create",
      description: "Lỗi khi tạo bài đăng mới",
      userId: user._id,
      userName: user.Name,
      role: user.Role,
      ipAddress: getClientIp(req),
      previousData: null,
      newData: null,
      status: "fail",
    });

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const getContent = async (req, res) => {
//   try {
//     const {
//       keyWord,
//       minPrice,
//       maxPrice,
//       Location,
//       page = 1,
//       pageSize = 20,
//     } = req.query;

//     const filter = {};

//     // Tìm kiếm theo từ khóa trong Title hoặc Description
//     if (keyWord) {
//       const regex = new RegExp(keyWord, "i");
//       filter.$or = [
//         { Title: { $regex: regex } },
//         { Description: { $regex: regex } },
//       ];
//     }

//     // Lọc theo khoảng giá
//     if (minPrice || maxPrice) {
//       filter.Price = {};
//       if (minPrice) filter.Price.$gte = parseInt(minPrice);
//       if (maxPrice) filter.Price.$lte = parseInt(maxPrice);
//     }

//     // Lọc theo khu vực
//     if (Location) {
//       filter.Location = Location;
//     }

//     // Phân trang
//     const skip = (parseInt(page) - 1) * parseInt(pageSize);
//     const limit = parseInt(pageSize);

//     const [total, listings] = await Promise.all([
//       Property.countDocuments(filter),
//       Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
//     ]);

//     return res.json({
//       total,
//       page: parseInt(page),
//       pageSize: parseInt(pageSize),
//       listings,
//     });
//   } catch (err) {
//     console.error("Lỗi trong getContent:", err);
//     return res.status(500).json({ message: "Lỗi server" });
//   }
// };

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

    // Lấy danh sách property chưa duyệt + join Account
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

    // Lấy tất cả ảnh liên quan đến property
    const propertiesImages = await PropertyImage.find({
      Property: { $in: posts.map((post) => post._id) },
    });

    // Gộp ảnh vào từng post
    const propertiesWithImages = posts.map((post) => {
      const images = propertiesImages
        .filter((img) => img.Property.toString() === post._id.toString())
        .flatMap((img) =>
          img.Image.map(
            (buffer) => `data:image/webp;base64,${buffer.toString("base64")}`
          )
        );
      return {
        ...post,
        Images: images,
      };
    });

    return res
      .status(200)
      .json({ message: "Lấy bài đăng thành công", data: propertiesWithImages });
  } catch (error) {
    console.error("Lỗi trong getPropertyAD:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getContentDetail = async (req, res) => {
  try {
    const { _id } = req.params;
    const inforUser = req.decoded?.Role;
    const property = await Property.findById(_id);
    const inforPoster = await User.findById(property.User);
    if (!property) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin property" });
    }
    if (inforUser === "Admin" || inforUser === "Staff") {
      if (!inforPoster) {
        return res
          .status(402)
          .json({ message: "Không tìm thấy thông tin poster" });
      }
      return res.json({ property, inforPoster });
    }
    return res.status(201).json({
      property,
      firstName: inforPoster.FirstName,
      lastName: inforPoster.LastName,
    });
  } catch (err) {
    console.error("Lỗi trong getContentDetail:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái bài đăng
const updateStatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Property.findByIdAndUpdate(id, {
      $set: (Approved = true),
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

module.exports = {
  // postContent,
  postContentImage,
  getPropertyAD,
  getContentDetail,
  updateStatePost,
  deletePost,
  updatePost,
  getListPost,
};

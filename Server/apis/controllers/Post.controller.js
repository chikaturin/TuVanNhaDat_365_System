const dotenv = require("dotenv");
dotenv.config();
const {
  Property,
  PropertyImage,
  Amenities: AmenitiesModel,
  Account,
} = require("../../models/schema");
const sharp = require("sharp");

const {logAction}= require("../utils/auditlog")
const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
const { decode } = require("jsonwebtoken");


//Tạo bài đăng
const postContent = async (req, res) => {
  try {
    const inforUser = req.decoded?._id;
    const {
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      Area,
      NumberOfRooms,
      Category,
      State,
      Location,
      Amenities,
    } = req.body;

    if (!inforUser) return res.status(401).json({ message: "Unauthorized" });

    const requiredFields = [
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      Area,
      NumberOfRooms,
      Category,
      State,
      Location,
      Amenities,
    ];

    if (
      requiredFields.some(
        (field) => !field || (Array.isArray(field) && field.length === 0)
      )
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const newListing = new Property({
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      Area,
      NumberOfRooms,
      Category,
      State,
      Location,
      User: inforUser,
    });
    await newListing.save();

    const amenityDocs = await Promise.all(
      Amenities.map((item) =>
        new AmenitiesModel({
          Name: item.Name,
          Description: item.Description,
          Property: newListing._id,
        }).save()
      )
    );

    newListing.Amenities = amenityDocs.map((doc) => doc._id);
    await newListing.save();

    res
      .status(201)
      .json({ message: "New listing created", listing: newListing });
  } catch (e) {
    console.error("error in postContent:", e);
    res.status(500).json({ message: "Server error" });
  }
};

const postContentImage = async (req, res) => {
  try {
      // const infoUser = req.decoded?._id;
      // if (!infoUser) return res.status(401).json({ message: "Unauthorized" });

    const {
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      Area,
      NumberOfRooms,
      Category,
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
      Area,
      NumberOfRooms,
      Category,
      State,
      Location,
      Amenities,
    ];

    if (
      requiredFields.some(
        (field) => !field || (Array.isArray(field) && field.length === 0)
      )
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    // Đảm bảo Amenities luôn là mảng
    let parsedAmenities;
    try {
      parsedAmenities = Array.isArray(Amenities)
        ? Amenities
        : JSON.parse(Amenities || "[]");
    } catch (err) {
      return res.status(400).json({ error: "Trường Amenities không hợp lệ." });
    }

    const property = new Property({
      Title,
      Price,
      Description,
      Address,
      Length,
      Width,
      Area,
      NumberOfRooms,
      Category,
      State,
      Location,
      User: 123,
      Amenities: parsedAmenities,
    });

    const savedProperty = await property.save();
    //Lưu thông tin vào audit log
   
    const videoFile = req.files?.video?.[0];

    if (videoFile) {
      const videoBuffer = videoFile.buffer;
      const videoMime = videoFile.mimetype;
    
      // Nếu muốn lưu vào MongoDB:
      const propertyVideo = {
        data: videoBuffer,
        contentType: videoMime,
      };

      savedProperty.Video = propertyVideo;
      await savedProperty.save();
    }

    
  

    const files = req.files; // Lấy danh sách ảnh upload từ multer

    if (!files || files.length < 4 || files.length > 9) {
      return res.status(400).json({
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

      const imageDoc = new PropertyImage({
        Image: webpImages,
        Property: savedProperty._id,
      });

      await imageDoc.save();
    }

    const user  = await Account.findById(req.decoded?._id);
    

    await logAction({
      action: "create",
      description: "Tạo bài đăng mới",
      userId: user._id,
      userName: user.Name, // Thay thế bằng tên người dùng thực tế
      role: user.Role,
      ipAddress: getClientIp(req), // Lấy địa chỉ IP của người dùng
      previousData: null, // Không có dữ liệu trước đó khi tạo mới
      newData: savedProperty, // Dữ liệu mới được tạo
      status:"success",
    })




    res.status(201).json({
      message: "Tạo property thành công!",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error in postContentImage:", error);
    // Ghi log lỗi vào audit log
    const user  = await Account.findById(req.decoded?._id);
    await logAction({
      action: "create",
      description: "Lỗi khi tạo bài đăng mới",
      userId: user._id,
      userName: user.Name, // Thay thế bằng tên người dùng thực tế
      role: user.Role,
      ipAddress: getClientIp(req), // Lấy địa chỉ IP của người dùng
      previousData: null, // Không có dữ liệu trước đó khi tạo mới
      newData: savedProperty, // Dữ liệu mới được tạo
      status:"fail",
    })

    console.log(error.message);
    res.status(500).json({ message: "Server error" , error: error.message});
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
  postContent,
  postContentImage,
  // getContent,
  getContentDetail,
  updateStatePost,
  deletePost,
  updatePost,
  getListPost,
};

const {Contact} = require ("../../models/schema")


//Hàm tạo contact
const sendContact = async (req, res) => {
    try{
        
        const {name,phone,post,typeofPost,message,email} = req.body;
        if(!name || !phone || !post || !typeofPost || !email){
            return res.status(400).json({message: "Vui lòng nhập đầy đủ thông tin"})
        }

        //Kiểm tra xem đã từng gửi yêu cầu về bài đăng chưa
        const existingRequest = await Contact.find({post: post, email: email,name: name, phone: phone});
        if(existingRequest.length > 0){
            return res.status(400).json({message: "Bạn đã gửi yêu cầu về bài đăng này rồi"})
        }
        //Kiểm tra xem tổng số yêu cầu đã gửi có lớn hơn 5 hay không
        const totalRequest = await Contact.find({email: email});
        if(totalRequest.length > 5){
            return res.status(400).json({message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau"})
        }


        const newRequest = new Contact({
            name,
            phone,
            post,
            typeofPost,
            message,
            email
        })

        await newRequest.save();
        return res.status(200).json({message: "Yêu cầu đã được gửi thành công"})
    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu"})
    }
}

const getContactByAdmin = async (req, res) => {
    try{
        // const checkRole = await Account.findOne({
        //       PhoneNumber: req.decoded?.PhoneNumber,
        //     });
        
        //     if (checkRole.Role !== "Admin" && checkRole.Role !== "Staff") {
        //       return res.status(403).json({ message: "Khong co quyen truy cap" });
        //     }
        
        const {page, limit} = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const totalContacts = await Contact.countDocuments();
        const totalPages = Math.ceil(totalContacts / limitNumber);
        const contacts = await Contact.find().sort({email:1,createAt:1}).select('name phone post typeofPost email status -_id').skip(skip).limit(limitNumber);
        return res.status(200).json({
            contacts,
            totalPages,
            currentPage: pageNumber,
            totalContacts
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Đã xảy ra lỗi trong quá trình gửi yêu cầu"})
    }
}

const getUserContact = async (req, res) => {}



module.exports = {
    sendContact,
    getContactByAdmin,
}

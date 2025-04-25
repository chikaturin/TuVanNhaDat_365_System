// utils/auditLogger.js
const AuditLog = require("../../models/schema").AuditLog; // Import your AuditLog model

const logAction = async ({
  action,
  description = "",
  userId,
  userName,
  role,
  ipAddress,
  previousData,
  newData,
  status = "success"
}) => {
  try {
    await AuditLog.create({
      action,
      description,
      userId,
      userName,
      role,
      ipAddress,
      previousData,
      newData,
      status
    });
  } catch (err) {
    console.error("Lỗi ghi audit log:", err);
  }
};

module.exports = { logAction };

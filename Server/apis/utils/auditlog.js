const AuditLog = require("../../models/schema").AuditLog;

const logAudit = async ({
  action,
  description,
  userId,
  userName,
  role,
  resource,
  resourceId,
  ipAddress,
  previousData,
  newData,
  status = "success",
}) => {
  try {
    await AuditLog.create({
      action,
      description,
      userId,
      userName,
      role,
      resource,
      resourceId,
      ipAddress,
      previousData,
      newData,
      status,
    });
  } catch (error) {
    console.error("Không thể ghi Audit Log:", error);
  }
};

module.exports = logAudit;

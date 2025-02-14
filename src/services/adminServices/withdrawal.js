const AdminUser = require("../../models/AdminUser");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const bcrypt = require("bcryptjs");

exports.approveWithdrawalrequest = async (body) => {
  const { email, password, withdrawalId } = body;
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return {
      status: 404,
      data: { message: "Admin not found" },
    };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return {
      status: 401,
      data: { message: "Unauthorized access" },
    };
  }
  console.log("adminaa:", admin);
  if (admin.role !== "admin" && admin.role !== "Finance") {
    return {
      status: 401,
      data: { message: "You dont have the role to approve this request" },
    };
  }

  const withdrawal = await WithdrawalRequest.findByPk(withdrawalId);
  if (!withdrawal) {
    return {
      status: 404,
      data: { message: "Withdrawal not found" },
    };
  }
  console.log("withdrawal:", withdrawal);

  withdrawal.status = "approved";
  withdrawal.processedAt = Date.now();
  withdrawal.adminId = admin.id;

  await withdrawal.save();

  return {
    status: 200,
    data: { message: "Withdrawal approved", withdrawal },
  };
};

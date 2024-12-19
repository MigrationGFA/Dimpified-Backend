const AdminUser = require("../../models/AdminUser");
const AdminNotification = require("../../models/AdminNotification");

exports.getAdminNotification = async (query) => {
  const { email } = query;

  if (!email) {
    return {
      status: 400,
      data: {
        message: "Email is required",
      },
    };
  }

  // Find the user by email
  const user = await AdminUser.findOne({ where: { email } }); // Sequelize query
  if (!user) {
    return { status: 404, data: { message: "User not found" } };
  }

  const { role } = user;

  // Determine roles to query based on user role
  let rolesToQuery;
  if (role === "admin" || role === "product") {
    rolesToQuery = null; //
  } else if (role === "finance") {
    rolesToQuery = ["general", "finance"];
  } else if (role === "support") {
    rolesToQuery = ["general", "support"];
  } else if (role === "sales") {
    rolesToQuery = ["general", "sales"];
  } else {
    return { status: 400, data: { message: "Invalid role" } };
  }

  const notificationQuery = rolesToQuery ? { role: { $in: rolesToQuery } } : {};
  const notifications = await AdminNotification.find(notificationQuery).sort({
    date: -1,
  });

  return {
    status: 200,
    data: notifications,
  };
};

const https = require("https");
const moment = require("moment");

const verifyPayment = async (reference) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  try {
    const apiRes = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      apiReq.on("error", (error) => {
        reject(error);
      });

      apiReq.end();
    });

    return JSON.parse(apiRes);
  } catch (error) {
    throw error;
  }
};

const generateMonthRange = (start, end) => {
  const months = [];
  const current = moment(start);

  while (current.isSameOrBefore(end, "month")) {
    months.push({
      month: current.format("MMMM YYYY"),
      totalSales: 0, //
    });
    current.add(1, "month");
  }

  return months;
};

const calculatePercentageDifference = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

module.exports = {
  verifyPayment,
  generateMonthRange,
  calculatePercentageDifference,
};



const https = require('https')

const payStackBankList = async (req, res) => {
const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/bank',
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  }
}

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
}

const paystackBankDetails = async(account, bankCode) => {
    const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: `/bank/resolve?account_number=${account}&bank_code=${bankCode}`,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  }
}
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
}


const getAllBanks = async (req, res) => {
    try {
        const allBanks = await payStackBankList()
        if (!allBanks || !allBanks.data) {
      return res.status(400).json({
        message: "Bank list not available",
      });
    }
     return res.status(200).json({allBanks})
    } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error" });
    }
}

const verifyBankDetails = async(req, res) => {
    try {
        const {account, bankCode} = req.body
        const verifyDetails = await paystackBankDetails(account, bankCode)
        console.log( verifyDetails)
        if (!verifyDetails || !verifyDetails.data) {
      return res.status(400).json({
        message: "incorrect bank number",
      });
    }
     return res.status(200).json({verifyDetails})
    } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error" });
    }
}

module.exports = {
    getAllBanks,
    verifyBankDetails
}
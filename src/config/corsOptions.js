const whiteList = [
  "http://localhost:5175",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.dimpified.com",
  "https://dimpified.com",
  "https://dimpified-frontend-testing.azurewebsites.net",
  "https://dimp-test.azurewebsites.net",
  "https://admin.dimpified.com",
  "https://www.admin.dimpified.com/"
];
const allowedDomainsRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)?(localhost|dimpified\.com)(:\d{1,5})?$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin) || allowedDomainsRegex.test(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Access denied by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  credentials: true,
};


module.exports = corsOptions;


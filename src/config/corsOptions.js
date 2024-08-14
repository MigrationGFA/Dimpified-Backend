// // const whiteList = [
// //   "http://localhost:5175",
// //   "http://localhost:5173",
// //   "http://localhost:5174",
// //   "https://www.dimpified.com",
// //   "https://dimpified.com",
// //   "https://dimpified-frontend-testing.azurewebsites.net"
  
// // ];

// // const corsOptions = {
// //   origin: (origin, callback) => {
// //     if (whiteList.indexOf(origin) !== -1 || !origin) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error("Access denied by cors"));
// //     }
// //   },
// //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
// //   optionsSuccessStatus: 200,
// //   credentials: true,
// // };

// // module.exports = corsOptions;

// const whiteList = [
//   "http://localhost:5175",
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "https://www.dimpified.com",
//   "https://dimpified.com",
//   "https://dimpified-frontend-testing.azurewebsites.net"
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     // Check if the origin is in the whitelist
//     if (whiteList.indexOf(origin) !== -1 || !origin) {
//       return callback(null, true);
//     }
    
//     // Allow all subdomains of dimpified.com
//     const dimpifiedRegex = /^https:\/\/([a-zA-Z0-9-]+\.)?dimpified\.com$/;
//     if (dimpifiedRegex.test(origin)) {
//       return callback(null, true);
//     }

//     // Deny access if the origin doesn't match any of the allowed patterns
//     return callback(new Error("Access denied by CORS"));
//   },
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// module.exports = corsOptions;

const whiteList = [
  "http://localhost:5175",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.dimpified.com",
  "https://dimpified.com",
  "https://dimpified-frontend-testing.azurewebsites.net"
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



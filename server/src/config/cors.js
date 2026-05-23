// server/src/config/cors.js

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://learning-platform-1-jqby.onrender.com", // production frontend
];

const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? [
      ...process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()),
      ...defaultOrigins,
    ]
  : defaultOrigins;

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

module.exports = corsOptions;
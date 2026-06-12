const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/demographics", require("./routes/demographics"));
app.use("/api/documents", require("./routes/documents"));
app.use("/uploads", express.static("uploads"));
app.use("/api/vitals", require("./routes/Vitals"));
app.use("/api/medical-history", require("./routes/MedicalHistory"));
app.use("/api/user", require("./routes/userroutes"));
app.use("/api/access", require("./routes/accessRoutes"));
app.use("/api/auditlogs", require("./routes/auditLogs"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/login-history", require("./routes/LoginHistory"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/patient", require("./routes/patientRoutes"));

app.listen(process.env.PORT, () => console.log(`Server on ${process.env.PORT}`));




const mongoose = require("mongoose");

// Document Schema
const documentSchema = new mongoose.Schema({
  title: String,
  type: String,
  fileData: String, // base64 encoded string
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

// Permission Schema
const permissionSchema = new mongoose.Schema({
  read: { type: Boolean, default: false },
  write: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  upload: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  share: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
}, { _id: false });

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String },
  role: { type: String },
  time: { type: Date, default: Date.now },
}, { _id: false });

// Permission Change Logs
const permissionLogSchema = new mongoose.Schema({
  changedBy: { type: String, required: true },
  role: { type: String, required: true },
  module: { type: String, required: true },
  oldPermissions: permissionSchema,
  newPermissions: permissionSchema,
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

// Login History Schema
const loginHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }, // minutes
}, { _id: false });

// Professional Schema
const professionalSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  role: { type: String, enum: ["doctor", "nurse", "technician"], required: true },
});

// Department Schema
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  professionals: [professionalSchema],
}, { _id: false });

// User Schema
const userSchema = new mongoose.Schema({
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    }
  ],

  pendingEdits: {
    demographics: Object,
    vitals: Object,
    medicalHistory: Object,
    prescriptions: Array,
    labResults: Array,
    documents: Array,
  },

  name: String,
  email: { type: String, unique: true },
  password: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  role: { 
    type: String, 
    enum: ["patient", "doctor", "nurse", "technician", "admin"], 
    default: "patient" 
  },

  // Access control
  permissions: {
    type: Map,
    of: permissionSchema,
    default: {}
  },

  // Logs
  auditLogs: { type: [auditLogSchema], default: [] },
  permissionLogs: { type: [permissionLogSchema], default: [] },
  loginHistory: { type: [loginHistorySchema], default: [] },

  // Patient Info
  demographics: {
    fullName: String,
    gender: String,
    dob: String,
    contactNumber: String,
    address: String,
    emergencyContact: String,
    dateOfBirth: Date,
    phone: String,
    email: String,
    city: String,
    state: String,
    zipCode: Number,
    country: String,
    maritalStatus: String,
    emergencyContactName: String,
    emergencyContactRelation: String,
    emergencyContactPhone: String,
    bloodType: String,
    hasInsurance: String,
  },

  vitals: {
    height: Number,
    weight: Number,
    bmi: Number,
    bloodPressure: String,
    bloodSugar: Number
  },

  medicalHistory: {
    allergies: String,
    chronicDiseases: String,
    familyHistory: String,
    surgeries: String,
    pastDiagnoses: String,
    medications: String,
    lifestyleHabits: String, 
    reproductiveHealth: String,
  },

  prescriptions: [
    {
      date: Date,
      medication: String,
      dosage: String,
      instructions: String,
    }
  ],

  labResults: [
    {
      testName: String,
      result: String,
      date: Date,
    }
  ],

  documents: { type: [documentSchema], default: [] },

  // Departments
  departments: { type: [departmentSchema], default: [] },

  // ✅ New: Patients array for doctors
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Initialize default permissions for new users
userSchema.pre("save", function (next) {
  if (this.isNew && (!this.permissions || this.permissions.size === 0)) {
    const defaultPermissions = new Map();
    [
      "Demographics",
      "Vitals",
      "Medical History",
      "Documents",
      "Prescriptions",
      "Lab Results",
      "Allergies",
      "Audit Logs"
    ].forEach(section => {
      defaultPermissions.set(section, { 
        read: false, write: false, edit: false, delete: false,
        upload: false, export: false, share: false, approve: false
      });
    });
    this.permissions = defaultPermissions;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

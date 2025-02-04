// // models/newModel/auditLogModel.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: false },
  userType: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: false },
  userName: { type: String, required: false },
  ipAddress: { type: String, required: false }, 
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

const AuditLog = mongoose.model('AuditLog', logSchema);
module.exports = AuditLog;






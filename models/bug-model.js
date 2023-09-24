const mongoose = require('mongoose');
const {Schema, model} = require('mongoose');


const BugSchema = new Schema({
  domainId: { type: mongoose.Schema.Types.ObjectId, required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, required: true },
  xpath: { type: String},
  bugNumber: { type: Number},
  taskId: { type: String },
  taskKey: {type: String},
  summary: {type: String},
  environment: {type: String}
});

module.exports = model('Bug', BugSchema)
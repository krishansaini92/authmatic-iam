const mongoose = require('mongoose');
const softDeletePlugin = require('mongoose-delete');
const { Schema, model } = mongoose;

const Entity = new Schema(
  {
    key: { type: String, index: true }
  },
  { timestamps: true }
);

Entity.plugin(softDeletePlugin, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
});

module.exports = model('Entity', Entity);

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const todoSchema = new mongoose.Schema({
  text: String,
  done: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  userId: String,
});

todoSchema.statics.createTodo = function (text, user) {
  const todo = new this({ text, userId: user._id });
  return todo.save();
};

todoSchema.statics.findByUserId = function (userId) {
  return this.find({ userId, deleted: false });
};

todoSchema.statics.toggleTodo = async function (id, user) {
  const todo = await this.findById(id);
  console.log(todo, user);
  if (todo.userId === user._id) {
    todo.done = !todo.done;
  }
  return todo.save();
};

todoSchema.statics.deleteTodo = async function (id, user) {
  const todo = await this.findById(id);
  console.log(todo, user);
  if (todo.userId === user._id) {
    todo.deleted = true;
  }
  return todo.save();
};

module.exports = mongoose.model('Todo', todoSchema);

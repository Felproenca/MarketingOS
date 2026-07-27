'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, 'data', 'telegram');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

function emptyState() {
  return { version: 1, users: {}, tasks: [], evidence: [], updatedAt: null };
}

function read() {
  if (!fs.existsSync(STATE_FILE)) return emptyState();
  try {
    return { ...emptyState(), ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };
  } catch {
    return emptyState();
  }
}

function write(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  state.updatedAt = new Date().toISOString();
  const temp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(temp, STATE_FILE);
}

function userKey(userId) {
  return String(userId);
}

function getUser(userId) {
  return read().users[userKey(userId)] || { activeClient: null };
}

function setActiveClient(userId, client) {
  const state = read();
  const key = userKey(userId);
  state.users[key] = { ...(state.users[key] || {}), activeClient: client, updatedAt: new Date().toISOString() };
  write(state);
  return state.users[key];
}

function addTask({ client, text, source, createdBy }) {
  const state = read();
  const task = {
    id: `T${Date.now().toString(36).toUpperCase()}`,
    client,
    text,
    status: 'open',
    source,
    createdBy: String(createdBy),
    createdAt: new Date().toISOString(),
  };
  state.tasks.push(task);
  write(state);
  return task;
}

function listTasks(client, status = 'open') {
  return read().tasks.filter((task) => (!client || task.client === client) && (!status || task.status === status));
}

function completeTask(taskId, client) {
  const state = read();
  const task = state.tasks.find((item) =>
    item.id.toLowerCase() === String(taskId).toLowerCase() && (!client || item.client === client));
  if (!task) return null;
  task.status = 'done';
  task.completedAt = new Date().toISOString();
  write(state);
  return task;
}

function updateTask(taskId, patch) {
  const state = read();
  const task = state.tasks.find((item) => item.id.toLowerCase() === String(taskId).toLowerCase());
  if (!task) return null;
  Object.assign(task, patch, { updatedAt: new Date().toISOString() });
  write(state);
  return task;
}

function addEvidence({ client, text, createdBy }) {
  const state = read();
  const evidence = {
    id: `E${Date.now().toString(36).toUpperCase()}`,
    client,
    text,
    createdBy: String(createdBy),
    createdAt: new Date().toISOString(),
  };
  state.evidence.push(evidence);
  write(state);
  return evidence;
}

module.exports = { DATA_DIR, getUser, setActiveClient, addTask, listTasks, completeTask, updateTask, addEvidence };

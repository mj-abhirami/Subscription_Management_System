exports.money = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error("Amount must be a non-negative number");
  return Math.round((n + Number.EPSILON) * 100) / 100;
};
exports.makeNumber = (prefix) =>
  `${prefix}-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

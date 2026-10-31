const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");
const { makeNumber } = require("../utils/numbers");

const statuses = ["Draft","Quotation","Confirmed","Active","Paused","Closed"];

exports.list = async (req, res) => {
  const isCustomer = req.user.role === "customer";
  const values = isCustomer ? [req.user.id] : [];
  const where = isCustomer ? "WHERE s.customer_id=$1" : "";
  const result = await pool.query(
    `SELECT s.*, u.name AS customer_name, u.email AS customer_email,
            pl.name AS plan_name, pl.billing_cycle
     FROM subscriptions s JOIN users u ON u.id=s.customer_id
     JOIN plans pl ON pl.id=s.plan_id ${where}
     ORDER BY s.created_at DESC`, values
  );
  return ok(res, "Subscriptions retrieved", result.rows);
};

exports.create = async (req, res) => {
  const { customer_id, plan_id, start_date, expiry_date, quantity=1, unit_price, payment_terms } = req.body;
  const effectiveCustomerId = req.user.role === "customer" ? req.user.id : customer_id;
  if (!effectiveCustomerId || !plan_id || !start_date || unit_price === undefined) {
    return fail(res, "customer_id, plan_id, start_date and unit_price are required");
  }
  const result = await pool.query(
    `INSERT INTO subscriptions(subscription_number,customer_id,plan_id,start_date,expiry_date,
      quantity,unit_price,status,payment_terms)
     VALUES($1,$2,$3,$4,$5,$6,$7,'Draft',$8) RETURNING *`,
    [makeNumber("SUB"),effectiveCustomerId,plan_id,start_date,expiry_date||null,quantity,unit_price,payment_terms||"Due on receipt"]
  );
  return ok(res, "Subscription created", result.rows[0], 201);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!statuses.includes(status)) return fail(res, "Invalid subscription status");
  const current = await pool.query("SELECT * FROM subscriptions WHERE id=$1", [req.params.id]);
  if (!current.rowCount) return fail(res, "Subscription not found", 404);
  if (req.user.role === "customer" && Number(current.rows[0].customer_id) !== Number(req.user.id)) {
    return fail(res, "You cannot update this subscription", 403);
  }
  const result = await pool.query(
    "UPDATE subscriptions SET status=$1 WHERE id=$2 RETURNING *", [status,req.params.id]
  );
  return ok(res, "Subscription status updated", result.rows[0]);
};

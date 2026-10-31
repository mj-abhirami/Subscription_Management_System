const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");

exports.list = async (req, res) => {
  const result = await pool.query(
    `SELECT pl.*, p.name AS product_name FROM plans pl
     JOIN products p ON p.id=pl.product_id ORDER BY pl.created_at DESC`
  );
  return ok(res, "Plans retrieved", result.rows);
};

exports.create = async (req, res) => {
  const { name, product_id, price, billing_cycle, min_quantity=1, start_date,
    end_date, allow_pause=true, allow_early_close=true, auto_close=false } = req.body;
  const cycles = ["Daily","Weekly","Monthly","Yearly"];
  if (!name || !product_id || price === undefined || !cycles.includes(billing_cycle)) {
    return fail(res, "name, product_id, price and valid billing_cycle are required");
  }
  const result = await pool.query(
    `INSERT INTO plans(name,product_id,price,billing_cycle,min_quantity,start_date,end_date,
      allow_pause,allow_early_close,auto_close)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [name,product_id,price,billing_cycle,min_quantity,start_date||null,end_date||null,
      allow_pause,allow_early_close,auto_close]
  );
  return ok(res, "Plan created", result.rows[0], 201);
};

exports.update = async (req, res) => {
  const fields = ["name","price","billing_cycle","min_quantity","start_date","end_date",
    "allow_pause","allow_early_close","auto_close"];
  const sets = [], values = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      sets.push(`${field}=$${values.length}`);
    }
  }
  if (!sets.length) return fail(res, "No editable fields supplied");
  values.push(req.params.id);
  const result = await pool.query(
    `UPDATE plans SET ${sets.join(",")} WHERE id=$${values.length} RETURNING *`, values
  );
  if (!result.rowCount) return fail(res, "Plan not found", 404);
  return ok(res, "Plan updated", result.rows[0]);
};

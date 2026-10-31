const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");

exports.list = async (_req, res) => {
  const result = await pool.query("SELECT * FROM discounts ORDER BY id DESC");
  return ok(res, "Discounts retrieved", result.rows);
};

exports.create = async (req, res) => {
  const { name, discount_type, discount_value, minimum_quantity=1, start_date,
    end_date, usage_limit, is_active=true } = req.body;
  if (!name || !["Percentage","Fixed"].includes(discount_type) || discount_value === undefined) {
    return fail(res, "name, valid discount_type and discount_value are required");
  }
  if (discount_type === "Percentage" && Number(discount_value)>100) {
    return fail(res, "Percentage discount cannot exceed 100");
  }
  const result = await pool.query(
    `INSERT INTO discounts(name,discount_type,discount_value,minimum_quantity,start_date,
      end_date,usage_limit,is_active)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [name,discount_type,discount_value,minimum_quantity,start_date||null,end_date||null,usage_limit||null,is_active]
  );
  return ok(res, "Discount created", result.rows[0], 201);
};

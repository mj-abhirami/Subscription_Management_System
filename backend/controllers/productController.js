const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");

exports.list = async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object(
      'id',v.id,'variant_name',v.variant_name,'additional_price',v.additional_price
    )) FILTER (WHERE v.id IS NOT NULL),'[]') AS variants
     FROM products p LEFT JOIN product_variants v ON v.product_id=p.id
     GROUP BY p.id ORDER BY p.created_at DESC`
  );
  return ok(res, "Products retrieved", result.rows);
};

exports.create = async (req, res) => {
  const { name, product_type, sales_price, cost_price, notes, variants = [] } = req.body;
  if (!name || sales_price === undefined) return fail(res, "name and sales_price are required");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const p = await client.query(
      `INSERT INTO products(name,product_type,sales_price,cost_price,notes)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [name, product_type || null, sales_price, cost_price || 0, notes || null]
    );
    for (const v of variants) {
      await client.query(
        "INSERT INTO product_variants(product_id,variant_name,additional_price) VALUES($1,$2,$3)",
        [p.rows[0].id, v.variant_name, v.additional_price || 0]
      );
    }
    await client.query("COMMIT");
    return ok(res, "Product created", p.rows[0], 201);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally { client.release(); }
};

exports.update = async (req, res) => {
  const { name, product_type, sales_price, cost_price, notes } = req.body;
  const result = await pool.query(
    `UPDATE products SET name=COALESCE($1,name), product_type=COALESCE($2,product_type),
     sales_price=COALESCE($3,sales_price), cost_price=COALESCE($4,cost_price),
     notes=COALESCE($5,notes) WHERE id=$6 RETURNING *`,
    [name ?? null, product_type ?? null, sales_price ?? null, cost_price ?? null, notes ?? null, req.params.id]
  );
  if (!result.rowCount) return fail(res, "Product not found", 404);
  return ok(res, "Product updated", result.rows[0]);
};

exports.remove = async (req, res) => {
  const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING id", [req.params.id]);
  if (!result.rowCount) return fail(res, "Product not found", 404);
  return ok(res, "Product deleted", { id: result.rows[0].id });
};

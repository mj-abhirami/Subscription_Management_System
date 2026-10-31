const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");
const { makeNumber } = require("../utils/numbers");

exports.list = async (req, res) => {
  const customerOnly = req.user.role === "customer";
  const values = customerOnly ? [req.user.id] : [];
  const where = customerOnly ? "WHERE i.customer_id=$1" : "";
  const result = await pool.query(
    `SELECT i.*,u.name AS customer_name FROM invoices i
     JOIN users u ON u.id=i.customer_id ${where} ORDER BY i.created_at DESC`, values
  );
  return ok(res, "Invoices retrieved", result.rows);
};

exports.generateDue = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const due = await client.query(
      `SELECT s.*, p.name AS product_name, pl.billing_cycle
       FROM subscriptions s JOIN plans pl ON pl.id=s.plan_id
       JOIN products p ON p.id=pl.product_id
       WHERE s.status='Active' AND s.start_date <= CURRENT_DATE
       AND (s.expiry_date IS NULL OR s.expiry_date >= CURRENT_DATE)
       AND NOT EXISTS (
         SELECT 1 FROM invoices i
         WHERE i.subscription_id=s.id
           AND i.billing_period_start = date_trunc('month', CURRENT_DATE)::date
       )
       FOR UPDATE OF s`
    );
    const created = [];
    for (const s of due.rows) {
      const subtotal = Number(s.unit_price) * Number(s.quantity);
      const taxRate = Number(req.body.tax_rate || 0);
      const tax = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + tax;
      const periodStart = new Date().toISOString().slice(0,10);
      const periodEnd = new Date(Date.now() + 30*86400000).toISOString().slice(0,10);
      const invoice = await client.query(
        `INSERT INTO invoices(invoice_number,subscription_id,customer_id,billing_period_start,
          billing_period_end,subtotal,tax_amount,total_amount,due_date,status)
         VALUES($1,$2,$3,date_trunc('month',CURRENT_DATE)::date,
          (date_trunc('month',CURRENT_DATE)+interval '1 month - 1 day')::date,
          $4,$5,$6,CURRENT_DATE+7,'Confirmed')
         ON CONFLICT(subscription_id,billing_period_start) DO NOTHING RETURNING *`,
        [makeNumber("INV"),s.id,s.customer_id,subtotal,tax,total]
      );
      if (invoice.rowCount) {
        await client.query(
          `INSERT INTO invoice_items(invoice_id,product_name,quantity,unit_price,tax_rate,line_total)
           VALUES($1,$2,$3,$4,$5,$6)`,
          [invoice.rows[0].id,s.product_name,s.quantity,s.unit_price,taxRate,total]
        );
        created.push(invoice.rows[0]);
      }
    }
    await client.query("COMMIT");
    return ok(res, "Due invoices generated", { count: created.length, invoices: created });
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally { client.release(); }
};

exports.createManual = async (req, res) => {
  const { customer_id, subscription_id=null, billing_period_start, billing_period_end,
    subtotal, discount_amount=0, tax_amount=0, due_date, items=[] } = req.body;
  const effectiveCustomerId = req.user.role === "customer" ? req.user.id : customer_id;
  if (!effectiveCustomerId || !billing_period_start || !billing_period_end || subtotal === undefined || !due_date) {
    return fail(res, "customer_id, billing period, subtotal and due_date are required");
  }
  const total = Math.max(0, Number(subtotal)-Number(discount_amount)+Number(tax_amount));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inv = await client.query(
      `INSERT INTO invoices(invoice_number,subscription_id,customer_id,billing_period_start,
       billing_period_end,subtotal,discount_amount,tax_amount,total_amount,due_date,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Confirmed') RETURNING *`,
      [makeNumber("INV"),subscription_id,effectiveCustomerId,billing_period_start,billing_period_end,
       subtotal,discount_amount,tax_amount,total,due_date]
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items(invoice_id,product_name,quantity,unit_price,tax_rate,line_total)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [inv.rows[0].id,item.product_name,item.quantity,item.unit_price,item.tax_rate||0,item.line_total]
      );
    }
    await client.query("COMMIT");
    return ok(res, "Invoice created", inv.rows[0], 201);
  } catch (e) {
    await client.query("ROLLBACK"); throw e;
  } finally { client.release(); }
};

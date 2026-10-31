const pool = require("../config/db");
const { ok, fail } = require("../utils/responses");

exports.list = async (req, res) => {
  const customerOnly = req.user.role === "customer";
  const values = customerOnly ? [req.user.id] : [];
  const where = customerOnly ? "WHERE pay.customer_id=$1" : "";
  const result = await pool.query(
    `SELECT pay.*, i.invoice_number FROM payments pay
     JOIN invoices i ON i.id=pay.invoice_id ${where}
     ORDER BY pay.payment_date DESC`, values
  );
  return ok(res, "Payments retrieved", result.rows);
};

exports.create = async (req, res) => {
  const { invoice_id, amount, payment_method, payment_date, note } = req.body;
  const methods = ["UPI","Card","Cash","Bank Transfer"];
  if (!invoice_id || !amount || Number(amount)<=0 || !methods.includes(payment_method)) {
    return fail(res, "invoice_id, positive amount and valid payment_method are required");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inv = await client.query("SELECT * FROM invoices WHERE id=$1 FOR UPDATE", [invoice_id]);
    if (!inv.rowCount) { await client.query("ROLLBACK"); return fail(res, "Invoice not found", 404); }
    const invoice = inv.rows[0];
    if (req.user.role === "customer" && Number(invoice.customer_id) !== Number(req.user.id)) {
      await client.query("ROLLBACK"); return fail(res, "You cannot pay this invoice", 403);
    }
    const remaining = Number(invoice.total_amount)-Number(invoice.amount_paid);
    if (Number(amount)>remaining) {
      await client.query("ROLLBACK"); return fail(res, `Payment exceeds outstanding balance of ${remaining.toFixed(2)}`);
    }
    const payment = await client.query(
      `INSERT INTO payments(invoice_id,customer_id,amount,payment_method,payment_date,note)
       VALUES($1,$2,$3,$4,COALESCE($5,NOW()),$6) RETURNING *`,
      [invoice_id,invoice.customer_id,amount,payment_method,payment_date||null,note||null]
    );
    const newPaid = Number(invoice.amount_paid)+Number(amount);
    const newStatus = newPaid >= Number(invoice.total_amount) ? "Paid" : "Partially Paid";
    await client.query("UPDATE invoices SET amount_paid=$1,status=$2 WHERE id=$3",
      [newPaid,newStatus,invoice_id]);
    await client.query("COMMIT");
    return ok(res, "Payment recorded", { payment: payment.rows[0], amount_paid: newPaid, invoice_status: newStatus }, 201);
  } catch (e) {
    await client.query("ROLLBACK"); throw e;
  } finally { client.release(); }
};

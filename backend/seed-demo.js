
require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function seedDemoData() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. CREATE DEMO CUSTOMERS
        const passwordHash = await bcrypt.hash("DemoCustomer123", 12);

        const customers = [
            ["Rahul Sharma", "rahul.demo@subsight.com", "9876543210"],
            ["Priya Nair", "priya.demo@subsight.com", "9876543211"],
            ["Arjun Menon", "arjun.demo@subsight.com", "9876543212"],
            ["Sneha Thomas", "sneha.demo@subsight.com", "9876543213"]
        ];

        for (const [name, email, phone] of customers) {
            await client.query(
                `INSERT INTO users (name,email,password_hash,role,phone)
         VALUES ($1,$2,$3,'customer',$4)
         ON CONFLICT (email) DO NOTHING`,
                [name, email, passwordHash, phone]
            );
        }

        // 2. CREATE PRODUCTS
        const products = [
            ["Starter Cloud", "Service", 999, 400],
            ["Business Cloud", "Service", 2499, 1000],
            ["Enterprise Suite", "Software", 5999, 2500],
            ["Premium Support", "Service", 1499, 500]
        ];

        for (const [name, type, sales, cost] of products) {
            await client.query(
                `INSERT INTO products (name,product_type,sales_price,cost_price,notes)
   SELECT $1::varchar,$2,$3,$4,'SUBSIGHT demo product'
   WHERE NOT EXISTS (
     SELECT 1 FROM products WHERE name=$1::varchar
   )`,
                [name, type, sales, cost]
            );
        }

        // 3. CREATE PLANS
        // 3. CREATE PLANS
        const plans = [
            ["Starter Monthly", "Starter Cloud", 999, "Monthly"],
            ["Business Monthly", "Business Cloud", 2499, "Monthly"],
            ["Enterprise Yearly", "Enterprise Suite", 59999, "Yearly"],
            ["Support Monthly", "Premium Support", 1499, "Monthly"]
        ];

        for (const [name, productName, price, cycle] of plans) {
            await client.query(
                `INSERT INTO plans
         (name, product_id, price, billing_cycle, min_quantity)
         SELECT $1::varchar, p.id, $3, $4::varchar, 1
         FROM products p
         WHERE p.name = $2::varchar
         AND NOT EXISTS (
             SELECT 1 FROM plans pl
             WHERE pl.name = $1::varchar
         )`,
                [name, productName, price, cycle]
            );
        }

        // 4. CREATE SUBSCRIPTIONS
        const subscriptions = [
            ["SUB-DEMO-001", "rahul.demo@subsight.com", "Starter Monthly", "Active", 999, "2026-07-01", "2026-11-30"],
            ["SUB-DEMO-002", "priya.demo@subsight.com", "Business Monthly", "Active", 2499, "2026-08-01", "2026-11-15"],
            ["SUB-DEMO-003", "arjun.demo@subsight.com", "Enterprise Yearly", "Active", 59999, "2026-01-01", "2027-01-01"],
            ["SUB-DEMO-004", "sneha.demo@subsight.com", "Support Monthly", "Paused", 1499, "2026-06-01", "2026-12-01"],
            ["SUB-DEMO-005", "rahul.demo@subsight.com", "Business Monthly", "Closed", 2499, "2026-01-01", "2026-09-01"]
        ];

        for (const [number, email, plan, status, price, start, expiry] of subscriptions) {
            await client.query(
                `INSERT INTO subscriptions
         (subscription_number,customer_id,plan_id,start_date,expiry_date,quantity,unit_price,status)
         SELECT $1,u.id,p.id,$6,$7,1,$5,$4
         FROM users u, plans p
         WHERE u.email=$2 AND p.name=$3
         ON CONFLICT (subscription_number) DO NOTHING`,
                [number, email, plan, status, price, start, expiry]
            );
        }

        // 5. CREATE INVOICES
        const invoices = [
            ["INV-DEMO-001", "SUB-DEMO-001", "rahul.demo@subsight.com", 999, 999, "Paid", "2026-10-01", "2026-10-31", "2026-10-10"],
            ["INV-DEMO-002", "SUB-DEMO-002", "priya.demo@subsight.com", 2499, 1000, "Partially Paid", "2026-10-01", "2026-10-31", "2026-10-15"],
            ["INV-DEMO-003", "SUB-DEMO-003", "arjun.demo@subsight.com", 59999, 0, "Overdue", "2026-09-01", "2026-09-30", "2026-10-05"],
            ["INV-DEMO-004", "SUB-DEMO-004", "sneha.demo@subsight.com", 1499, 0, "Confirmed", "2026-10-01", "2026-10-31", "2026-11-10"]
        ];

        for (const [number, subNumber, email, total, paid, status, start, end, due] of invoices) {
            await client.query(
                `INSERT INTO invoices
         (invoice_number,subscription_id,customer_id,
          billing_period_start,billing_period_end,
          subtotal,total_amount,amount_paid,due_date,status)
         SELECT $1,s.id,u.id,$7,$8,$4,$4,$5,$9,$6
         FROM subscriptions s, users u
         WHERE s.subscription_number=$2 AND u.email=$3
         ON CONFLICT (invoice_number) DO NOTHING`,
                [number, subNumber, email, total, paid, status, start, end, due]
            );
        }

        // 6. CREATE PAYMENTS
        const payments = [
            ["INV-DEMO-001", "rahul.demo@subsight.com", 999, "UPI"],
            ["INV-DEMO-002", "priya.demo@subsight.com", 1000, "Card"]
        ];

        for (const [invoice, email, amount, method] of payments) {
            await client.query(
                `INSERT INTO payments (invoice_id,customer_id,amount,payment_method,note)
         SELECT i.id,u.id,$3,$4,'SUBSIGHT demo payment'
         FROM invoices i, users u
         WHERE i.invoice_number=$1 AND u.email=$2
         AND NOT EXISTS (
           SELECT 1 FROM payments p
           WHERE p.invoice_id=i.id AND p.note='SUBSIGHT demo payment'
         )`,
                [invoice, email, amount, method]
            );
        }

        await client.query("COMMIT");

        console.log("SUCCESS! SUBSIGHT demo data inserted.");
        console.log("Customers: 4");
        console.log("Products: 4");
        console.log("Plans: 4");
        console.log("Subscriptions: 5");
        console.log("Invoices: 4");
        console.log("Payments: 2");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", error);
    } finally {
        client.release();
        await pool.end();
    }
}

seedDemoData();

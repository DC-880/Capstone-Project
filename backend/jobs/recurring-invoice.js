require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const generateRecurringInvoices = async () => {
  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });

    // Find recurring invoices that are due on the current date.
    // Using CURDATE() ensures we only process invoices due today.
    const [dueInvoices] = await db.execute(`
      SELECT * FROM invoices 
      WHERE is_recurring = TRUE AND due_date = CURDATE()
    `);

    if (dueInvoices.length === 0) {
      console.log('No recurring invoices due today.');
      return;
    }

    console.log(`Found ${dueInvoices.length} recurring invoice(s) to generate.`);

    for (const invoice of dueInvoices) {
      // Calculate the new due date for one month later
      const newDueDate = new Date(invoice.due_date);
      newDueDate.setMonth(newDueDate.getMonth() + 1);
      const newDueDateString = newDueDate.toISOString().split('T')[0];

      // Create the new identical invoice with the future due date
      await db.execute(
        `INSERT INTO invoices (client_id, amount, message, due_date, is_recurring) VALUES (?, ?, ?, ?, ?)`,
        [
          invoice.client_id,
          invoice.amount,
          invoice.message,
          newDueDateString, // Use the new, future due date
          invoice.is_recurring,
        ]
      );

      console.log(`Generated new recurring invoice for client ID ${invoice.client_id} from original invoice ID ${invoice.id}. New due date: ${newDueDateString}`);
    }
  } catch (error) {
    console.error('Error in recurring-invoice job:', error);
  } finally {
    if (db) await db.end();
  }
};

// This function is called when the worker thread is started by Bree.
generateRecurringInvoices();
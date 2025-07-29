require('dotenv').config();
const express = require('express');
const connection = require('./connection');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { Resend } = require('resend');
const cron = require('node-cron');



// console.log('env test:', process.env.HOST);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));




//////////////GENERATE NEW INVOICE AUTOMATICALLY/////////////////

cron.schedule('0 12 1 * *', async () => {
  console.log('Running recurring invoice task...');


  const [invoices] = await connection.execute(
    `SELECT * FROM invoices WHERE is_recurring = TRUE`
  );

  for (const invoice of invoices) {
    await connection.execute(`
      INSERT INTO invoices (client_id, amount, message, due_date, is_recurring)
      VALUES (?, ?, ?, ?) `, [
      invoice.client_id,
      invoice.amount,
      invoice.message,
      invoice.due_date,
      invoice.is_recurring,
    ]
    );

    console.log(`Generated recurring invoice from invoice ${invoice.id}`);
  }

});


///////////AUTOMATIC REMINDER EMAIL//////////////

cron.schedule('0 12 20 * *', async () => {
  console.log('Running reminder email job...');

  try {

    const [rows] = await connection.query(`
  SELECT 
    invoices.id, 
    invoices.amount, 
    clients.email AS client_email
  FROM 
    invoices
  INNER JOIN 
    clients ON invoices.client_id = clients.client_id
  WHERE 
    invoices.received = 0
`);

    for (const invoice of rows) {
      const { amount, client_email } = invoice;

      await resend.emails.send({
        from: `Christakos Law <${emailSend}>`,
        to: client_email,
        subject: 'Retainer Installment Reminder',
        html: `Hello,<br><br>This is a reminder that Christakos Law is requesting the retainer installment for this month.<br><br>
               <strong>Amount:</strong> $${amount} <br>
               <strong>Due By:</strong> End of the current month <br>
               <strong>Send via Interac E-Transfer To:</strong> ${emailSend} <br><br>
               Thank you!<br>Christakos Law`,
      });

      console.log(`Reminder sent to ${client_email}`);
    }

  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});



//////////////FOR SIGNING IN//////////////////////////

const SECRET_KEY = process.env.SECRET_KEY;

app.post('/sign-in', async (req, res) => {

  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(401).json('Please Provide Username and Password');
  }
  try {
    const [data] = await connection.promise().query(`SELECT username, password FROM capstone.admin WHERE username = ?`, [username]);
    ;
    if (data.length > 0) {
      const passResult = await bcrypt.compare(password, data[0].password)
      if (passResult) {
        const token = await jwt.sign({ id: data[0].id }, SECRET_KEY, { expiresIn: '1hr' });
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 3600000
        });
        res.status(200).json({ message: 'Login Successful', token: token })
      } else {
        res.status(401).json("Login Failed");
      }

    }
    else { res.json("Incorrect Credentials"); }

  } catch (error) {
    res.json(error);
  }
})





/////////////////AUTHENTICATION CHECK////////////////

function authenticateToken(req, res, next) {

  const token = req.cookies.token;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

app.get('/auth-status', authenticateToken, (req, res) => {
  res.status(200).json({ isAuthenticated: true, username: req.user.username });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'Logged out' });
});







//////////FOR ADDING CLIENTS/////////////////

app.post('/clients/add', authenticateToken, async (req, res) => {
  const { name, email, phone_number, service } = req.body;

  if (!name || !email || !phone_number || !service) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = 'INSERT INTO capstone.clients (name, email, phone_number, service) VALUES (?, ?, ?, ?)';
    const [results] = await connection.promise().query(sql, [name, email, phone_number, service]);
    res.status(201).json({ message: 'Client Added', clientId: results.insertId });
  } catch (err) {
    console.error('Error inserting client:', err);
    res.status(500).json({ message: 'Database error' });
  }
});





//////////FOR ADDING ADMIN/////////////////

app.post('/admin/add', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  try {
    const [data] = await connection.promise().query('INSERT INTO capstone.admin (username, password) VALUES (?, ?)', [username, hashedPass]);
    if (data && data.affectedRows > 0) res.json("Record added successfully");
    else res.json("Unable to add the customer");

  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



///////////INVOICE SUBMISSION + ACCOMPANYING EMAIL////////////

const emailSend = process.env.EMAIL_SEND;
const emailReceive = process.env.EMAIL_RECEIVE;
const emailTransfer =  process.env.EMAIL_TRANSFER;


const resend = new Resend(process.env.RESEND_KEY);


app.post('/invoice/submit', authenticateToken, async (req, res) => {
  const { client_id, amount, message, dueDate, is_recurring } = req.body;


  if (!client_id || amount == null || !dueDate) {
    return res.status(400).json({ message: 'Client, amount, and due date are required.' });
  }

  try {
    const sql = 'INSERT INTO capstone.invoices (client_id, amount, message, due_date, is_recurring) VALUES (?, ?, ?, ?, ?)';
    const [result] = await connection.promise().query(sql, [client_id, amount, message, dueDate, is_recurring]);


    try {
      const { data, error } = await resend.emails.send({
        from: `Christakos Law <${emailSend}>`,
        to: [emailReceive],
        subject: "Monthly Retainer Notification",
        html: `Hello,<br><br> Christakos Law is requesting the retainer installment for this month. 
        The details can be found below: <br><br> Amount: ${amount} <br> Due By: The end of the current month <br> 
        Send via Interac E-Transfer To: ${emailTransfer} <br><br> Thank you! <br> Christakos Law`,
      });

      if (error) {

        console.error('Resend email error:', error);
      }
    } catch (emailError) {
      console.error('Exception while sending email:', emailError);
    }


    res.status(201).json({ message: 'Invoice created successfully', invoiceId: result.insertId });

  } catch (error) {
    console.error('Error submitting invoice:', error);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ message: 'Client not found. Invalid client_id.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/dropdown-clients', authenticateToken, async (req, res) => {
  try {
    const [clients] = await connection.promise().query('SELECT client_id AS id, name FROM capstone.clients');
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Database error' });
  }
});



///////////FOR TRACKING TABLE//////////////

app.get('/tracking', authenticateToken, async (req, res) => {
  try {
    const [clients] = await connection.promise().query('SELECT * FROM capstone.invoices');
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Database error' });
  }
});


app.patch('/tracking/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    await connection.promise().query('UPDATE invoices SET received = 1 WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (error) {
    console.log('Unable to update:', error)
  }

});


app.patch('/update-status/:id', async (req, res) => {
  const { id }  = req.params;
  const { status } = req.body;

  try {
    await db.execute(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [status, id]
    );
    res.status(200).json({ message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update failed' });
  }
});
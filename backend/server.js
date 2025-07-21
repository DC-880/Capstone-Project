require('dotenv').config();
const express = require('express');
const connection = require('./connection');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

// console.log('env test:', process.env.HOST);

app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200',   // Your Angular frontend
  credentials: true                  // 🔐 Allow cookies
}));


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});




//////////////FOR SIGNING IN//////////////////////////

////STEP 1, CHECK USERNAME AND PASSWORD



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

////STEP 2, TOKEN AUTHENTICATION, PROTECT API ROUTES

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
  // If the authenticateToken middleware passes, it means the token is valid
  // and the user is authenticated.
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
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sql = 'INSERT INTO capstone.clients (name, service) VALUES (?, ?)';
    const [results] = await connection.promise().query(sql, [name, age]);
    res.status(201).json({ message: 'Account created', clientId: results.insertId });
  } catch (err) {
    console.error('Error inserting client:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


app.get('/dropdown-clients', authenticateToken, async (req, res) => {
  try {
    // Alias `client_id` as `id` to match the frontend's `Client` interface
    const [clients] = await connection.promise().query('SELECT client_id AS id, name FROM capstone.clients');
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
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



///////////INVOICE SUBMISSION////////////


app.post('/invoice/submit', authenticateToken, async (req, res) => {
  const { client_id, amount, message, dueDate } = req.body;

  // Basic validation
  if (!client_id || amount == null || !dueDate) {
    return res.status(400).json({ message: 'Client, amount, and due date are required.' });
  }

  try {
    const sql = 'INSERT INTO capstone.invoices (client_id, amount, message, due_date) VALUES (?, ?, ?, ?)';
    const [result] = await connection.promise().query(sql, [client_id, amount, message, dueDate]);

    res.status(201).json({ message: 'Invoice created successfully', invoiceId: result.insertId });
  } catch (error) {
    console.error('Error submitting invoice:', error);
    // Check for foreign key constraint failure
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'Client not found. Invalid client_id.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
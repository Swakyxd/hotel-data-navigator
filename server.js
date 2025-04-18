
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Update with your MySQL password
  database: 'hotel_reservation'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Routes

// Customer Routes
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM Customer', (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    res.json(results);
  });
});

app.post('/api/customers', (req, res) => {
  const { Name, Email, Country } = req.body;
  db.query('INSERT INTO Customer (Name, Email, Country) VALUES (?, ?, ?)', 
    [Name, Email, Country], 
    (err, results) => {
      if (err) {
        console.error('Error adding customer:', err);
        return res.status(500).json({ error: 'Failed to add customer' });
      }
      res.status(201).json({ id: results.insertId, message: 'Customer added successfully' });
    }
  );
});

app.put('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  const { Name, Email, Country } = req.body;
  db.query('UPDATE Customer SET Name = ?, Email = ?, Country = ? WHERE Customer_Id = ?', 
    [Name, Email, Country, id], 
    (err) => {
      if (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: 'Failed to update customer' });
      }
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

app.delete('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Customer WHERE Customer_Id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return res.status(500).json({ error: 'Failed to delete customer. This customer may have reservations.' });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});

// Hotel Routes
app.get('/api/hotels', (req, res) => {
  db.query('SELECT * FROM Hotel', (err, results) => {
    if (err) {
      console.error('Error fetching hotels:', err);
      return res.status(500).json({ error: 'Failed to fetch hotels' });
    }
    res.json(results);
  });
});

app.post('/api/hotels', (req, res) => {
  const { Name, Location } = req.body;
  db.query('INSERT INTO Hotel (Name, Location) VALUES (?, ?)', 
    [Name, Location], 
    (err, results) => {
      if (err) {
        console.error('Error adding hotel:', err);
        return res.status(500).json({ error: 'Failed to add hotel' });
      }
      res.status(201).json({ id: results.insertId, message: 'Hotel added successfully' });
    }
  );
});

app.put('/api/hotels/:id', (req, res) => {
  const id = req.params.id;
  const { Name, Location } = req.body;
  db.query('UPDATE Hotel SET Name = ?, Location = ? WHERE Hotel_Id = ?', 
    [Name, Location, id], 
    (err) => {
      if (err) {
        console.error('Error updating hotel:', err);
        return res.status(500).json({ error: 'Failed to update hotel' });
      }
      res.json({ message: 'Hotel updated successfully' });
    }
  );
});

app.delete('/api/hotels/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Hotel WHERE Hotel_Id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting hotel:', err);
      return res.status(500).json({ error: 'Failed to delete hotel. This hotel may have rooms or reservations.' });
    }
    res.json({ message: 'Hotel deleted successfully' });
  });
});

// Room Category Routes
app.get('/api/room-categories', (req, res) => {
  db.query('SELECT * FROM Room_Category', (err, results) => {
    if (err) {
      console.error('Error fetching room categories:', err);
      return res.status(500).json({ error: 'Failed to fetch room categories' });
    }
    res.json(results);
  });
});

app.post('/api/room-categories', (req, res) => {
  const { Type, Price } = req.body;
  db.query('INSERT INTO Room_Category (Type, Price) VALUES (?, ?)', 
    [Type, Price], 
    (err, results) => {
      if (err) {
        console.error('Error adding room category:', err);
        return res.status(500).json({ error: 'Failed to add room category' });
      }
      res.status(201).json({ id: results.insertId, message: 'Room category added successfully' });
    }
  );
});

app.put('/api/room-categories/:id', (req, res) => {
  const id = req.params.id;
  const { Type, Price } = req.body;
  db.query('UPDATE Room_Category SET Type = ?, Price = ? WHERE Category_Id = ?', 
    [Type, Price, id], 
    (err) => {
      if (err) {
        console.error('Error updating room category:', err);
        return res.status(500).json({ error: 'Failed to update room category' });
      }
      res.json({ message: 'Room category updated successfully' });
    }
  );
});

app.delete('/api/room-categories/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Room_Category WHERE Category_Id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting room category:', err);
      return res.status(500).json({ error: 'Failed to delete room category. This category may be in use.' });
    }
    res.json({ message: 'Room category deleted successfully' });
  });
});

// Rooms Routes
app.get('/api/rooms', (req, res) => {
  const query = `
    SELECT r.*, h.Name as HotelName, rc.Type as CategoryType 
    FROM Rooms r 
    JOIN Hotel h ON r.Hotel_Id = h.Hotel_Id
    JOIN Room_Category rc ON r.Category_Id = rc.Category_Id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      return res.status(500).json({ error: 'Failed to fetch rooms' });
    }
    res.json(results);
  });
});

app.post('/api/rooms', (req, res) => {
  const { Room_no, Status, Hotel_Id, Category_Id } = req.body;
  db.query('INSERT INTO Rooms (Room_no, Status, Hotel_Id, Category_Id) VALUES (?, ?, ?, ?)', 
    [Room_no, Status, Hotel_Id, Category_Id], 
    (err, results) => {
      if (err) {
        console.error('Error adding room:', err);
        return res.status(500).json({ error: 'Failed to add room' });
      }
      res.status(201).json({ id: results.insertId, message: 'Room added successfully' });
    }
  );
});

app.put('/api/rooms/:id', (req, res) => {
  const id = req.params.id;
  const { Room_no, Status, Hotel_Id, Category_Id } = req.body;
  db.query('UPDATE Rooms SET Room_no = ?, Status = ?, Hotel_Id = ?, Category_Id = ? WHERE Room_Id = ?', 
    [Room_no, Status, Hotel_Id, Category_Id, id], 
    (err) => {
      if (err) {
        console.error('Error updating room:', err);
        return res.status(500).json({ error: 'Failed to update room' });
      }
      res.json({ message: 'Room updated successfully' });
    }
  );
});

app.delete('/api/rooms/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Rooms WHERE Room_Id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting room:', err);
      return res.status(500).json({ error: 'Failed to delete room' });
    }
    res.json({ message: 'Room deleted successfully' });
  });
});

// Reservation Routes
app.get('/api/reservations', (req, res) => {
  const query = `
    SELECT r.*, c.Name as CustomerName, h.Name as HotelName
    FROM Reservation r 
    JOIN Customer c ON r.Customer_Id = c.Customer_Id
    JOIN Hotel h ON r.Hotel_Id = h.Hotel_Id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reservations:', err);
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
    res.json(results);
  });
});

app.post('/api/reservations', (req, res) => {
  const { Start_Date, End_Date, Period, Customer_Id, Hotel_Id } = req.body;
  
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Transaction error' });
    }

    db.query('INSERT INTO Reservation (Start_Date, End_Date, Period, Customer_Id, Hotel_Id) VALUES (?, ?, ?, ?, ?)', 
      [Start_Date, End_Date, Period, Customer_Id, Hotel_Id], 
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error adding reservation:', err);
            res.status(500).json({ error: 'Failed to add reservation' });
          });
        }
        
        const reservationId = results.insertId;
        
        // If there are room categories to link (would come from req.body.categories)
        if (req.body.categories && req.body.categories.length > 0) {
          let completed = 0;
          
          req.body.categories.forEach(categoryId => {
            db.query('INSERT INTO Reservation_RoomCategory (Reservation_Id, Category_Id) VALUES (?, ?)',
              [reservationId, categoryId],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error linking room category:', err);
                    res.status(500).json({ error: 'Failed to link room category' });
                  });
                }
                
                completed++;
                if (completed === req.body.categories.length) {
                  db.commit(err => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ error: 'Transaction commit failed' });
                      });
                    }
                    res.status(201).json({ 
                      id: reservationId, 
                      message: 'Reservation added successfully' 
                    });
                  });
                }
              }
            );
          });
        } else {
          // If no categories to link, just commit the transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({ error: 'Transaction commit failed' });
              });
            }
            res.status(201).json({ 
              id: reservationId, 
              message: 'Reservation added successfully' 
            });
          });
        }
      }
    );
  });
});

app.put('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  const { Start_Date, End_Date, Period, Customer_Id, Hotel_Id } = req.body;
  
  db.query('UPDATE Reservation SET Start_Date = ?, End_Date = ?, Period = ?, Customer_Id = ?, Hotel_Id = ? WHERE Reservation_Id = ?', 
    [Start_Date, End_Date, Period, Customer_Id, Hotel_Id, id], 
    (err) => {
      if (err) {
        console.error('Error updating reservation:', err);
        return res.status(500).json({ error: 'Failed to update reservation' });
      }
      res.json({ message: 'Reservation updated successfully' });
    }
  );
});

app.delete('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Transaction error' });
    }

    // First delete linked room categories
    db.query('DELETE FROM Reservation_RoomCategory WHERE Reservation_Id = ?', [id], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error deleting reservation room categories:', err);
          res.status(500).json({ error: 'Failed to delete reservation' });
        });
      }

      // Then delete the reservation
      db.query('DELETE FROM Reservation WHERE Reservation_Id = ?', [id], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error deleting reservation:', err);
            res.status(500).json({ error: 'Failed to delete reservation' });
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Transaction commit failed' });
            });
          }
          res.json({ message: 'Reservation deleted successfully' });
        });
      });
    });
  });
});

// Invoice Routes
app.get('/api/invoices', (req, res) => {
  const query = `
    SELECT i.*, c.Name as CustomerName
    FROM Invoice i
    JOIN Customer c ON i.Customer_Id = c.Customer_Id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
    res.json(results);
  });
});

app.post('/api/invoices', (req, res) => {
  const { Invoice_Description, Amount, Status, Customer_Id } = req.body;
  db.query('INSERT INTO Invoice (Invoice_Description, Amount, Status, Customer_Id) VALUES (?, ?, ?, ?)', 
    [Invoice_Description, Amount, Status, Customer_Id], 
    (err, results) => {
      if (err) {
        console.error('Error adding invoice:', err);
        return res.status(500).json({ error: 'Failed to add invoice' });
      }
      res.status(201).json({ id: results.insertId, message: 'Invoice added successfully' });
    }
  );
});

app.put('/api/invoices/:id', (req, res) => {
  const id = req.params.id;
  const { Invoice_Description, Amount, Status, Customer_Id } = req.body;
  db.query('UPDATE Invoice SET Invoice_Description = ?, Amount = ?, Status = ?, Customer_Id = ? WHERE Invoice_Id = ?', 
    [Invoice_Description, Amount, Status, Customer_Id, id], 
    (err) => {
      if (err) {
        console.error('Error updating invoice:', err);
        return res.status(500).json({ error: 'Failed to update invoice' });
      }
      res.json({ message: 'Invoice updated successfully' });
    }
  );
});

app.delete('/api/invoices/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Invoice WHERE Invoice_Id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting invoice:', err);
      return res.status(500).json({ error: 'Failed to delete invoice' });
    }
    res.json({ message: 'Invoice deleted successfully' });
  });
});

// Reservation_RoomCategory Routes (bridge table)
app.get('/api/reservation-room-categories', (req, res) => {
  const query = `
    SELECT rrc.Reservation_Id, rrc.Category_Id, 
           rc.Type as CategoryType, r.Start_Date, r.End_Date,
           c.Name as CustomerName
    FROM Reservation_RoomCategory rrc
    JOIN Room_Category rc ON rrc.Category_Id = rc.Category_Id
    JOIN Reservation r ON rrc.Reservation_Id = r.Reservation_Id
    JOIN Customer c ON r.Customer_Id = c.Customer_Id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reservation room categories:', err);
      return res.status(500).json({ error: 'Failed to fetch reservation room categories' });
    }
    res.json(results);
  });
});

// Get room categories for a specific reservation
app.get('/api/reservations/:id/categories', (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT rc.* FROM Room_Category rc
    JOIN Reservation_RoomCategory rrc ON rc.Category_Id = rrc.Category_Id
    WHERE rrc.Reservation_Id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching reservation categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(results);
  });
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

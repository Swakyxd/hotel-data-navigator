
# Hotel Data Navigator

A database frontend system for hotel reservation management.

## Database Schema

```sql
CREATE DATABASE IF NOT EXISTS hotel_reservation;
USE hotel_reservation;

-- Customer Table
CREATE TABLE Customer (
    Customer_Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Country VARCHAR(50)
);

-- Hotel Table
CREATE TABLE Hotel (
    Hotel_Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    Location VARCHAR(100)
);

-- Room Category Table
CREATE TABLE Room_Category (
    Category_Id INT AUTO_INCREMENT PRIMARY KEY,
    Type VARCHAR(50),
    Price DECIMAL(10, 2)
);

-- Rooms Table
CREATE TABLE Rooms (
    Room_Id INT AUTO_INCREMENT PRIMARY KEY,
    Room_no VARCHAR(10),
    Status VARCHAR(20),
    Hotel_Id INT,
    Category_Id INT,
    FOREIGN KEY (Hotel_Id) REFERENCES Hotel(Hotel_Id),
    FOREIGN KEY (Category_Id) REFERENCES Room_Category(Category_Id)
);

-- Reservation Table
CREATE TABLE Reservation (
    Reservation_Id INT AUTO_INCREMENT PRIMARY KEY,
    Start_Date DATE,
    End_Date DATE,
    Period INT,
    Customer_Id INT,
    Hotel_Id INT,
    FOREIGN KEY (Customer_Id) REFERENCES Customer(Customer_Id),
    FOREIGN KEY (Hotel_Id) REFERENCES Hotel(Hotel_Id)
);

-- Reservation ↔ Room Category (Many-to-Many via bridge table)
CREATE TABLE Reservation_RoomCategory (
    Reservation_Id INT,
    Category_Id INT,
    PRIMARY KEY (Reservation_Id, Category_Id),
    FOREIGN KEY (Reservation_Id) REFERENCES Reservation(Reservation_Id),
    FOREIGN KEY (Category_Id) REFERENCES Room_Category(Category_Id)
);

-- Invoice Table
CREATE TABLE Invoice (
    Invoice_Id INT AUTO_INCREMENT PRIMARY KEY,
    Invoice_Description TEXT,
    Amount DECIMAL(10, 2),
    Status VARCHAR(20),
    Customer_Id INT,
    FOREIGN KEY (Customer_Id) REFERENCES Customer(Customer_Id)
);
```

## Setup Instructions

1. Clone this repository
2. Install the dependencies:
   ```
   npm install
   ```
3. Set up your MySQL database:
   - Create a MySQL database
   - Run the SQL schema script provided above
   - Update the database connection settings in `server.js`

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Features

- Complete CRUD operations for all database tables
- Dashboard with summary statistics
- Clean, responsive user interface
- Relational data management
- Form validation
- Confirmation dialogs for destructive operations
- Success/error notifications

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Usage Guide

- Use the sidebar to navigate between different data tables
- Click "Add" buttons to create new records
- Use the "Edit" and "Delete" buttons for each record to modify or remove data
- Forms include validation to ensure data integrity

## License

MIT

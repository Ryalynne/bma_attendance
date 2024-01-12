
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

//DATABASE CONNECTION

const app = express();
const dbPath = 'C:/Users/PC/Documents/electron-project/database.db'; // Absolute path to the SQLite database
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.use(cors());
app.use(express.json());


// DISPLAY ATTENDANCE

app.get('/api/employee-account', (req, res) => {
    db.all('SELECT * FROM Employee_account', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/student-account', (req, res) => {
    db.all('SELECT * FROM Student_account', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});



app.get('/api/employee-attendance', (req, res) => {
    db.all('SELECT * FROM Employee_attendance', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});


app.get('/api/student-attendance', (req, res) => {
    db.all('SELECT * FROM Student_attendance', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});



// INSERT ATTENDANCE



// app.post('/api/insert-attendance', (req, res) => {
//     const { QRCODE, TIME } = req.body;
//     // STUDENT OR EMPLOYEE
//     let id = "";
//     db.run('select from Employee_account where email = , [QRCODE]' get the id)
//     db.run('select from Student_account where username = , [QRCODE]' get the id)

//     if (id == 'email') {
//         db.run('INSERT INTO Employee-attendance (Employee_id, Time_in) VALUES (?, ?)', [id, TIME], function (err) {
//             if (err) {
//                 res.status(500).send(err.message);
//             } else {
//                 res.send('Data inserted successfully');
//             }
//         });
//     }
//     else if (id == "username") {
//         db.run('INSERT INTO Student-attendance (Student_id, Time_in) VALUES (?, ?)', [id, TIME], function (err) {
//             if (err) {
//                 res.status(500).send(err.message);
//             } else {
//                 res.send('Data inserted successfully');
//             }
//         });
//     }
// });

app.post('/api/insert-attendance', (req, res) => {
    const { QRCODE, TIME } = req.body;

    const handleError = (errorMessage) => {
        res.status(500).send(errorMessage);
    };

    db.get('SELECT * FROM Employee_account WHERE email = ?', [QRCODE], (err, employeeRow) => {

        if (err) {
            return handleError(err.message);
        }

        if (employeeRow) {
            const employeeId = employeeRow.id;
            const currentDate = new Date().toISOString().slice(0, 10); // This will get the date in YYYY-MM-DD format
            db.get('SELECT * FROM Employee_attendance WHERE Time_out is null AND Employee_id = ? AND Time_in LIKE ?  ', [employeeId, currentDate + '%'], (err, employeeAttendance) => {
                if (err) {
                    return handleError(err.message);
                }

                if (employeeAttendance) {
                    const attendanceId = employeeAttendance.id;
                    // Update time_out for existing attendance
                    db.run('UPDATE Employee_attendance SET Time_out = ? WHERE id = ? AND Time_in LIKE ?', [TIME, attendanceId, currentDate + '%'], function (err) {
                        if (err) {
                            return handleError(err.message);
                        }
                        res.send('Data updated successfully');
                    });
                } else {
                    // Insert new attendance record
                    db.run('INSERT INTO Employee_attendance (Employee_id, Time_in) VALUES (?, ?)', [employeeId, TIME], function (err) {
                        if (err) {
                            return handleError(err.message);
                        }
                        res.send('Data inserted successfully');
                    });
                }
            });
        } else {
            const currentDate = new Date().toISOString().slice(0, 10); // This will get the date in YYYY-MM-DD format
            db.get('SELECT * FROM Employee_attendance WHERE Time_out is null AND Employee_id = ? AND Time_in LIKE ? ', [QRCODE, currentDate + '%'], (err, studentAttendance) => {
                if (err) {
                    return handleError(err.message);
                }

                if (studentAttendance) {
                    const attendanceId = studentAttendance.id;
                    // Update time_out for existing attendance
                    db.run('UPDATE Student_attendance SET Time_out = ? WHERE id = ? AND Time_in LIKE ?', [TIME, attendanceId, currentDate + '%'], function (err) {
                        if (err) {
                            return handleError(err.message);
                        }
                        res.send('Data updated successfully');
                    });
                } else {
                    const attendanceId = studentAttendance.id;
                    db.run('INSERT INTO Student_attendance (Student_id, Time_in) VALUES (?, ?)', [attendanceId, TIME], function (err) {
                        if (err) {
                            return handleError(err.message);
                        }
                        res.send('Data inserted successfully');
                    });
                }
            });
        }
    });
});



// let student = "Insert Into student_attendance (student_id,time_in,time_out,is_sync) value (?,?,?,null,false)"

// let employee = "Insert Into employee_attendance (employee_id,time_in,time_out,is_sync) value (?,?,?,null,false)"

//HOME

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

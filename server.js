
import express, { response } from 'express';
import mysql from 'mysql';
import cors from 'cors';
import dotenv from 'dotenv'

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser'

const salt = 10;

dotenv.config({ path: './.env' });

const app = express();



app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));
app.use(cookieParser());



const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});





// register
app.post('/register', (req, res) => {
    const sql = "INSERT INTO userlogin (`name`, `email`, `password`)  VALUES (?)";
    // bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    //     if (err) {
    //         return res.json({ Error: "Error for the hashing password" })
    //     }

    const userInfo = [
        req.body.name,
        req.body.email,
        // hash
        req.body.password
    ]
    db.query(sql, [userInfo], (err, result) => {
        if (err) {
            return res.json({ Error: "Inserting data error or duplicate email" })
        }

        return res.json({ Status: "Success" })

    })

})


// review
app.post('/', (req, res) => {
    const sql = "INSERT INTO reviews (comment, rate, date, user_email) VALUES (?)"; 
    const userReview = [
        req.body.comment,
        req.body.rate,
        req.body.currentDate,
        req.body.userEmail
    ]
    db.query(sql, [userReview], (err, result) => {
        if (err) {
            return res.json({ Error: err.message })
        }
        return res.json({ Status: "Success" })
    })
})


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Message: "We need token" });
    } else {
        jwt.verify(token, 'i-am-a-sec-key', (err, decoded) => {
            if (err) {
                return res.json({ Message: "Auth Error" });
            } else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, email: req.email });
})

// login without hash
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM userlogin WHERE email = ? AND password = ?"
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) return res.json("Log in failed");
        if (data.length > 0) {
            const {name, email} = data[0]
            // const token = jwt.sign({ name }, "i-am-a-sec-key", { expiresIn: '1d' })
            // res.cookie('token', token);
            return res.json({ Status: "Success", name, email })
        }
        else {
            return res.json({ Message: "No data recorded" });
        }
    })
})

// app.get('/logout', (req, res) => {
//     res.clearCookie('token');
//     return res.json({ Status: "Success" })
// })


const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("<h1>WE GOT CONNECTED</h1>")
})

// transportation data for showing frontend part
app.get('/transport', (req, res) => {
    const sql = "SELECT * FROM transportation";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

// activities data for showing frontend part
app.get('/activities', (req, res) => {
    const sql = "SELECT * FROM activities";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

// hotels data for showing frontend part
app.get('/hotels', (req, res) => {
    const sql = "SELECT * FROM hotels";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

// activities data for showing frontend part
app.get('/Packages', (req, res) => {
    const sql = "SELECT * FROM packages";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})



// bookings table
app.post('/bookings', (req, res) => {
    const sql = "INSERT INTO user_bookings (title, book_type, price, user_email) VALUES (?)";
    const userBookings = [
        req.body.title,
        req.body.book_type,
        req.body.price,
        req.body.userEmail,
    ]
    db.query(sql, [userBookings], (err, result) => {
        if (err) {
            return res.json({ Error: err.message })
        }
        return res.json({ Status: "Success", isDone: "Data received" })
    })
})


// bookings cart
app.get('/bookings', (req, res) => {
    const sql = "SELECT * FROM user_bookings";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})


// user details profile
app.get('/userlogin', (req, res) => {
    const sql = "SELECT * FROM userlogin";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})


// 
app.get('/edit/:id', (req, res) => {
    const sql = "SELECT * FROM userlogin WHERE id = ?";
    const id = req.params.id;
    db.query(sql, [id],  (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})


// update user details
app.put('/update/:id', (req, res) => {
    const sql = "UPDATE userlogin SET `name` = ?, `email` = ? WHERE id = ?";
    const id = req.params.id;

    db.query(sql, [req.body.names, req.body.emails, id], (err, result) => {
        if (err) return res.json("error")
        return res.json(result)
    })
})


// delete user cart
app.delete('/bookings/:booking_id', (req, res) => {
    // const sql = "DELETE FROM user_bookings WHERE booking_id = ?";
    const sql = "DELETE FROM user_bookings WHERE booking_id = ?";
    const booking_id = req.params.booking_id;
    console.log('I server:',booking_id);

    db.query(sql, [booking_id], (err, result) => {
        if (err) return res.json("error")
        return res.json({message: "Data deleted"})
    })
})


app.listen(port, () => {
    console.log('we are responding from server', port)
})
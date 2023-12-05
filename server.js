
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
app.use(cors(
    {
        origin: ['http://localhost:5173'],
        methods: ["POST", "GET"],
        credentials: true
    }
));
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
            return res.json({ Error: "Inserting data error" })
        }

        return res.json({ Status: "Success" })

    })

})


// review
app.post('/', (req, res) => {
    const sql = "INSERT INTO reviews (comment, rate, date) VALUES (?)"; 
    const userReview = [
        req.body.comment,
        req.body.rate,
        req.body.currentDate
    ]
    db.query(sql, [userReview], (err, result) => {
        if (err) {
            return res.json({ Error: err.message })
        }
        return res.json({ Status: "Success" })
    })
})


const verifyUser = (req, res, next) => {
    // const token = req.cookies.token;
    // if (!token) {
    //     return res.json({ Message: "We need token" });
    // } else {
        jwt.verify(token, 'i-am-a-sec-key', (err, decoded) => {
            if (err) {
                return res.json({ Message: "Auth Error" });
            } else {
                req.name = decoded.name;
                next();
            }
        })
    // }
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
            const {name} = data[0]
            // const token = jwt.sign({ name }, "i-am-a-sec-key", { expiresIn: '1d' })
            // res.cookie('token', token);
            return res.json({ Status: "Success", name })
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

// transportation data
app.get('/transport', (req, res) => {
    const sql = "SELECT * FROM transportation";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

// activities data
app.get('/activities', (req, res) => {
    const sql = "SELECT * FROM activities";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

// hotels data
app.get('/hotels', (req, res) => {
    const sql = "SELECT * FROM hotels";
    db.query(sql, (err, result) => {
        if (err) return res.json({ Message: "Error" })
        return res.json(result)
    })
})

app.listen(port, () => {
    console.log('we are responding from server', port)
})
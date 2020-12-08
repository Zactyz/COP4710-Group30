const mysql =require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const dataBase = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async (req, res) => {
    try {
        const{ email, password} = req.body;

        if(!email || !password ){
            return res.status(400).render('login', {
                message: 'Please provide an email and password'
            } )
        }
     //  console.log(results);

    dataBase.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results);
        if(!results || !(await bcrypt.compare(password, results[0].password))){
        res.status(401).render('login', {
            message: ' Email or Password is incorrect'
          })
        } else {
            const id = results[0].id;
            const token = jwt.sign({id}, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            console.log(" The token is:" + token );

            const cookieOptions = {
                expires: new Date(
                    Date.now()+ process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            res.cookie('jwt', token, cookieOptions);
        res.status(200).redirect("/user");
        }

    })

    }catch (error){
        console.log(error);
    }

}



exports.register = (req, res) => {
    console.log(req.body);

    const{ name, email, password, passwordConfirm} = req.body;

    dataBase.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('register', {
                message: 'That email is already in use'
            })
        } else if(password !== passwordConfirm){
            return res.render('register', {
                message: 'The Passwords do not match'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        dataBase.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) =>{
            if(error){
                console.log(error);
            }else{
                console.log(results);
                return res.render('register', {
                message: 'User registered'
            })

            }
        })
    });
}


exports.createEvent = (req, res) => {
    console.log(req.body);

    const{ title, description, url, start, end, address} = req.body;

    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.status(401).send({
        msg: 'Your session is not valid!'
        });
    }

    dataBase.query('INSERT INTO events SET ?', {title: title, description: description, url: url, start_date:start, end_date:end, address:address, admin_id: req.userData.id}, (error, results) =>{
        if(error){
            console.log(error);
        } else{
            console.log(results);
            return res.render('createEvent', {
                message: 'Event successfully created'
            })

        }
    })
    
}


exports.getEvents = (req, res) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.status(401).send({
        msg: 'Your session is not valid!'
        });
    }
    
    dataBase.query('SELECT * FROM event_participants e, events ev WHERE user_id=? && e.event_id = ev.event_id',[req.userData.id], async(error, results) => {
        if(error){
            console.log(error);
        }
        
        return res.render('user', {
            events: results
        })
    })
}



exports.isLoggedIn = (req, res, next) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
        req.userData = decoded;
        return next();
    } catch (err) {
        return res.status(401).send({
        msg: 'Your session is not valid!'
        });
    }
}


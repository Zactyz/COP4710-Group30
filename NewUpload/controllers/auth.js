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
            const role = results[0].role;
            const token = jwt.sign({id, role}, process.env.JWT_SECRET, {
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

            if(results[0].role == 'Super_Admin')
                res.status(200).redirect("/superadmin");
            else
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

        dataBase.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword, role:'User'}, (error, results) =>{
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
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    dataBase.query('UPDATE users SET role = "Admin" WHERE users.id=?',[req.userData.id], (error, results) => {
        if(error){
            console.log(error);
        } else{
            console.log(results);
        }

    })
    
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
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    
    dataBase.query('SELECT * FROM event_participants e, events ev WHERE user_id=? && e.event_id = ev.event_id ORDER BY ev.start_date',[req.userData.id], async(error, results) => {
        if(error){
            console.log(error);
        }
        
        return res.render('user', {
            events: results
        })
    })
}

exports.getEventsByAdmin = (req, res) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    
    dataBase.query('SELECT * FROM events ev WHERE admin_id=? ORDER BY start_date',[req.userData.id], async(error, results) => {
        if(error){
            console.log(error);
        }
        
        return res.render('admin', {
            events: results,
            showAll: 'showing all'
        })
    })
}

exports.getAllUsersAndAdmins = (req, res) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    if(req.userData.role != 'Super_Admin'){
        return res.render('/');
    }
    dataBase.query('SELECT * FROM users WHERE role !="Super_Admin"', async(error, results) => {
        if(error){
            console.log(error);
        }

        dataBase.query('SELECT * FROM users WHERE role = "Admin"', async(error, results2) => {
            if(error){
                console.log(error);
            }
            
            return res.render('superadmin', {
                users: results,
                admins: results2
            })
        })
    })
}


exports.showActiveEvents = (req, res) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    var date = new Date()
    dataBase.query('SELECT * FROM events ev WHERE admin_id=? && end_date>? ORDER BY start_date',[req.userData.id, date], async(error, results) => {
        if(error){
            console.log(error);
        }
        
        return res.render('admin', {
            events: results,
            showActive: 'showing active'
        })
    })
}



exports.orderByDate = (req, res) => {
    const{start, end} = req.body;
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    
    dataBase.query('SELECT * FROM events e WHERE e.start_date >= ? && e.end_date <= ? ORDER BY e.start_date',[start, end], async(error, results) => {
        if(error){
            console.log(error);
        }
        
        return res.render('events', {
            events: results,
            start_def: start,
            end_def: end
        })
    })
}


exports.orderByAdmin = (req, res) => {
    const{admin_id} = req.body;
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    if(req.userData.role != 'Super_Admin'){
        return res.render('/');
    }

    dataBase.query('SELECT * FROM events e, users u WHERE e.admin_id = ? && e.admin_id = u.id',[admin_id], async(error, results1) => {
        if(error){
            console.log(error);
        }
        dataBase.query('SELECT * FROM users WHERE role !="Super_Admin"', async(error, results2) => {
    
            dataBase.query('SELECT * FROM users WHERE role = "Admin"', async(error, results3) => {
                return res.render('superadmin', {
                    events: results1,
                    admins: results3,
                    users: results2,
                    name: results1[0].name,
                    admin: 'admin'
                })
            })
        })
    })
}

exports.orderByUser = (req, res) => {
    const{user_id} = req.body;
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    if(req.userData.role != 'Super_Admin'){
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    dataBase.query('SELECT * FROM event_participants e, events ev, users u WHERE e.user_id=? && e.event_id = ev.event_id && e.user_id=u.id',[user_id], async(error, results1) => {

        
        dataBase.query('SELECT * FROM users WHERE role !="Super_Admin"', async(err1, results2) => {
    
            dataBase.query('SELECT * FROM users WHERE role = "Admin"', async(err2, results3) => {
                if(typeof results1[0] == 'undefined'){
                    return res.render('superadmin', {
                        admins: results3,
                        users: results2,
                    })
                }
                else
                    return res.render('superadmin', {
                        events: results1,
                        admins: results3,
                        users: results2,
                        name: results1[0].name,
                        user: 'user'
                    })
            })
        })
    })
}

exports.joinEvent = (req, res) => {

    const{event_id} = req.body;

    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
    req.userData = decoded;
    } catch (err) {
        return res.render('/', {
            notLogged: 'Your session is not valid!'
        });
    }
    
    dataBase.query('SELECT admin_id FROM events e WHERE e.event_id=?',[event_id], async(error, results) => {
        if(error){
        }
        else if(results[0].admin_id == req.userData.id)
            return res.render('events', {
                admin: 'You are the host!'
        })
    })

    dataBase.query('INSERT INTO event_participants SET ?',{event_id:event_id, user_id: req.userData.id}, async(error, results) => {
        if(error){
            return res.render('events', {
                message: 'You are already participating in this event!'
            })
        }

        return res.render('events', {
            success: 'Successfully added this event!'
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
        return res.render('/', {
        notLogged: 'Your session is not valid!'
        });
    }
}

exports.logout = (req, res) => {
    try {
        const decoded = jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET
    );
        // req.cookies.jwt.deleteToken()
        // console.log(decoded.userData);
        res.redirect("/");
    } catch (err) {
        res.status(400).redirect("/");
    }
}



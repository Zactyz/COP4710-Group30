import React, { useState, Component } from 'react';
import './login.css';

class Login extends Component {
    constructor(props) {
		super(props);

		this.state = {
			userName: "",
			password: "",
		};
    }   
    
	handleLogin(user, password) {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: password })
        };
        fetch('', requestOptions)
            .then(response => response.json())
            .then();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.handleLogin(this.state.userName,this.state.password)
    }

    // Username Entered
	handleUsernameChange = (event) => {
		this.setState({ 
			userName: event.target.value
        })
	}

    // Password Entered
	handlePasswordChange = (event) => {
		this.setState({
			password: event.target.value
		})
	}

    render() {

        return (
            <body>
                <div class="wrapper">
                    <div class="form-wrapper">

                        <h1>Login</h1>
                        <form class="login" onSubmit={this.handleSubmit}>
                            <label for="username">Username:</label>
                            <input type="text" id="username" class="input" 
                                value={this.state.userName}
                                onChange={this.handleUsernameChange}
                                required
                            /><br/>

                            <label for="pass">Password:</label>
                            <input type="password" id="pass" class="input"
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                                required
                            /><br/>
                            <input type="submit" value="Submit" class="button1"/>
                        </form>
                    </div>
                </div>
            </body>
        );
    }
}

export default Login;
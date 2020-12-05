import React, { useState, Component } from 'react';
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
import './createEvent.css';

class CreateEvent extends Component {
    constructor(props) {
		super(props);

		this.state = {
            eventTitle: "",
            descript:"Describe your event here...",
            address: "",
            startDate: new Date(),
            endDate: new Date(),
		};
    }   
    
	handleCreate(title, description, address, start, end) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventTitle: title, desc: description, address: address, start: start, end: end })
        };
        fetch('', requestOptions)
            .then(response => response.json())
            .then();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.handleCreate(this.state.eventTitle, this.state.descript, this.state.address, this.state.startDate, this.state.endDate)
    }

	handleEventTitleChange = (event) => {
		this.setState({ 
			eventTitle: event.target.value
        })
    }
    
    handleDescriptionChange = (event) => {
		this.setState({ 
			descript: event.target.value
        })
    }
    
    handleStartDate = (event) => {
        this.setState({
			startDate: event
		})
    }

    handleEndDate = (event) => {
        this.setState({
			endDate: event
		})
	}

	handleAddressChange = (event) => {
		this.setState({
			address: event.target.value
		})
	}

    render() {

        return (
            <body>
                <div class="wrapper">
                    <div class="form-wrapper">

                        <h1>Create an Event</h1>
                        <form class="event" onSubmit={this.handleSubmit}>
                            <label for="eventtitle">Event title: </label>
                            <input type="text" id="eventtitle" class="input" 
                                value={this.state.eventTitle}
                                onChange={this.handleEventTitleChange}
                                required
                            /><br/><br/>
                            <label for="description">Description: </label>
                            <textarea id ="description" value={this.state.descript} 
                                onChange={this.handleDescriptionChange}
                            /><br/><br/>
                            <label for="start">Select Event Start Date: </label>
                            <DatePicker id="start" selected={this.state.startDate} onChange={this.handleStartDate} dateFormat="MM/dd/yyyy"/>
                            <br/>
                            <label for="end">Select Event End Date: </label>
                            <DatePicker id="end" selected={this.state.endDate} onChange={this.handleEndDate} dateFormat="MM/dd/yyyy"/>
                            <br/><br/>
                            <label for="address">Event Address: </label>
                            <input type="text" id="address" class="input"
                                value={this.state.address}
                                onChange={this.handleAddressChange}
                                required
                            /><br/>
                            <input type="submit" value="Create" class="button1"/>
                        </form>
                    </div>
                </div>
            </body>
        );
    }
}

export default CreateEvent;
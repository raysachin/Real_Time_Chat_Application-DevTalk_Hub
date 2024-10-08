const express = require('express');
const cors = require('cors');


// const createError = require('http-errors');

const authRoutes = require("./routes/auth.js");

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

// CORS configuration
app.use(cors({
    // origin: 'http://localhost:3000', // Your frontend URL of local server when connected to Cloud Backkend
    origin: 'https://real-time-chat-application-devtalk-hub-9zf8.onrender.com',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if(type === 'message.new') {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if(!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                        .then(() => {
                            res
                            .status(200)
                            .send({ message: 'Message sent successfully' });    
                        })
                        .catch((err) => {
                            res
                            .status(500)
                            .send({ message: 'Error sending message' });
                            
                        });
                }
            })

            return res.status(200).send('Message sent!');
    }

    return res.status(200).send('Not a new message request');
});


app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
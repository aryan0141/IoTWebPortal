require('dotenv').config();

const nodemailer = require("nodemailer");
const password = process.env.PASSWORD


const sendEmail = (store) => {
    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'iitj.iotwebportal@gmail.com',
                pass: password
            }
        }
    )
    const mailOptions = {
        from: 'iitj.iotwebportal@gmail.com',
        to: store.to,
        subject: `Regarding Update on your ${store.sensorName} Sensor`,
        html: `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Alert</title>
                <style>
                    * {
                        font-family: Verdana, Geneva, Tahoma, sans-serif!important;
                    }

                    .card {
                        border: 1px solid #f96332;
                        background-color: #f96332;
                        opacity: 0.9;
                        border-radius: 7px;
                        margin: auto;
                        width: 60%;
                        padding: 20px;
                        color: white;
                    }
                    #liveBtn {
                      margin: 7px 40px;
                      color: white;
                      border: 1px solid white;
                      border-radius: 7px;
                      font-size: 0.6rem;
                      transition: 0.4s;
                      padding: 4px 4px;
                      font-size: 1rem;
                      text-decoration: none;
                    }
                    #liveBtn:hover {
                      background: white;
                      transition: 0.4s;
                      color: #f96332;
                    }

                    #message {
                        padding-left: 40px;
                    }
                </style>
            </head>

            <body>
                <div class="card">
                    <p id="welcome">
                        Dear ${store.userName},
                    </p>
                    <p id="message">
                        Your ${store.sensorName} sensor Located at ${store.geolocation} has ${store.flag ? "crossed the maximum" : "has gone below the minimum"} threshold value. <br>
                        Your ${store.flag ? "Maximum" : "Minimum"} threshold value is ${store.flag?store.maxThreshold:store.minThreshold}. <br>
                        Your current value of sensor is ${store.currentData}. <br>
                        Take your action accordingly.
                    </p>
                    <a id="liveBtn" href="http://13.233.77.13:5000/dashboard">Go Live</a>
                    <p id="regards">
                        Regards <br>
                        Admin IoT Web Portal
                    </p>
                    <p id="note">
                        Note: This is an Auto-Generated mail. DO NOT REPLY TO THIS.
                    </p>
                </div>
            </body>

            </html>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log(info.response);
    })
}

module.exports = sendEmail;
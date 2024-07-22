const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'USER_EMAIL',
    pass: 'USER_PASS' 
  }
});


app.post('/send', upload.single('resume'), (req, res) => {
  const { name, email, message } = req.body;
  const resumePath = req.file.path;

  const mailOptions = {
    from: email, 
    to: 'USER_EMAIL', 
    subject: 'New Form Submission with Resume',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px;">
        <h2 style="color: #444; font-size: 20px;">You have a new form submission:</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="margin-left: 20px;">${message}</p>
      </div>
    `,
    attachments: [
      {
        filename: req.file.originalname,
        path: resumePath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
  
    fs.unlinkSync(resumePath);

    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_email, private_key } = credentials;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.JWT(client_email, null, private_key, SCOPES);
const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = 'your-spreadsheet-id';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/bookings', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:D',
        });
        res.json(response.data.values);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/bookings', async (req, res) => {
    const { date, time, table, booking } = req.body;
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:D',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[date, time, table, booking]],
            },
        });
        res.status(200).send('Booking added successfully');
    } catch (error) {
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');

// Configure Google Sheets API authentication
const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL, // Service account email from Vercel environment variables
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
    ['https://www.googleapis.com/auth/spreadsheets'] // Scope for Google Sheets
);

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Google Sheet ID from Vercel environment variables

const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies

// API route to fetch all bookings
app.get('/bookings', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:D', // Adjust this range based on your sheet's structure
        });
        res.json(response.data.values); // Send the data as JSON response
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Failed to fetch bookings.');
    }
});

// API route to add a new booking
app.post('/bookings', async (req, res) => {
    const { date, time, table, booking } = req.body; // Expecting { date, time, table, booking } in request body
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:D', // Adjust this range based on your sheet's structure
            valueInputOption: 'RAW',
            requestBody: {
                values: [[date, time, table, booking]], // Add new booking as a row
            },
        });
        res.status(200).send('Booking added successfully.');
    } catch (error) {
        console.error('Error adding booking:', error);
        res.status(500).send('Failed to add booking.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Required for Vercel

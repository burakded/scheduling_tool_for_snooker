const backendUrl = "https://scheduling-tool-for-snooker.onrender.com"; // Replace with your backend URL

const timeSlots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const calendars = ['table1', 'table2'];

// Fetch and populate bookings
const loadBookings = async () => {
    try {
        const response = await fetch(`${backendUrl}/bookings`);
        const bookings = await response.json();

        bookings.forEach(([date, time, table, booking]) => {
            const calendar = table === 'Snooker Table 1' ? 'table1' : 'table2';
            const slot = document.querySelector(`#${calendar} .slot[data-time="${time}"]`);
            if (slot) {
                slot.textContent = `${time} - ${booking}`;
                slot.classList.add('booked');
            }
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
    }
};

// Add a booking to Google Sheets
const addBooking = async (date, time, table, booking) => {
    try {
        await fetch(`${backendUrl}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, time, table, booking }),
        });
    } catch (error) {
        console.error("Error adding booking:", error);
    }
};

// Populate time slots
calendars.forEach(calendarId => {
    const calendar = document.getElementById(calendarId);
    const slotsContainer = calendar.querySelector('.time-slots');
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.setAttribute('data-time', time);
        slot.textContent = time;

        slot.addEventListener('click', async () => {
            if (!slot.classList.contains('booked')) {
                const booking = prompt(`Enter booking for ${time}:`);
                if (booking) {
                    const date = document.querySelector(`#${calendarId} .date span`).textContent;
                    const table = calendarId === 'table1' ? 'Snooker Table 1' : 'Snooker Table 2';

                    slot.textContent = `${time} - ${booking}`;
                    slot.classList.add('booked');

                    await addBooking(date, time, table, booking);
                }
            }
        });

        slotsContainer.appendChild(slot);
    });
});
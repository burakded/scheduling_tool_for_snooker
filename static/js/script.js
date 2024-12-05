const backendUrl = "https://scheduling-tool-for-snooker.onrender.com"; // Replace with your backend URL

// Modal Elements
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');
const confirmBooking = document.getElementById('confirmBooking');
const bookingNameInput = document.getElementById('bookingName');

// Helper function to update the day name based on the selected date
const updateDayName = (selectedDate) => {
    const date = new Date(selectedDate);
    const options = { weekday: 'long' }; // Full day name (e.g., Thursday)
    const dayName = new Intl.DateTimeFormat('en-GB', options).format(date);
    document.getElementById('dayName').textContent = dayName;
};


// Default to today's date in UK time
const ukDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');
document.getElementById('date').value = ukDate;
updateDayName(ukDate); // Set the day name for today's date

let selectedDate = ukDate; // Track selected date
let currentSlot = null;

// Update date and reload bookings
document.getElementById('date').addEventListener('change', (event) => {
    selectedDate = event.target.value;
    updateDayName(selectedDate); // Update the day name
    loadBookings(); // Refresh bookings for the selected date
});

// Fetch and display bookings
const loadBookings = async () => {
    try {
        const response = await fetch(`${backendUrl}/bookings`);
        const bookings = await response.json();

        // Clear current slots
        document.querySelectorAll('.slot').forEach((slot) => {
            slot.textContent = slot.getAttribute('data-time');
            slot.classList.remove('booked');
        });

        // Populate the bookings for the selected date
        bookings
            .filter((booking) => booking.date === selectedDate)
            .forEach(({ time, table, booking }) => {
                const calendarId = table === "Snooker Table 1" ? "table1" : "table2";
                const slot = document.querySelector(`#${calendarId} .slot[data-time="${time}"]`);
                if (slot) {
                    slot.textContent = `${time} - ${booking}`;
                    slot.classList.add('booked');
                }
            });
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
};

// Add booking modal functionality
const addBooking = async (time, table, booking) => {
    try {
        await fetch(`${backendUrl}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedDate, time, table, booking }),
        });
        loadBookings();
    } catch (error) {
        console.error('Error adding booking:', error);
    }
};

// Populate time slots
const timeSlots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const calendars = ['table1', 'table2'];

calendars.forEach((calendarId) => {
    const slotsContainer = document.querySelector(`#${calendarId} .time-slots`);
    timeSlots.forEach((time) => {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.setAttribute('data-time', time);
        slot.textContent = time;

        // Open modal on click
        slot.addEventListener('click', () => {
            if (!slot.classList.contains('booked')) {
                currentSlot = { time, table: calendarId === 'table1' ? 'Snooker Table 1' : 'Snooker Table 2' };
                modal.style.display = 'block';
            }
        });

        slotsContainer.appendChild(slot);
    });
});

// Modal interactions
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

confirmBooking.addEventListener('click', () => {
    const bookingName = bookingNameInput.value.trim();
    if (bookingName && currentSlot) {
        addBooking(currentSlot.time, currentSlot.table, bookingName);
        bookingNameInput.value = ''; // Clear input
        modal.style.display = 'none';
    }
});

// Load today's bookings on page load
loadBookings();
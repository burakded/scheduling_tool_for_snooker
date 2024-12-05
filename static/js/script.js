const backendUrl = "https://scheduling-tool-for-snooker.onrender.com"; // Replace with your backend URL
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');
const confirmBooking = document.getElementById('confirmBooking');
const bookingNameInput = document.getElementById('bookingName');

let selectedDate = new Date().toISOString().split('T')[0]; // Default to today's date (UTC)

// Set today's date as default in the date picker
document.getElementById('date').value = selectedDate;

// Update date when user changes the picker
document.getElementById('date').addEventListener('change', (event) => {
    selectedDate = event.target.value;
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
let currentSlot = null;

const addBooking = async (time, table, booking) => {
    try {
        await fetch(`${backendUrl}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedDate, time, table, booking }),
        });
        loadBookings(); // Reload bookings
    } catch (error) {
        console.error('Error adding booking:', error);
    }
};

// Populate time slots
const timeSlots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const calendars = ['table1', 'table2'];

calendars.forEach((calendarId) => {
    const calendar = document.getElementById(calendarId);
    const slotsContainer = calendar.querySelector('.time-slots');

    timeSlots.forEach((time) => {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.setAttribute('data-time', time);
        slot.textContent = time;

        // Open modal on click
        slot.addEventListener('click', () => {
            if (!slot.classList.contains('booked')) {
                currentSlot = { time, table: calendarId === 'table1' ? 'Snooker Table 1' : 'Snooker Table 2' };
                modal.style.display = 'block'; // Show the modal
            }
        });

        slotsContainer.appendChild(slot);
    });
});

// Modal close functionality
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Confirm booking
confirmBooking.addEventListener('click', () => {
    const bookingName = bookingNameInput.value.trim();
    if (bookingName && currentSlot) {
        addBooking(currentSlot.time, currentSlot.table, bookingName);
        bookingNameInput.value = ''; // Clear input
        modal.style.display = 'none'; // Close modal
    }
});

// Load today's bookings on page load
loadBookings();

const backendUrl = "https://scheduling-tool-for-snooker.onrender.com"; // Replace with your backend URL

// Modal Elements
const modal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close');
const confirmBooking = document.getElementById('confirmBooking');
const bookingNameInput = document.getElementById('bookingName');

// Date Navigation Elements
const currentDateElement = document.getElementById('currentDate');
const prevDayButton = document.getElementById('prevDay');
const nextDayButton = document.getElementById('nextDay');
const dateInput = document.getElementById('date');

// Helper function to update the day name based on the selected date
const updateDayName = (selectedDate) => {
    const date = new Date(selectedDate);
    const options = { weekday: 'long' };
    const dayName = new Intl.DateTimeFormat('en-GB', options).format(date);
    document.getElementById('dayName').textContent = dayName;
};

// Helper function to format a date for display
const formatDate = (date) => new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(date);

// Update the current date and refresh bookings
const updateCurrentDate = (newDate) => {
    selectedDate = newDate.toISOString().split('T')[0];
    currentDateElement.textContent = formatDate(newDate);
    updateDayName(selectedDate);
    dateInput.value = selectedDate; // Sync with the date input
    loadBookings();
};

// Event listener for changes to the date input
dateInput.addEventListener('change', () => {
    const newDate = new Date(dateInput.value);
    updateCurrentDate(newDate);
});

// Default to today's date
const today = new Date();
const updateDate = (date) => {
    dateInput.value = date.toISOString().split('T')[0];
    currentDateElement.textContent = formatDate(date);
};
updateDate(today);

let selectedDate = today.toISOString().split('T')[0];
let currentSlot = null;

// Event listeners for navigation buttons
prevDayButton.addEventListener('click', () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    updateCurrentDate(newDate);
});

nextDayButton.addEventListener('click', () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    updateCurrentDate(newDate);
});

// Fetch and display bookings
const loadBookings = async () => {
    try {
        const response = await fetch(`${backendUrl}/bookings`);
        const bookings = await response.json();

        document.querySelectorAll('.slot').forEach((slot) => {
            slot.textContent = slot.getAttribute('data-time');
            slot.classList.remove('booked');
        });

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
        bookingNameInput.value = '';
        modal.style.display = 'none';
    }
});

// Load today's bookings on page load
loadBookings();

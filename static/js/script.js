const timeSlots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const calendars = ['table1', 'table2'];

calendars.forEach(calendarId => {
    const calendar = document.getElementById(calendarId);
    const slotsContainer = calendar.querySelector('.time-slots');
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.textContent = time;

        // Add edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.display = 'none'; // Initially hidden

        // Booking action
        slot.addEventListener('click', () => {
            if (!slot.classList.contains('booked')) {
                const booking = prompt(`Enter booking for ${time}:`);
                if (booking) {
                    slot.textContent = `${time} - ${booking}`;
                    slot.classList.add('booked');
                    slot.appendChild(editButton); // Show the edit button
                    editButton.style.display = 'inline-block';
                }
            }
        });

        // Edit action
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the slot click
            const newBooking = prompt('Edit booking:', slot.textContent.split(' - ')[1]);
            if (newBooking) {
                slot.textContent = `${time} - ${newBooking}`;
                slot.appendChild(editButton); // Ensure edit button stays visible
            }
        });

        slotsContainer.appendChild(slot);
    });
});

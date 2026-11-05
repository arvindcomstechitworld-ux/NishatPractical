
// =====================================
// MOVEMATE - PACKERS & MOVERS SYSTEM
// =====================================

// GET HTML ELEMENTS

const form = document.getElementById("moveForm");

const customerName = document.getElementById("customerName");
const mobile = document.getElementById("mobile");
const movingDate = document.getElementById("movingDate");
const vehicle = document.getElementById("vehicle");
const pickup = document.getElementById("pickup");
const destination = document.getElementById("destination");
const movingType = document.getElementById("movingType");
const amount = document.getElementById("amount");
const payment = document.getElementById("payment");
const status = document.getElementById("status");
const notes = document.getElementById("notes");

const bookingId = document.getElementById("bookingId");
const bookingTable = document.getElementById("bookingTable");

const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

const saveBtn = document.getElementById("saveBtn");
const cancelEdit = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");

// ADDITIONAL PAYMENT FIELD
// Created dynamically to keep payment information together.

const paidField = document.createElement("div");
paidField.className = "field";
paidField.innerHTML = `
    <label>Amount Paid (₹)</label>
    <input type="number" id="amountPaid"
           min="0" placeholder="Enter amount paid" value="0">
`;

document.querySelector("#payment").parentElement
    .after(paidField);

const amountPaid = document.getElementById("amountPaid");

// =====================================
// LOCAL STORAGE
// =====================================

let bookings = [];

try {
    bookings = JSON.parse(
        localStorage.getItem("moveMateBookings")
    ) || [];
} catch (error) {
    console.error("Unable to read saved bookings:", error);
    bookings = [];
}

function saveData() {
    localStorage.setItem(
        "moveMateBookings",
        JSON.stringify(bookings)
    );
}

// =====================================
// HELPER FUNCTIONS
// =====================================

function formatMoney(value) {
    return "₹" + Number(value).toLocaleString("en-IN");
}

function formatDate(date) {
    if (!date) return "-";

    return new Date(date + "T00:00:00")
        .toLocaleDateString("en-IN");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function generateBookingID() {
    return "MM-" + Date.now().toString().slice(-8);
}

// =====================================
// CREATE & UPDATE BOOKING
// =====================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const total = Number(amount.value);
    const paid = Number(amountPaid.value);

    if (paid < 0 || paid > total) {
        alert("Amount paid cannot exceed the total amount.");
        return;
    }

    const booking = {

        id: bookingId.value || generateBookingID(),

        customer: customerName.value.trim(),

        mobile: mobile.value.trim(),

        date: movingDate.value,

        vehicle: vehicle.value,

        pickup: pickup.value.trim(),

        destination: destination.value.trim(),

        movingType: movingType.value,

        amount: total,

        amountPaid: paid,

        payment: payment.value,

        status: status.value,

        notes: notes.value.trim()
    };

    if (!booking.customer || !booking.pickup ||
        !booking.destination) {
        alert("Please fill all required details.");
        return;
    }

    // UPDATE
    if (bookingId.value) {

        bookings = bookings.map(item =>
            item.id === bookingId.value ? booking : item
        );

        alert("Booking updated successfully!");

    }

    // CREATE
    else {

        bookings.unshift(booking);

        alert(
            "Booking created successfully!\n" +
            "Booking ID: " + booking.id
        );

    }

    saveData();

    displayBookings();

    updateDashboard();

    resetForm();

});

// =====================================
// READ - DISPLAY BOOKINGS
// =====================================

function displayBookings() {

    bookingTable.innerHTML = "";

    const searchText = search.value.toLowerCase();

    const selectedStatus = statusFilter.value;

    const filteredBookings = bookings.filter(item => {

        const matchesSearch =
            item.customer.toLowerCase().includes(searchText) ||
            item.mobile.includes(searchText) ||
            item.id.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            item.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    if (filteredBookings.length === 0) {

        bookingTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    No bookings found. Create your first booking!
                </td>
            </tr>
        `;

    }

    filteredBookings.forEach(item => {

        const row = document.createElement("tr");

        const statusClass = item.status
            .toLowerCase()
            .replaceAll(" ", "-");

        const paymentClass = item.payment
            .toLowerCase();

        row.innerHTML = `

            <td>
                <span class="booking-code">
                    ${escapeHTML(item.id)}
                </span>
            </td>

            <td>
                <span class="customer-name">
                    ${escapeHTML(item.customer)}
                </span>
                <br>
                ${escapeHTML(item.mobile)}
            </td>

            <td>${formatDate(item.date)}</td>

            <td>
                <div class="route">
                    ${escapeHTML(item.pickup)}
                    <br> ↓ <br>
                    ${escapeHTML(item.destination)}
                </div>
            </td>

            <td>${formatMoney(item.amount)}</td>

            <td>
                <span class="status ${paymentClass}">
                    ${escapeHTML(item.payment)}
                </span>
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHTML(item.status)}
                </span>
            </td>

            <td>
                <button class="action-btn edit-btn"
                    data-action="edit"
                    data-id="${escapeHTML(item.id)}">
                    Edit
                </button>

                <button class="action-btn delete-btn"
                    data-action="delete"
                    data-id="${escapeHTML(item.id)}">
                    Delete
                </button>
            </td>

        `;

        bookingTable.appendChild(row);

    });

    document.getElementById("tableCount").textContent =
        `Showing ${filteredBookings.length} of ${bookings.length} bookings`;

}

// =====================================
// EDIT BOOKING
// =====================================

function editBooking(id) {

    const item = bookings.find(booking => booking.id === id);

    if (!item) return;

    bookingId.value = item.id;

    customerName.value = item.customer;

    mobile.value = item.mobile;

    movingDate.value = item.date;

    vehicle.value = item.vehicle;

    pickup.value = item.pickup;

    destination.value = item.destination;

    movingType.value = item.movingType;

    amount.value = item.amount;

    amountPaid.value = item.amountPaid ?? 0;

    payment.value = item.payment;

    status.value = item.status;

    notes.value = item.notes || "";

    formTitle.textContent = "Update Booking";

    saveBtn.textContent = "Update Booking";

    cancelEdit.hidden = false;

    document.getElementById("bookingForm")
        .scrollIntoView({ behavior: "smooth" });

}

// =====================================
// DELETE BOOKING
// =====================================

function deleteBooking(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this booking?"
    );

    if (!confirmDelete) return;

    bookings = bookings.filter(item => item.id !== id);

    saveData();

    displayBookings();

    updateDashboard();

    if (bookingId.value === id) {
        resetForm();
    }

    alert("Booking deleted successfully!");

}

// Event delegation for Edit and Delete buttons

bookingTable.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        editBooking(id);
    }

    if (button.dataset.action === "delete") {
        deleteBooking(id);
    }

});

// =====================================
// DASHBOARD STATISTICS
// =====================================

function updateDashboard() {

    // TOTAL BOOKINGS
    document.getElementById("totalBookings")
        .textContent = bookings.length;

    // ACTIVE MOVES
    const active = bookings.filter(item =>
        item.status === "Confirmed" ||
        item.status === "In Transit"
    );

    document.getElementById("activeMoves")
        .textContent = active.length;

    // TOTAL BOOKING VALUE
    const revenue = bookings.reduce((sum, item) => {
        return sum + Number(item.amount || 0);
    }, 0);

    document.getElementById("totalRevenue")
        .textContent = formatMoney(revenue);

    // OUTSTANDING PAYMENTS
    const outstanding = bookings.reduce((sum, item) => {

        if (item.status === "Cancelled") return sum;

        return sum + Math.max(
            0,
            Number(item.amount || 0) -
            Number(item.amountPaid || 0)
        );

    }, 0);

    document.getElementById("pendingPayments")
        .textContent = formatMoney(outstanding);

}

// =====================================
// SEARCH
// =====================================

search.addEventListener("input", function() {

    displayBookings();

});

// =====================================
// FILTER BY STATUS
// =====================================

statusFilter.addEventListener("change", function() {

    displayBookings();

});

// =====================================
// PAYMENT STATUS AUTOMATION
// =====================================

payment.addEventListener("change", function() {

    if (payment.value === "Paid") {
        amountPaid.value = amount.value || 0;
    }

    if (payment.value === "Pending") {
        amountPaid.value = 0;
    }

});

// =====================================
// RESET FORM
// =====================================

function resetForm() {

    form.reset();

    bookingId.value = "";

    amountPaid.value = 0;

    formTitle.textContent = "Create New Booking";

    saveBtn.textContent = "Save Booking";

    cancelEdit.hidden = true;

}

// CANCEL EDIT

cancelEdit.addEventListener("click", resetForm);

// =====================================
// INITIALIZE APPLICATION
// =====================================

displayBookings();

updateDashboard();



document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Set active navigation item
            navItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Dashboard card navigation
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Set active navigation item
            navItems.forEach(item => {
                if (item.getAttribute('data-section') === targetSection) {
                    item.click();
                }
            });
        });
    });
    
    // Load all data initially
    loadDashboardData();
    loadCustomers();
    loadHotels();
    loadRoomCategories();
    loadRooms();
    loadReservations();
    loadInvoices();
    
    // Set up event listeners for add buttons
    document.getElementById('add-customer-btn').addEventListener('click', () => openAddCustomerModal());
    document.getElementById('add-hotel-btn').addEventListener('click', () => openAddHotelModal());
    document.getElementById('add-category-btn').addEventListener('click', () => openAddCategoryModal());
    document.getElementById('add-room-btn').addEventListener('click', () => openAddRoomModal());
    document.getElementById('add-reservation-btn').addEventListener('click', () => openAddReservationModal());
    document.getElementById('add-invoice-btn').addEventListener('click', () => openAddInvoiceModal());
    
    // Set up event listeners for form submissions
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('hotel-form').addEventListener('submit', handleHotelSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
    document.getElementById('room-form').addEventListener('submit', handleRoomSubmit);
    document.getElementById('reservation-form').addEventListener('submit', handleReservationSubmit);
    document.getElementById('invoice-form').addEventListener('submit', handleInvoiceSubmit);
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-btn, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Set up confirm delete button
    document.getElementById('confirm-delete').addEventListener('click', handleConfirmDelete);
    
    // Date input event listeners for reservation
    document.getElementById('reservation-start').addEventListener('change', updatePeriod);
    document.getElementById('reservation-end').addEventListener('change', updatePeriod);
});

// API helper functions
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        return await response.json();
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

// Notification functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const [customers, hotels, rooms, reservations] = await Promise.all([
            fetchAPI('/api/customers'),
            fetchAPI('/api/hotels'),
            fetchAPI('/api/rooms'),
            fetchAPI('/api/reservations')
        ]);
        
        document.getElementById('customer-count').textContent = customers.length;
        document.getElementById('hotel-count').textContent = hotels.length;
        document.getElementById('room-count').textContent = rooms.length;
        document.getElementById('reservation-count').textContent = reservations.length;
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// --- CUSTOMER FUNCTIONS ---

async function loadCustomers() {
    try {
        const customers = await fetchAPI('/api/customers');
        
        const tableBody = document.querySelector('#customers-table tbody');
        tableBody.innerHTML = '';
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.Customer_Id}</td>
                <td>${customer.Name}</td>
                <td>${customer.Email}</td>
                <td>${customer.Country}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${customer.Customer_Id}">Edit</button>
                    <button class="delete-btn" data-id="${customer.Customer_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditCustomerModal(customer));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('customer', customer.Customer_Id));
        });
    } catch (error) {
        console.error('Failed to load customers:', error);
    }
}

function openAddCustomerModal() {
    document.getElementById('customer-modal-title').textContent = 'Add Customer';
    document.getElementById('customer-id').value = '';
    openModal('customer-modal');
}

function openEditCustomerModal(customer) {
    document.getElementById('customer-modal-title').textContent = 'Edit Customer';
    document.getElementById('customer-id').value = customer.Customer_Id;
    document.getElementById('customer-name').value = customer.Name;
    document.getElementById('customer-email').value = customer.Email;
    document.getElementById('customer-country').value = customer.Country;
    
    openModal('customer-modal');
}

async function handleCustomerSubmit(event) {
    event.preventDefault();
    
    const customerId = document.getElementById('customer-id').value;
    const data = {
        Name: document.getElementById('customer-name').value,
        Email: document.getElementById('customer-email').value,
        Country: document.getElementById('customer-country').value
    };
    
    try {
        if (customerId) {
            // Update existing customer
            await fetchAPI(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Customer updated successfully');
        } else {
            // Add new customer
            await fetchAPI('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Customer added successfully');
        }
        
        closeModal(document.getElementById('customer-modal'));
        loadCustomers();
        loadDashboardData();
    } catch (error) {
        console.error('Failed to save customer:', error);
    }
}

// --- HOTEL FUNCTIONS ---

async function loadHotels() {
    try {
        const hotels = await fetchAPI('/api/hotels');
        
        const tableBody = document.querySelector('#hotels-table tbody');
        tableBody.innerHTML = '';
        
        hotels.forEach(hotel => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hotel.Hotel_Id}</td>
                <td>${hotel.Name}</td>
                <td>${hotel.Location}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${hotel.Hotel_Id}">Edit</button>
                    <button class="delete-btn" data-id="${hotel.Hotel_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditHotelModal(hotel));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('hotel', hotel.Hotel_Id));
        });
    } catch (error) {
        console.error('Failed to load hotels:', error);
    }
}

function openAddHotelModal() {
    document.getElementById('hotel-modal-title').textContent = 'Add Hotel';
    document.getElementById('hotel-id').value = '';
    openModal('hotel-modal');
}

function openEditHotelModal(hotel) {
    document.getElementById('hotel-modal-title').textContent = 'Edit Hotel';
    document.getElementById('hotel-id').value = hotel.Hotel_Id;
    document.getElementById('hotel-name').value = hotel.Name;
    document.getElementById('hotel-location').value = hotel.Location;
    
    openModal('hotel-modal');
}

async function handleHotelSubmit(event) {
    event.preventDefault();
    
    const hotelId = document.getElementById('hotel-id').value;
    const data = {
        Name: document.getElementById('hotel-name').value,
        Location: document.getElementById('hotel-location').value
    };
    
    try {
        if (hotelId) {
            // Update existing hotel
            await fetchAPI(`/api/hotels/${hotelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Hotel updated successfully');
        } else {
            // Add new hotel
            await fetchAPI('/api/hotels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Hotel added successfully');
        }
        
        closeModal(document.getElementById('hotel-modal'));
        loadHotels();
        loadDashboardData();
    } catch (error) {
        console.error('Failed to save hotel:', error);
    }
}

// --- ROOM CATEGORY FUNCTIONS ---

async function loadRoomCategories() {
    try {
        const categories = await fetchAPI('/api/room-categories');
        
        const tableBody = document.querySelector('#categories-table tbody');
        tableBody.innerHTML = '';
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.Category_Id}</td>
                <td>${category.Type}</td>
                <td>$${parseFloat(category.Price).toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${category.Category_Id}">Edit</button>
                    <button class="delete-btn" data-id="${category.Category_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditCategoryModal(category));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('category', category.Category_Id));
        });
    } catch (error) {
        console.error('Failed to load room categories:', error);
    }
}

function openAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Add Room Category';
    document.getElementById('category-id').value = '';
    openModal('category-modal');
}

function openEditCategoryModal(category) {
    document.getElementById('category-modal-title').textContent = 'Edit Room Category';
    document.getElementById('category-id').value = category.Category_Id;
    document.getElementById('category-type').value = category.Type;
    document.getElementById('category-price').value = category.Price;
    
    openModal('category-modal');
}

async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const data = {
        Type: document.getElementById('category-type').value,
        Price: parseFloat(document.getElementById('category-price').value)
    };
    
    try {
        if (categoryId) {
            // Update existing category
            await fetchAPI(`/api/room-categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Room category updated successfully');
        } else {
            // Add new category
            await fetchAPI('/api/room-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Room category added successfully');
        }
        
        closeModal(document.getElementById('category-modal'));
        loadRoomCategories();
    } catch (error) {
        console.error('Failed to save room category:', error);
    }
}

// --- ROOM FUNCTIONS ---

async function loadRooms() {
    try {
        const rooms = await fetchAPI('/api/rooms');
        
        const tableBody = document.querySelector('#rooms-table tbody');
        tableBody.innerHTML = '';
        
        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${room.Room_Id}</td>
                <td>${room.Room_no}</td>
                <td>${room.Status}</td>
                <td>${room.HotelName}</td>
                <td>${room.CategoryType}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${room.Room_Id}">Edit</button>
                    <button class="delete-btn" data-id="${room.Room_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditRoomModal(room));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('room', room.Room_Id));
        });
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

async function openAddRoomModal() {
    document.getElementById('room-modal-title').textContent = 'Add Room';
    document.getElementById('room-id').value = '';
    
    try {
        // Load hotels and room categories for dropdowns
        const [hotels, categories] = await Promise.all([
            fetchAPI('/api/hotels'),
            fetchAPI('/api/room-categories')
        ]);
        
        populateDropdown('room-hotel', hotels, 'Hotel_Id', 'Name');
        populateDropdown('room-category', categories, 'Category_Id', 'Type');
        
        openModal('room-modal');
    } catch (error) {
        console.error('Failed to load room form data:', error);
    }
}

async function openEditRoomModal(room) {
    document.getElementById('room-modal-title').textContent = 'Edit Room';
    document.getElementById('room-id').value = room.Room_Id;
    document.getElementById('room-number').value = room.Room_no;
    document.getElementById('room-status').value = room.Status;
    
    try {
        // Load hotels and room categories for dropdowns
        const [hotels, categories] = await Promise.all([
            fetchAPI('/api/hotels'),
            fetchAPI('/api/room-categories')
        ]);
        
        populateDropdown('room-hotel', hotels, 'Hotel_Id', 'Name', room.Hotel_Id);
        populateDropdown('room-category', categories, 'Category_Id', 'Type', room.Category_Id);
        
        openModal('room-modal');
    } catch (error) {
        console.error('Failed to load room form data:', error);
    }
}

async function handleRoomSubmit(event) {
    event.preventDefault();
    
    const roomId = document.getElementById('room-id').value;
    const data = {
        Room_no: document.getElementById('room-number').value,
        Status: document.getElementById('room-status').value,
        Hotel_Id: document.getElementById('room-hotel').value,
        Category_Id: document.getElementById('room-category').value
    };
    
    try {
        if (roomId) {
            // Update existing room
            await fetchAPI(`/api/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Room updated successfully');
        } else {
            // Add new room
            await fetchAPI('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Room added successfully');
        }
        
        closeModal(document.getElementById('room-modal'));
        loadRooms();
        loadDashboardData();
    } catch (error) {
        console.error('Failed to save room:', error);
    }
}

// --- RESERVATION FUNCTIONS ---

async function loadReservations() {
    try {
        const reservations = await fetchAPI('/api/reservations');
        
        const tableBody = document.querySelector('#reservations-table tbody');
        tableBody.innerHTML = '';
        
        reservations.forEach(reservation => {
            const startDate = new Date(reservation.Start_Date).toLocaleDateString();
            const endDate = new Date(reservation.End_Date).toLocaleDateString();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.Reservation_Id}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>${reservation.Period}</td>
                <td>${reservation.CustomerName}</td>
                <td>${reservation.HotelName}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${reservation.Reservation_Id}">Edit</button>
                    <button class="delete-btn" data-id="${reservation.Reservation_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditReservationModal(reservation));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('reservation', reservation.Reservation_Id));
        });
    } catch (error) {
        console.error('Failed to load reservations:', error);
    }
}

async function openAddReservationModal() {
    document.getElementById('reservation-modal-title').textContent = 'Add Reservation';
    document.getElementById('reservation-id').value = '';
    
    // Clear period field
    document.getElementById('reservation-period').value = '';
    
    try {
        // Load customers, hotels and room categories for dropdowns
        const [customers, hotels, categories] = await Promise.all([
            fetchAPI('/api/customers'),
            fetchAPI('/api/hotels'),
            fetchAPI('/api/room-categories')
        ]);
        
        populateDropdown('reservation-customer', customers, 'Customer_Id', 'Name');
        populateDropdown('reservation-hotel', hotels, 'Hotel_Id', 'Name');
        
        // Populate categories as checkboxes
        const categoriesContainer = document.getElementById('reservation-categories-container');
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const wrapper = document.createElement('div');
            wrapper.className = 'category-checkbox-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `category-${category.Category_Id}`;
            checkbox.name = 'categories';
            checkbox.value = category.Category_Id;
            
            const label = document.createElement('label');
            label.htmlFor = `category-${category.Category_Id}`;
            label.textContent = `${category.Type} - $${parseFloat(category.Price).toFixed(2)}`;
            
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            categoriesContainer.appendChild(wrapper);
        });
        
        openModal('reservation-modal');
    } catch (error) {
        console.error('Failed to load reservation form data:', error);
    }
}

async function openEditReservationModal(reservation) {
    document.getElementById('reservation-modal-title').textContent = 'Edit Reservation';
    document.getElementById('reservation-id').value = reservation.Reservation_Id;
    
    // Format dates for the date inputs
    const startDate = new Date(reservation.Start_Date).toISOString().split('T')[0];
    const endDate = new Date(reservation.End_Date).toISOString().split('T')[0];
    
    document.getElementById('reservation-start').value = startDate;
    document.getElementById('reservation-end').value = endDate;
    document.getElementById('reservation-period').value = reservation.Period;
    
    try {
        // Load customers, hotels and room categories for dropdowns
        const [customers, hotels, categories, reservationCategories] = await Promise.all([
            fetchAPI('/api/customers'),
            fetchAPI('/api/hotels'),
            fetchAPI('/api/room-categories'),
            fetchAPI(`/api/reservations/${reservation.Reservation_Id}/categories`)
        ]);
        
        populateDropdown('reservation-customer', customers, 'Customer_Id', 'Name', reservation.Customer_Id);
        populateDropdown('reservation-hotel', hotels, 'Hotel_Id', 'Name', reservation.Hotel_Id);
        
        // Populate categories as checkboxes
        const categoriesContainer = document.getElementById('reservation-categories-container');
        categoriesContainer.innerHTML = '';
        
        const reservationCategoryIds = reservationCategories.map(c => c.Category_Id);
        
        categories.forEach(category => {
            const wrapper = document.createElement('div');
            wrapper.className = 'category-checkbox-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `category-${category.Category_Id}`;
            checkbox.name = 'categories';
            checkbox.value = category.Category_Id;
            checkbox.checked = reservationCategoryIds.includes(category.Category_Id);
            
            const label = document.createElement('label');
            label.htmlFor = `category-${category.Category_Id}`;
            label.textContent = `${category.Type} - $${parseFloat(category.Price).toFixed(2)}`;
            
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            categoriesContainer.appendChild(wrapper);
        });
        
        openModal('reservation-modal');
    } catch (error) {
        console.error('Failed to load reservation form data:', error);
    }
}

function updatePeriod() {
    const startDate = new Date(document.getElementById('reservation-start').value);
    const endDate = new Date(document.getElementById('reservation-end').value);
    
    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Calculate the difference in days
        const timeDiff = endDate - startDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff > 0) {
            document.getElementById('reservation-period').value = daysDiff;
        } else {
            document.getElementById('reservation-period').value = '';
        }
    }
}

async function handleReservationSubmit(event) {
    event.preventDefault();
    
    const reservationId = document.getElementById('reservation-id').value;
    
    // Get selected categories
    const selectedCategories = Array.from(
        document.querySelectorAll('input[name="categories"]:checked')
    ).map(input => parseInt(input.value));
    
    const data = {
        Start_Date: document.getElementById('reservation-start').value,
        End_Date: document.getElementById('reservation-end').value,
        Period: parseInt(document.getElementById('reservation-period').value),
        Customer_Id: document.getElementById('reservation-customer').value,
        Hotel_Id: document.getElementById('reservation-hotel').value,
        categories: selectedCategories
    };
    
    try {
        if (reservationId) {
            // Update existing reservation
            await fetchAPI(`/api/reservations/${reservationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Reservation updated successfully');
        } else {
            // Add new reservation
            await fetchAPI('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Reservation added successfully');
        }
        
        closeModal(document.getElementById('reservation-modal'));
        loadReservations();
        loadDashboardData();
    } catch (error) {
        console.error('Failed to save reservation:', error);
    }
}

// --- INVOICE FUNCTIONS ---

async function loadInvoices() {
    try {
        const invoices = await fetchAPI('/api/invoices');
        
        const tableBody = document.querySelector('#invoices-table tbody');
        tableBody.innerHTML = '';
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.Invoice_Id}</td>
                <td>${invoice.Invoice_Description}</td>
                <td>$${parseFloat(invoice.Amount).toFixed(2)}</td>
                <td>${invoice.Status}</td>
                <td>${invoice.CustomerName}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${invoice.Invoice_Id}">Edit</button>
                    <button class="delete-btn" data-id="${invoice.Invoice_Id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Add event listeners to buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditInvoiceModal(invoice));
            deleteBtn.addEventListener('click', () => openDeleteConfirmModal('invoice', invoice.Invoice_Id));
        });
    } catch (error) {
        console.error('Failed to load invoices:', error);
    }
}

async function openAddInvoiceModal() {
    document.getElementById('invoice-modal-title').textContent = 'Add Invoice';
    document.getElementById('invoice-id').value = '';
    
    try {
        // Load customers for dropdown
        const customers = await fetchAPI('/api/customers');
        populateDropdown('invoice-customer', customers, 'Customer_Id', 'Name');
        
        openModal('invoice-modal');
    } catch (error) {
        console.error('Failed to load invoice form data:', error);
    }
}

async function openEditInvoiceModal(invoice) {
    document.getElementById('invoice-modal-title').textContent = 'Edit Invoice';
    document.getElementById('invoice-id').value = invoice.Invoice_Id;
    document.getElementById('invoice-description').value = invoice.Invoice_Description;
    document.getElementById('invoice-amount').value = invoice.Amount;
    document.getElementById('invoice-status').value = invoice.Status;
    
    try {
        // Load customers for dropdown
        const customers = await fetchAPI('/api/customers');
        populateDropdown('invoice-customer', customers, 'Customer_Id', 'Name', invoice.Customer_Id);
        
        openModal('invoice-modal');
    } catch (error) {
        console.error('Failed to load invoice form data:', error);
    }
}

async function handleInvoiceSubmit(event) {
    event.preventDefault();
    
    const invoiceId = document.getElementById('invoice-id').value;
    const data = {
        Invoice_Description: document.getElementById('invoice-description').value,
        Amount: parseFloat(document.getElementById('invoice-amount').value),
        Status: document.getElementById('invoice-status').value,
        Customer_Id: document.getElementById('invoice-customer').value
    };
    
    try {
        if (invoiceId) {
            // Update existing invoice
            await fetchAPI(`/api/invoices/${invoiceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Invoice updated successfully');
        } else {
            // Add new invoice
            await fetchAPI('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showNotification('Invoice added successfully');
        }
        
        closeModal(document.getElementById('invoice-modal'));
        loadInvoices();
    } catch (error) {
        console.error('Failed to save invoice:', error);
    }
}

// --- COMMON FUNCTIONS ---

function populateDropdown(selectId, data, valueField, textField, selectedValue = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        
        if (selectedValue !== null && item[valueField] == selectedValue) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
}

// --- DELETE FUNCTIONALITY ---

let deleteTarget = { type: null, id: null };

function openDeleteConfirmModal(type, id) {
    deleteTarget.type = type;
    deleteTarget.id = id;
    
    let message;
    switch (type) {
        case 'customer':
            message = 'Are you sure you want to delete this customer? This will also delete all associated reservations and invoices.';
            break;
        case 'hotel':
            message = 'Are you sure you want to delete this hotel? This will also delete all associated rooms and reservations.';
            break;
        case 'category':
            message = 'Are you sure you want to delete this room category? This will also affect rooms using this category.';
            break;
        case 'room':
            message = 'Are you sure you want to delete this room?';
            break;
        case 'reservation':
            message = 'Are you sure you want to delete this reservation?';
            break;
        case 'invoice':
            message = 'Are you sure you want to delete this invoice?';
            break;
        default:
            message = 'Are you sure you want to delete this item?';
    }
    
    document.getElementById('confirm-message').textContent = message;
    openModal('confirm-modal');
}

async function handleConfirmDelete() {
    if (!deleteTarget.type || !deleteTarget.id) return;
    
    let endpoint;
    let reloadFunction;
    
    switch (deleteTarget.type) {
        case 'customer':
            endpoint = `/api/customers/${deleteTarget.id}`;
            reloadFunction = loadCustomers;
            break;
        case 'hotel':
            endpoint = `/api/hotels/${deleteTarget.id}`;
            reloadFunction = loadHotels;
            break;
        case 'category':
            endpoint = `/api/room-categories/${deleteTarget.id}`;
            reloadFunction = loadRoomCategories;
            break;
        case 'room':
            endpoint = `/api/rooms/${deleteTarget.id}`;
            reloadFunction = loadRooms;
            break;
        case 'reservation':
            endpoint = `/api/reservations/${deleteTarget.id}`;
            reloadFunction = loadReservations;
            break;
        case 'invoice':
            endpoint = `/api/invoices/${deleteTarget.id}`;
            reloadFunction = loadInvoices;
            break;
        default:
            return;
    }
    
    try {
        await fetchAPI(endpoint, { method: 'DELETE' });
        closeModal(document.getElementById('confirm-modal'));
        showNotification(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully`);
        reloadFunction();
        loadDashboardData();
    } catch (error) {
        console.error(`Failed to delete ${deleteTarget.type}:`, error);
    }
    
    deleteTarget = { type: null, id: null };
}

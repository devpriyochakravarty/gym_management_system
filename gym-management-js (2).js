// IndexedDB setup
let db;
const dbName = 'GymManagementDB';
const dbVersion = 1;



const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('IndexedDB connected successfully');
        resolve(db);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        // Create object stores
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('username', 'username', { unique: true });
    
        // Add a default admin user
        usersStore.add({
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        });
    
        db.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('feePackages', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('supplements', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('dietPlans', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        // Create object stores
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('username', 'username', { unique: true });

        db.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('feePackages', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('supplements', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('dietPlans', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    };
});

// Utility functions for CRUD operations
const addData = (storeName, data) => {
    return dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

const getData = (storeName, id) => {
    return dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

const updateData = (storeName, id, data) => {
    return dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...data, id });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

const deleteData = (storeName, id) => {
    return dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

const getAllData = (storeName) => {
    return dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
};

// Logging system
const log = (action, details) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${action}: ${JSON.stringify(details)}`);
    // Store logs in IndexedDB
    addData('logs', { timestamp, action, details });
};

// Authentication
const login = async (username, password) => {
    try {
        const db = await dbPromise;
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('username');
        const request = index.get(username);

        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const user = event.target.result;
                if (user && user.password === password) {
                    console.log('Login successful');
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    log('User logged in', { username });
                    resolve(user);
                } else {
                    console.log('Invalid credentials');
                    resolve(null);
                }
            };
            request.onerror = (event) => {
                console.error('Error during login:', event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
};

const registerUser = async (username, password, role) => {
    const userData = { username, password, role };
    const userId = await addData('users', userData);
    log('User registered', { username, role });
    return userId;
};

// Member management
const addMember = async (memberData) => {
    try {
        const memberId = await addData('members', memberData);
        log('Member added', { id: memberId });
        return memberId;
    } catch (error) {
        console.error('Error adding member:', error);
        throw error;
    }
};

const updateMember = async (id, memberData) => {
    try {
        await updateData('members', id, memberData);
        log('Member updated', { id });
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

const deleteMember = async (id) => {
    try {
        await deleteData('members', id);
        log('Member deleted', { id });
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
};

// Billing and fee management
const createBill = async (billData) => {
    try {
        const billId = await addData('bills', billData);
        log('Bill created', { id: billId });
        return billId;
    } catch (error) {
        console.error('Error creating bill:', error);
        throw error;
    }
};

const assignFeePackage = async (memberId, feePackageId) => {
    try {
        const member = await getData('members', memberId);
        member.feePackageId = feePackageId;
        await updateData('members', memberId, member);
        log('Fee package assigned', { memberId, feePackageId });
    } catch (error) {
        console.error('Error assigning fee package:', error);
        throw error;
    }
};

// Notification system
const createNotification = async (notificationData) => {
    try {
        const notificationId = await addData('notifications', notificationData);
        log('Notification created', { id: notificationId });
        return notificationId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Reporting and data export
const generateReport = async (reportType) => {
    try {
        let reportData;
        switch (reportType) {
            case 'members':
            case 'bills':
            case 'feePackages':
            case 'supplements':
            case 'dietPlans':
                reportData = await getAllData(reportType);
                break;
            default:
                throw new Error('Invalid report type');
        }
        log('Report generated', { reportType });
        return reportData;
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};

const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Supplement store
const addSupplementToStore = async (supplementData) => {
    try {
        const supplementId = await addData('supplements', supplementData);
        log('Supplement added to store', { id: supplementId });
        return supplementId;
    } catch (error) {
        console.error('Error adding supplement to store:', error);
        throw error;
    }
};

// Diet details
const addDietPlan = async (dietPlanData) => {
    try {
        const dietPlanId = await addData('dietPlans', dietPlanData);
        log('Diet plan added', { id: dietPlanId });
        return dietPlanId;
    } catch (error) {
        console.error('Error adding diet plan:', error);
        throw error;
    }
};

// Search records
const searchRecords = async (query, storeName) => {
    try {
        const allRecords = await getAllData(storeName);
        const results = allRecords.filter(record => 
            record.name && record.name.toLowerCase().includes(query.toLowerCase())
        );
        log('Search performed', { query, storeName });
        return results;
    } catch (error) {
        console.error('Error searching records:', error);
        throw error;
    }
};

// Event listeners and UI interactions
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const addMemberForm = document.getElementById('add-member-form');
    const createBillForm = document.getElementById('create-bill-form');
    const addSupplementForm = document.getElementById('add-supplement-form');
    const addDietPlanForm = document.getElementById('add-diet-plan-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = await login(username, password);
        if (user) {
            showDashboard(user.role);
        } else {
            alert('Invalid credentials');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        await registerUser(username, password, role);
        alert('User registered successfully');
    });

    addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const memberData = {
            name: document.getElementById('member-name').value,
            email: document.getElementById('member-email').value,
            phone: document.getElementById('member-phone').value,
            joinDate: document.getElementById('member-join-date').value
        };
        await addMember(memberData);
        alert('Member added successfully');
    });

    createBillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const billData = {
            memberId: parseInt(document.getElementById('bill-member-id').value),
            amount: parseFloat(document.getElementById('bill-amount').value),
            date: document.getElementById('bill-date').value,
            description: document.getElementById('bill-description').value
        };
        await createBill(billData);
        alert('Bill created successfully');
    });

    addSupplementForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supplementData = {
            name: document.getElementById('supplement-name').value,
            description: document.getElementById('supplement-description').value,
            price: parseFloat(document.getElementById('supplement-price').value)
        };
        await addSupplementToStore(supplementData);
        alert('Supplement added successfully');
    });

    addDietPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dietPlanData = {
            name: document.getElementById('diet-plan-name').value,
            description: document.getElementById('diet-plan-description').value,
            calories: parseInt(document.getElementById('diet-plan-calories').value)
        };
        await addDietPlan(dietPlanData);
        alert('Diet plan added successfully');
    });
});

// Function to show appropriate dashboard based on user role
const showDashboard = (role) => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    
    if (role === 'admin') {
        document.getElementById('admin-dashboard').style.display = 'block';
    } else if (role === 'member') {
        document.getElementById('member-dashboard').style.display = 'block';
    } else { 
        document.getElementById('user-dashboard').style.display = 'block';
    }
};

// Initialize the application
const initApp = async () => {
    try {
        await dbPromise;
        console.log('Database initialized');
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
            showDashboard(currentUser.role);
        } else {
            document.getElementById('login-form').style.display = 'block';
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

initApp();
// Get user from localStorage
export const getUser = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

// Get token from localStorage
export const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// Set user and token
export const setAuth = (token, user) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }
};

// Clear auth
export const clearAuth = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Check user role
export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin';
};

export const isDeveloper = () => {
    const user = getUser();
    return user?.role === 'developer';
};

export const isBuyer = () => {
    const user = getUser();
    return user?.role === 'buyer';
};

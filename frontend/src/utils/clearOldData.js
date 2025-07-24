// Utility function to clear old localStorage data
export const clearOldUserData = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // If user data has old format (_id instead of userID), clear it
            if (user && user._id && !user.userID) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('cart');
                return true; // Data was cleared
            }
        }
        return false; // No old data found
    } catch (error) {
        console.error('Error checking user data:', error);
        // If there's an error parsing, clear the data to be safe
        localStorage.removeItem('user');
        return true;
    }
};

// Function to check if user is properly logged in with new format
export const isUserLoggedIn = () => {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            return false;
        }

        const user = JSON.parse(userStr);
        return user && user.userID;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}; 
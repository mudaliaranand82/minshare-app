/**
 * Admin Configuration
 * 
 * Add email addresses here to grant admin access.
 * Admins can view the Admin dashboard and manage member allocations.
 */

export const ADMIN_EMAILS: string[] = [
    'mudaliaranand@gmail.com',
    // Add more admin emails below:
    // 'another.admin@gmail.com',
];

/**
 * Check if an email has admin privileges
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

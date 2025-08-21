// Base URL for API
export const BASE_URL = 'https://invoice-backend-604217703209.asia-south1.run.app';

// Base endpoints for Team API
// Note: These endpoints don't exist in the current backend
// They are placeholders for future implementation
export const TEAM_API = {
  GET_ALL: `${BASE_URL}/api/team-members`, // Get all team members
  GET_BY_ID: `${BASE_URL}/api/team-members`, // Get team member by ID
  CREATE: `${BASE_URL}/api/team-members`, // Create new team member
  UPDATE: `${BASE_URL}/api/team-members`, // Update team member
  DELETE: `${BASE_URL}/api/team-members`, // Delete team member
  METRICS: `${BASE_URL}/api/team-metrics`, // Get team metrics
  INVITE: `${BASE_URL}/api/team/invite`, // Invite team member
  ROLES: `${BASE_URL}/api/team/roles`, // Get available roles
}; 
import axios from 'axios';
import { TEAM_API } from '../routes/team';

// Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  dateJoined: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  permissions?: string[];
}

export interface TeamMemberCreate {
  name: string;
  role: string;
  email: string;
  phone: string;
  permissions?: string[];
}

export interface TeamMemberUpdate {
  name?: string;
  role?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
  permissions?: string[];
}

export interface TeamFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  roles: { role: string; count: number }[];
}

/**
 * Get all team members
 */
export const getTeamMembers = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  filters?: TeamFilters
): Promise<{ members: TeamMember[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };
    
    const response = await axios.get(TEAM_API.GET_ALL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

/**
 * Get team member by ID
 */
export const getTeamMember = async (token: string, memberId: string): Promise<TeamMember> => {
  try {
    const response = await axios.get(`${TEAM_API.GET_BY_ID}/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
};

/**
 * Create new team member
 */
export const createTeamMember = async (token: string, member: TeamMemberCreate): Promise<TeamMember> => {
  try {
    const response = await axios.post(TEAM_API.CREATE, member, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
};

/**
 * Update team member
 */
export const updateTeamMember = async (
  token: string,
  memberId: string,
  updates: TeamMemberUpdate
): Promise<TeamMember> => {
  try {
    const response = await axios.put(`${TEAM_API.UPDATE}/${memberId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (token: string, memberId: string): Promise<{ success: boolean }> => {
  try {
    const response = await axios.delete(`${TEAM_API.DELETE}/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

/**
 * Get team metrics
 */
export const getTeamMetrics = async (token: string): Promise<TeamMetrics> => {
  try {
    const response = await axios.get(TEAM_API.METRICS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    throw error;
  }
};

/**
 * Invite team member by email
 */
export const inviteTeamMember = async (token: string, email: string, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(TEAM_API.INVITE, { email, role }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }
};

/**
 * Get available roles
 */
export const getAvailableRoles = async (token: string): Promise<string[]> => {
  try {
    const response = await axios.get(TEAM_API.ROLES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available roles:', error);
    throw error;
  }
}; 
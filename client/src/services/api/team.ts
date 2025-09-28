import api from '@/lib/api';
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
  page: number = 1,
  limit: number = 10,
  filters?: TeamFilters
): Promise<{ data: TeamMember[]; total: number; page: number; totalPages: number }> => {
  try {
    const params: any = { page, limit, ...filters };

    const response = await api.get(TEAM_API.GET_ALL, {
      params,
    });

    const { data, pagination } = response.data.data || {};

    // Handle empty or invalid data
    if (!Array.isArray(data) || data.length === 0) {
      return {
        data: [],
        total: pagination?.totalItems || 0,
        page: pagination?.currentPage || 1,
        totalPages: pagination?.totalPages || 0,
      };
    }

    return {
      data,
      total: pagination?.totalItems || 0,
      page: pagination?.currentPage || 1,
      totalPages: pagination?.totalPages || 0,
    };
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

/**
 * Get team member by ID
 */
export const getTeamMember = async (memberId: string): Promise<TeamMember> => {
  try {
    const response = await api.get(`${TEAM_API.GET_BY_ID}/${memberId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
};

/**
 * Create new team member
 */
export const createTeamMember = async (member: TeamMemberCreate): Promise<TeamMember> => {
  try {
    const response = await api.post(TEAM_API.CREATE, member);
    return response.data.data;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
};

/**
 * Update team member
 */
export const updateTeamMember = async (
  memberId: string,
  updates: TeamMemberUpdate
): Promise<TeamMember> => {
  try {
    const response = await api.put(`${TEAM_API.UPDATE}/${memberId}`, updates);
    return response.data.data;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (memberId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`${TEAM_API.DELETE}/${memberId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

/**
 * Get team metrics
 */
export const getTeamMetrics = async (): Promise<TeamMetrics> => {
  try {
    const response = await api.get(TEAM_API.METRICS);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    throw error;
  }
};

/**
 * Invite team member by email
 */
export const inviteTeamMember = async (email: string, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(TEAM_API.INVITE, { email, role });
    return response.data.data;
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }
};

/**
 * Get available roles
 */
export const getAvailableRoles = async (): Promise<string[]> => {
  try {
    const response = await api.get(TEAM_API.ROLES);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available roles:', error);
    throw error;
  }
}; 
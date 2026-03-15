/**
 * Alert Service for Flood Alert System
 * Handles communication with the backend API for alerts and flood reports
 */

const API_BASE_URL = 'http://localhost:8080/api';

export interface Alert {
  id: number;
  floodReportId: number;
  recipientId: number;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'DISMISSED' | 'ACKNOWLEDGED';
  createdAt: string;
  readAt?: string;
  distanceKm: number;
  areaName: string;
  floodSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface FloodReport {
  id: number;
  reportedById: number;
  latitude: number;
  longitude: number;
  description: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  waterLevel: number;
  areaName: string;
  reportTime: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  latitude: number;
  longitude: number;
  notificationsEnabled: boolean;
}

class AlertService {
  /**
   * Get all alerts for a specific user
   */
  async getAlertsForUser(userId: number): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  /**
   * Get unread alert count for a user
   */
  async getUnreadAlertCount(userId: number): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/user/${userId}/unread-count`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark an alert as read
   */
  async markAlertAsRead(alertId: number): Promise<Alert | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return null;
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: number): Promise<Alert | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/dismiss`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return null;
    }
  }

  /**
   * Get all active flood reports
   */
  async getActiveFloodReports(): Promise<FloodReport[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/floods/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active flood reports:', error);
      return [];
    }
  }

  /**
   * Get flood reports in a specific area
   */
  async getFloodsInArea(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
  ): Promise<FloodReport[]> {
    try {
      const params = new URLSearchParams({
        minLat: minLat.toString(),
        maxLat: maxLat.toString(),
        minLon: minLon.toString(),
        maxLon: maxLon.toString(),
      });
      const response = await fetch(`${API_BASE_URL}/floods/area?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching floods in area:', error);
      return [];
    }
  }

  /**
   * Report a new flood
   */
  async reportFlood(
    reportedById: number,
    latitude: number,
    longitude: number,
    description: string,
    waterLevel: number,
    areaName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/floods/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedById,
          latitude,
          longitude,
          description,
          waterLevel,
          areaName,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error reporting flood:', error);
      return false;
    }
  }

  /**
   * Register a new user
   */
  async registerUser(
    name: string,
    email: string,
    latitude: number,
    longitude: number
  ): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          latitude,
          longitude,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Update user location
   */
  async updateUserLocation(
    userId: number,
    latitude: number,
    longitude: number
  ): Promise<User | null> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/location?${params}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating user location:', error);
      return null;
    }
  }

  /**
   * Toggle notifications for user
   */
  async toggleNotifications(userId: number, enabled: boolean): Promise<User | null> {
    try {
      const params = new URLSearchParams({
        enabled: enabled.toString(),
      });
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/notifications?${params}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return null;
    }
  }
}

export default new AlertService();

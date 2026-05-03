/**
 * Alert Service for Flood Alert System
 * Handles all communication with the backend API for alerts, flood reports, and user management.
 * This service acts as a singleton that manages HTTP requests to the flood alert backend.
 */

// API endpoint base URL - connects to local backend server
const API_BASE_URL = "http://localhost:8080/api";

/**
 * Alert interface represents a flood alert notification sent to users
 * Each alert contains information about a specific flood event and its severity
 */
export interface Alert {
  id: number; // Unique identifier for the alert
  floodReportId: number; // ID of the associated flood report
  recipientId: number; // ID of the user who received this alert
  title: string; // Alert title/summary
  message: string; // Detailed alert message
  status: "UNREAD" | "READ" | "DISMISSED" | "ACKNOWLEDGED"; // Current status of the alert
  createdAt: string; // ISO timestamp when alert was created
  readAt?: string; // ISO timestamp when alert was marked as read (optional)
  distanceKm: number; // Distance from user's location to flood area in kilometers
  areaName: string; // Name of the affected area/region
  floodSeverity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; // Severity level of the flood
}

/**
 * FloodReport interface represents a flood event reported by users
 * Contains location, severity, and description of the flood incident
 */
export interface FloodReport {
  id: number; // Unique identifier for the flood report
  reportedById: number; // ID of the user who reported the flood
  latitude: number; // Geographic latitude of the flood location
  longitude: number; // Geographic longitude of the flood location
  description: string; // User's description of the flood situation
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; // Severity assessment of the flood
  waterLevel: number; // Current water level measurement
  areaName: string; // Name of the affected region/area
  reportTime: string; // ISO timestamp when the report was submitted
}

/**
 * User interface represents an application user and their preferences
 * Stores user location and notification settings for alert delivery
 */
export interface User {
  id: number; // Unique identifier for the user
  name: string; // User's full name
  email: string; // User's email address for notifications
  phoneNumber?: string; // Optional phone number for SMS alerts
  latitude: number; // User's current latitude for location-based alerts
  longitude: number; // User's current longitude for location-based alerts
  notificationsEnabled: boolean; // Whether the user has enabled notifications
}

/**
 * AlertService class provides methods for interacting with the flood alert backend API.
 * All methods handle HTTP requests and include error handling with fallback returns.
 */
class AlertService {
  /**
   * Retrieves all alerts (read/unread/dismissed) for a specific user
   * @param userId - The ID of the user to fetch alerts for
   * @returns Promise<Alert[]> - Array of Alert objects, empty array on error
   */
  async getAlertsForUser(userId: number): Promise<Alert[]> {
    try {
      // Fetch all alerts for the user from the backend
      const response = await fetch(`${API_BASE_URL}/alerts/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse and return the alert data
      return await response.json();
    } catch (error) {
      // Log error and return empty array to prevent app crash
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Gets the count of unread alerts for a user
   * Useful for displaying notification badges in the UI
   * @param userId - The ID of the user
   * @returns Promise<number> - Number of unread alerts, 0 on error
   */
  async getUnreadAlertCount(userId: number): Promise<number> {
    try {
      // Fetch the count of unread alerts from backend
      const response = await fetch(
        `${API_BASE_URL}/alerts/user/${userId}/unread-count`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the count as a number
      return await response.json();
    } catch (error) {
      // Return 0 on error to avoid breaking UI
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  /**
   * Marks a specific alert as read by the user
   * @param alertId - The ID of the alert to mark as read
   * @returns Promise<Alert | null> - Updated Alert object or null on error
   */
  async markAlertAsRead(alertId: number): Promise<Alert | null> {
    try {
      // Send PUT request to update alert status to READ
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the updated alert from server
      return await response.json();
    } catch (error) {
      // Log error and return null on failure
      console.error("Error marking alert as read:", error);
      return null;
    }
  }

  /**
   * Dismisses/hides an alert from the user's view
   * @param alertId - The ID of the alert to dismiss
   * @returns Promise<Alert | null> - Updated Alert object or null on error
   */
  async dismissAlert(alertId: number): Promise<Alert | null> {
    try {
      // Send PUT request to update alert status to DISMISSED
      const response = await fetch(
        `${API_BASE_URL}/alerts/${alertId}/dismiss`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the updated alert from server
      return await response.json();
    } catch (error) {
      // Log error and return null on failure
      console.error("Error dismissing alert:", error);
      return null;
    }
  }

  /**
   * Retrieves all currently active/ongoing flood reports
   * @returns Promise<FloodReport[]> - Array of active FloodReport objects, empty array on error
   */
  async getActiveFloodReports(): Promise<FloodReport[]> {
    try {
      // Fetch all active flood reports from the backend
      const response = await fetch(`${API_BASE_URL}/floods/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse and return the flood report data
      return await response.json();
    } catch (error) {
      // Log error and return empty array to prevent app crash
      console.error("Error fetching active flood reports:", error);
      return [];
    }
  }

  /**
   * Retrieves flood reports within a geographic bounding box
   * Used for map-based views to show floods in the user's viewport
   * @param minLat - Minimum latitude of the bounding box
   * @param maxLat - Maximum latitude of the bounding box
   * @param minLon - Minimum longitude of the bounding box
   * @param maxLon - Maximum longitude of the bounding box
   * @returns Promise<FloodReport[]> - Array of FloodReport objects in the area, empty array on error
   */
  async getFloodsInArea(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
  ): Promise<FloodReport[]> {
    try {
      // Create query parameters for the bounding box
      const params = new URLSearchParams({
        minLat: minLat.toString(),
        maxLat: maxLat.toString(),
        minLon: minLon.toString(),
        maxLon: maxLon.toString(),
      });
      // Fetch floods within the specified area
      const response = await fetch(`${API_BASE_URL}/floods/area?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse and return the flood report data
      return await response.json();
    } catch (error) {
      // Log error and return empty array
      console.error("Error fetching floods in area:", error);
      return [];
    }
  }

  /**
   * Submits a new flood report to the backend
   * Called when a user observes and wants to report a flood event
   * @param reportedById - ID of the user submitting the report
   * @param latitude - Geographic latitude of the flood location
   * @param longitude - Geographic longitude of the flood location
   * @param description - Description of the flood situation
   * @param waterLevel - Measured water level
   * @param areaName - Name of the affected area
   * @returns Promise<boolean> - True if successful, false on error
   */
  async reportFlood(
    reportedById: number,
    latitude: number,
    longitude: number,
    description: string,
    waterLevel: number,
    areaName: string,
  ): Promise<boolean> {
    try {
      // Send POST request with flood report data
      const response = await fetch(`${API_BASE_URL}/floods/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      // Return true on successful submission
      return true;
    } catch (error) {
      // Log error and return false on failure
      console.error("Error reporting flood:", error);
      return false;
    }
  }

  /**
   * Registers a new user in the system
   * @param name - User's full name
   * @param email - User's email address
   * @param latitude - User's initial latitude location
   * @param longitude - User's initial longitude location
   * @returns Promise<User | null> - Created User object or null on error
   */
  async registerUser(
    name: string,
    email: string,
    latitude: number,
    longitude: number,
  ): Promise<User | null> {
    try {
      // Send POST request to register new user
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      // Return the created user object from server
      return await response.json();
    } catch (error) {
      // Log error and return null on registration failure
      console.error("Error registering user:", error);
      return null;
    }
  }

  /**
   * Fetches user information by ID
   * @param userId - The ID of the user to retrieve
   * @returns Promise<User | null> - User object or null if not found/error
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      // Fetch user details from backend
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the user object
      return await response.json();
    } catch (error) {
      // Log error and return null on failure
      console.error("Error fetching user:", error);
      return null;
    }
  }

  /**
   * Updates a user's geographic location
   * Called periodically to keep user location current for proximity-based alerts
   * @param userId - The ID of the user
   * @param latitude - New latitude value
   * @param longitude - New longitude value
   * @returns Promise<User | null> - Updated User object or null on error
   */
  async updateUserLocation(
    userId: number,
    latitude: number,
    longitude: number,
  ): Promise<User | null> {
    try {
      // Prepare location query parameters
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });
      // Send PUT request to update location
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/location?${params}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the updated user object
      return await response.json();
    } catch (error) {
      // Log error and return null on failure
      console.error("Error updating user location:", error);
      return null;
    }
  }

  /**
   * Enables or disables notifications for a user
   * @param userId - The ID of the user
   * @param enabled - True to enable notifications, false to disable
   * @returns Promise<User | null> - Updated User object or null on error
   */
  async toggleNotifications(
    userId: number,
    enabled: boolean,
  ): Promise<User | null> {
    try {
      // Prepare notification preference parameter
      const params = new URLSearchParams({
        enabled: enabled.toString(),
      });
      // Send PUT request to update notification preference
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/notifications?${params}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return the updated user object
      return await response.json();
    } catch (error) {
      // Log error and return null on failure
      console.error("Error toggling notifications:", error);
      return null;
    }
  }
}

// Export a singleton instance of AlertService for use throughout the app
export default new AlertService();

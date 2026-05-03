/**
 * Local Notification Service
 * Manages displaying local notifications to users and persisting notification history.
 * Uses React Native Alert for alerts and AsyncStorage for local persistence.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert as RNAlert } from "react-native";

/**
 * NotificationData interface represents a stored notification with all relevant flood alert information
 * Used for persistent storage of notification history in AsyncStorage
 */
export interface NotificationData {
  id: string; // Unique identifier for the notification
  title: string; // Notification title/headline
  body: string; // Notification message body
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; // Severity level of the alert
  timestamp: number; // Unix timestamp when notification was received
  distanceKm: number; // Distance from user to flood location
  areaName: string; // Name of the affected area
}

/**
 * NotificationService class manages all notification functionality including display and persistence
 * Provides severity-based styling and local storage for notification history
 */
class NotificationService {
  /**
   * Displays a local alert notification to the user with action buttons
   * Uses React Native Alert which provides native alert dialogs on mobile
   * @param title - The title of the alert notification
   * @param message - The message body of the notification
   * @param severity - The severity level (LOW, MODERATE, HIGH, CRITICAL) - defaults to MODERATE
   */
  showAlert(title: string, message: string, severity: string = "MODERATE") {
    // Prepend severity icon to the alert title
    const alertTitle = this.getSeverityIcon(severity) + " " + title;
    // Display native alert with two action buttons
    RNAlert.alert(alertTitle, message, [
      {
        text: "Dismiss",
        onPress: () => console.log("Notification dismissed"),
      },
      {
        text: "View",
        onPress: () => console.log("View alert details"),
      },
    ]);
  }

  /**
   * Maps severity level to a Unicode emoji icon for visual representation
   * Used in alerts and UI components to quickly indicate alert severity
   * @param severity - The severity level (LOW, MODERATE, HIGH, CRITICAL)
   * @returns An emoji character representing the severity level
   */
  private getSeverityIcon(severity: string): string {
    // Return appropriate emoji based on severity
    switch (severity) {
      case "LOW":
        return "🟡"; // Yellow circle for low severity
      case "MODERATE":
        return "🟠"; // Orange circle for moderate severity
      case "HIGH":
        return "🔴"; // Red circle for high severity
      case "CRITICAL":
        return "🚨"; // Siren for critical severity
      default:
        return "⚠️"; // Warning sign as fallback
    }
  }

  /**
   * Persists a notification to local storage for history/retrieval
   * Maintains a maximum of 50 notifications; older ones are removed when limit is exceeded
   * @param notification - The NotificationData object to store
   * @returns Promise that resolves when storage is complete
   */
  async saveNotification(notification: NotificationData): Promise<void> {
    try {
      // Retrieve existing notifications from storage
      const existing = await this.getStoredNotifications();
      // Add the new notification
      existing.push(notification);
      // Enforce maximum notification history limit (50 notifications)
      // Remove the oldest notification (first in array) if limit exceeded
      if (existing.length > 50) {
        existing.shift();
      }
      // Persist updated notifications array to storage
      await AsyncStorage.setItem("notifications", JSON.stringify(existing));
    } catch (error) {
      // Log error but don't throw - storage failure shouldn't crash the app
      console.error("Error saving notification:", error);
    }
  }

  /**
   * Retrieves all stored notifications from local storage
   * Returns the complete notification history for the user
   * @returns Promise<NotificationData[]> - Array of stored notifications, empty array if none exist or on error
   */
  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      // Retrieve the JSON string from storage
      const data = await AsyncStorage.getItem("notifications");
      // Parse JSON or return empty array if no data exists
      return data ? JSON.parse(data) : [];
    } catch (error) {
      // Log error and return empty array on retrieval failure
      console.error("Error retrieving notifications:", error);
      return [];
    }
  }

  /**
   * Clears all stored notifications from local storage
   * Useful for cleanup when user logs out or wants to reset history
   * @returns Promise that resolves when storage is cleared
   */
  async clearNotifications(): Promise<void> {
    try {
      // Remove all notifications from storage
      await AsyncStorage.removeItem("notifications");
    } catch (error) {
      // Log error but don't throw - clearing failure shouldn't crash the app
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Gets the text color for a severity level used in UI components
   * Returns hex color codes that correspond to alert severity levels
   * Used to color alert titles, badges, and severity indicators
   * @param severity - The severity level (LOW, MODERATE, HIGH, CRITICAL)
   * @returns Hex color code string for the severity level
   */
  getSeverityColor(severity: string): string {
    // Return appropriate text color based on severity
    switch (severity) {
      case "LOW":
        return "#FFD700"; // Gold
      case "MODERATE":
        return "#FF8C00"; // Dark Orange
      case "HIGH":
        return "#FF4500"; // Red Orange
      case "CRITICAL":
        return "#DC143C"; // Crimson Red
      default:
        return "#999999"; // Gray as fallback
    }
  }

  /**
   * Gets the background color for a severity level used in UI components
   * Returns light/pastel versions of severity colors for backgrounds and cards
   * Paired with getSeverityColor for readable text-on-background combinations
   * @param severity - The severity level (LOW, MODERATE, HIGH, CRITICAL)
   * @returns Hex color code string for the background color
   */
  getSeverityBgColor(severity: string): string {
    // Return appropriate background color based on severity
    switch (severity) {
      case "LOW":
        return "#FFFACD"; // Light gold
      case "MODERATE":
        return "#FFE4B5"; // Light orange
      case "HIGH":
        return "#FFE4E1"; // Light red
      case "CRITICAL":
        return "#FFB6C1"; // Light crimson
      default:
        return "#F5F5F5"; // Light gray as fallback
    }
  }
}

// Export a singleton instance of NotificationService for use throughout the app
export default new NotificationService();

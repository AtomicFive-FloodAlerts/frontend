/**
 * Local Notification Service
 * Handles displaying local notifications to users
 */

import { Alert as RNAlert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  distanceKm: number;
  areaName: string;
}

class NotificationService {
  /**
   * Show a local notification alert
   */
  showAlert(title: string, message: string, severity: string = 'MODERATE') {
    const alertTitle = this.getSeverityIcon(severity) + ' ' + title;
    RNAlert.alert(alertTitle, message, [
      {
        text: 'Dismiss',
        onPress: () => console.log('Notification dismissed'),
      },
      {
        text: 'View',
        onPress: () => console.log('View alert details'),
      },
    ]);
  }

  /**
   * Get icon for severity level
   */
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'LOW':
        return '🟡';
      case 'MODERATE':
        return '🟠';
      case 'HIGH':
        return '🔴';
      case 'CRITICAL':
        return '🚨';
      default:
        return '⚠️';
    }
  }

  /**
   * Store notifications locally
   */
  async saveNotification(notification: NotificationData): Promise<void> {
    try {
      const existing = await this.getStoredNotifications();
      existing.push(notification);
      // Keep only last 50 notifications
      if (existing.length > 50) {
        existing.shift();
      }
      await AsyncStorage.setItem('notifications', JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Get stored notifications
   */
  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const data = await AsyncStorage.getItem('notifications');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
  }

  /**
   * Clear stored notifications
   */
  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get severity color for UI
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'LOW':
        return '#FFD700'; // Gold
      case 'MODERATE':
        return '#FF8C00'; // Dark Orange
      case 'HIGH':
        return '#FF4500'; // Red Orange
      case 'CRITICAL':
        return '#DC143C'; // Crimson Red
      default:
        return '#999999'; // Gray
    }
  }

  /**
   * Get severity background color for UI
   */
  getSeverityBgColor(severity: string): string {
    switch (severity) {
      case 'LOW':
        return '#FFFACD'; // Light gold
      case 'MODERATE':
        return '#FFE4B5'; // Light orange
      case 'HIGH':
        return '#FFE4E1'; // Light red
      case 'CRITICAL':
        return '#FFB6C1'; // Light crimson
      default:
        return '#F5F5F5'; // Light gray
    }
  }
}

export default new NotificationService();

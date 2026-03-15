/**
 * AlertCard Component - Displays individual alert information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Alert as AlertData } from './alertService';
import notificationService from './notificationService';
import alertService from './alertService';

interface AlertCardProps {
  alert: AlertData;
  onDismiss: (alertId: number) => void;
  onRead: (alertId: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onRead,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDismiss = async () => {
    await alertService.dismissAlert(alert.id);
    onDismiss(alert.id);
  };

  const handleMarkRead = async () => {
    if (alert.status === 'UNREAD') {
      await alertService.markAlertAsRead(alert.id);
      onRead(alert.id);
    }
  };

  const severityColor = notificationService.getSeverityColor(alert.floodSeverity);
  const bgColor = notificationService.getSeverityBgColor(alert.floodSeverity);
  const severityIcon = getSeverityIcon(alert.floodSeverity);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        setIsExpanded(!isExpanded);
        handleMarkRead();
      }}
      style={[
        styles.card,
        { borderLeftColor: severityColor, backgroundColor: bgColor },
        alert.status !== 'UNREAD' && styles.readCard,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.severity, { color: severityColor }]}>
            {severityIcon} {alert.floodSeverity}
          </Text>
          <Text style={styles.title}>{alert.title}</Text>
        </View>
        <Text style={styles.distance}>{alert.distanceKm.toFixed(1)} km</Text>
      </View>

      <View style={styles.area}>
        <Text style={styles.areaText}>📍 {alert.areaName}</Text>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.message}>{alert.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(alert.createdAt).toLocaleString()}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.readButton]}
              onPress={handleMarkRead}
            >
              <Text style={styles.buttonText}>Mark as Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={handleDismiss}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isExpanded && <Text style={styles.preview}>{alert.message}</Text>}
    </TouchableOpacity>
  );
};

function getSeverityIcon(severity: string): string {
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

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 5,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  readCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 10,
  },
  severity: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  area: {
    marginBottom: 8,
  },
  areaText: {
    fontSize: 13,
    color: '#555',
  },
  preview: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  message: {
    fontSize: 13,
    color: '#333',
    lineHeight: 19,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButton: {
    backgroundColor: '#007AFF',
  },
  dismissButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

/**
 * Alerts Screen - Main screen showing all alerts for the user
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import alertService, { Alert } from '../services/alertService';
import { AlertCard } from '../components/AlertCard';
import notificationService from '../services/notificationService';

const MOCK_USER_ID = 1; // In production, get from auth/context

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsData, count] = await Promise.all([
        alertService.getAlertsForUser(MOCK_USER_ID),
        alertService.getUnreadAlertCount(MOCK_USER_ID),
      ]);
      setAlerts(alertsData);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, [loadAlerts]);

  // Load alerts when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts])
  );

  const handleDismiss = (alertId: number) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleRead = (alertId: number) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: 'READ' as const } : a
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleClearAll = async () => {
    // Dismiss all unread alerts
    for (const alert of alerts.filter(a => a.status === 'UNREAD')) {
      await alertService.dismissAlert(alert.id);
    }
    setAlerts(alerts.filter(a => a.status !== 'UNREAD'));
    setUnreadCount(0);
  };

  if (loading && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const criticalAlerts = alerts.filter(a => a.floodSeverity === 'CRITICAL');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚨 Flood Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {alerts.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {criticalAlerts.length > 0 && (
        <View style={styles.criticalBanner}>
          <Text style={styles.criticalText}>
            ⚠️ {criticalAlerts.length} CRITICAL alert(s) require immediate attention!
          </Text>
        </View>
      )}

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyText}>No active flood alerts</Text>
          <Text style={styles.emptySubtext}>
            You're safe! Stay vigilant and keep your location updated.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              onDismiss={handleDismiss}
              onRead={handleRead}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Alerts are updated in real-time</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  criticalBanner: {
    backgroundColor: '#FFE4E1',
    borderBottomWidth: 2,
    borderBottomColor: '#DC143C',
    padding: 12,
    marginBottom: 8,
  },
  criticalText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

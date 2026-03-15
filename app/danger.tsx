import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert as RNAlert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import alertService, { FloodReport, Alert } from "./services/alertService";
import notificationService from "./services/notificationService";

const MOCK_USER_ID = 1;
const MOCK_USER_LATITUDE = 40.7128;
const MOCK_USER_LONGITUDE = -74.006;

export default function DangerScreen() {
  const [activeFloods, setActiveFloods] = useState<FloodReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportData, setReportData] = useState({
    description: "",
    waterLevel: "50",
    areaName: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [floods, userAlerts] = await Promise.all([
        alertService.getActiveFloodReports(),
        alertService.getAlertsForUser(MOCK_USER_ID),
      ]);
      setActiveFloods(floods);
      setAlerts(userAlerts);
    } catch (error) {
      console.error("Error loading danger data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleSubmitReport = async () => {
    if (
      !reportData.description ||
      !reportData.areaName ||
      !reportData.waterLevel
    ) {
      RNAlert.alert("Validation Error", "Please fill all fields");
      return;
    }

    const waterLevel = parseInt(reportData.waterLevel);
    const success = await alertService.reportFlood(
      MOCK_USER_ID,
      MOCK_USER_LATITUDE,
      MOCK_USER_LONGITUDE,
      reportData.description,
      waterLevel,
      reportData.areaName,
    );

    if (success) {
      setReportModalVisible(false);
      setReportData({ description: "", waterLevel: "50", areaName: "" });
      RNAlert.alert(
        "Success",
        "Flood report submitted and alerts sent to nearby users!",
      );
      await loadData();
    } else {
      RNAlert.alert("Error", "Failed to submit flood report");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "🟡";
      case "MODERATE":
        return "🟠";
      case "HIGH":
        return "🔴";
      case "CRITICAL":
        return "🚨";
      default:
        return "⚠️";
    }
  };

  if (loading && activeFloods.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading danger zones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const criticalFloods = activeFloods.filter((f) => f.severity === "CRITICAL");
  const userAlerts = alerts.filter((a) => a.status === "UNREAD");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B6B"]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚠️ Danger Zones Map</Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setReportModalVisible(true)}
          >
            <Text style={styles.reportButtonText}>📍 Report Flood</Text>
          </TouchableOpacity>
        </View>

        {criticalFloods.length > 0 && (
          <View style={styles.criticalBanner}>
            <Text style={styles.criticalIcon}>🚨</Text>
            <View style={styles.criticalContent}>
              <Text style={styles.criticalTitle}>Critical Alert!</Text>
              <Text style={styles.criticalText}>
                {criticalFloods.length} CRITICAL flood(s) detected nearby
              </Text>
            </View>
          </View>
        )}

        {userAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>
              🔔 Your Active Alerts ({userAlerts.length})
            </Text>
            <FlatList
              data={userAlerts.slice(0, 3)}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.alertSummary,
                    {
                      borderLeftColor: notificationService.getSeverityColor(
                        item.floodSeverity,
                      ),
                    },
                  ]}
                >
                  <Text style={styles.alertSummaryTitle}>
                    {getSeverityIcon(item.floodSeverity)} {item.floodSeverity}
                  </Text>
                  <Text style={styles.alertSummaryArea}>{item.areaName}</Text>
                  <Text style={styles.alertSummaryDistance}>
                    {item.distanceKm.toFixed(1)} km away
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.floodsSection}>
          <Text style={styles.sectionTitle}>
            📍 Flood Reports ({activeFloods.length})
          </Text>

          {activeFloods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>No active flood zones</Text>
              <Text style={styles.emptySubtext}>Area appears to be safe</Text>
            </View>
          ) : (
            <FlatList
              data={activeFloods}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.floodCard,
                    {
                      borderLeftColor: notificationService.getSeverityColor(
                        item.severity,
                      ),
                    },
                  ]}
                >
                  <View style={styles.floodHeader}>
                    <Text style={styles.floodSeverity}>
                      {getSeverityIcon(item.severity)} {item.severity}
                    </Text>
                    <Text style={styles.floodWaterLevel}>
                      Water: {item.waterLevel} cm
                    </Text>
                  </View>
                  <Text style={styles.floodArea}>{item.areaName}</Text>
                  <Text style={styles.floodDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.floodTime}>
                    Reported: {new Date(item.reportTime).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report a Flood</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Area Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Central Park"
                value={reportData.areaName}
                onChangeText={(text) =>
                  setReportData({ ...reportData, areaName: text })
                }
              />

              <Text style={styles.label}>Water Level (cm) *</Text>
              <View style={styles.levelContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="50"
                  value={reportData.waterLevel}
                  onChangeText={(text) =>
                    setReportData({ ...reportData, waterLevel: text })
                  }
                  keyboardType="number-pad"
                />
                <View style={styles.levelIndicator}>
                  <Text style={styles.levelLabel}>
                    {parseInt(reportData.waterLevel) < 30
                      ? "LOW"
                      : parseInt(reportData.waterLevel) < 100
                        ? "MODERATE"
                        : parseInt(reportData.waterLevel) < 200
                          ? "HIGH"
                          : "CRITICAL"}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the flooding situation..."
                value={reportData.description}
                onChangeText={(text) =>
                  setReportData({ ...reportData, description: text })
                }
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  reportButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 6,
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  criticalBanner: {
    backgroundColor: "#FFE4E1",
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#DC143C",
    flexDirection: "row",
    gap: 12,
  },
  criticalIcon: {
    fontSize: 28,
  },
  criticalContent: {
    flex: 1,
  },
  criticalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC143C",
    marginBottom: 4,
  },
  criticalText: {
    fontSize: 12,
    color: "#333",
  },
  alertsSection: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  alertSummary: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  alertSummaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  alertSummaryArea: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  alertSummaryDistance: {
    fontSize: 11,
    color: "#999",
  },
  floodsSection: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  floodCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  floodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  floodSeverity: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  floodWaterLevel: {
    fontSize: 11,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: "#666",
  },
  floodArea: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  floodDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    marginBottom: 6,
  },
  floodTime: {
    fontSize: 10,
    color: "#999",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    textAlignVertical: "top",
  },
  levelContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  levelIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    minWidth: 60,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

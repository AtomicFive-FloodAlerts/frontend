import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const image = require("../assets/images/Flood.jpg");

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["left", "right"]}>
          <ImageBackground
            source={image}
            resizeMode="cover"
            style={styles.image}
          >
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Flood Alert System</Text>
              <Text style={styles.subtitle}>Stay Safe, Stay Informed</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>Real-Time</Text>
                  <Text style={styles.statLabel}>Alert Updates</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>Instant</Text>
                  <Text style={styles.statLabel}>Notifications</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>Location</Text>
                  <Text style={styles.statLabel}>Based Alerts</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>🚨 How It Works</Text>
                <Text style={styles.infoText}>
                  1. Check current danger zones in your area{"\n"}
                  2. Report floods as you see them{"\n"}
                  3. Receive alerts for nearby hazards{"\n"}
                  4. Stay safe with real-time information
                </Text>
              </View>

              <Text style={styles.footer}>
                Use the navigation below to explore
              </Text>
            </View>
          </ImageBackground>
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#e0e0e0",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
    gap: 8,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#ddd",
    fontSize: 11,
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
    borderRadius: 10,
    marginBottom: 30,
    width: "100%",
  },
  infoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoText: {
    color: "#ddd",
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
});

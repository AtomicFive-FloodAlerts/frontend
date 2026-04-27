import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLowPowerContext } from "../hooks/LowPowerMode/LowPowerContext";
import LowPowerModeScreen from '../hooks/LowPowerMode/LowPowerModeScreen';

type Spot = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export default function DangerScreen() {
  const { isLowPower, disableLowPowerMode } = useLowPowerContext();
    if (isLowPower) {
    return <LowPowerModeScreen onExit={disableLowPowerMode} />;
  }
  // Hardcoded backend data
  const spots: Spot[] = [
    {
      id: 1,
      name: "Flood Zone",
      description: "Heavy flooding reported here",
      latitude: 6.9271,
      longitude: 79.8612,
      priority: "HIGH",
    },
    {
      id: 2,
      name: "Relief Camp",
      description: "Shelter and food available",
      latitude: 6.924,
      longitude: 79.855,
      priority: "MEDIUM",
    },
    {
      id: 3,
      name: "Hospital",
      description: "Emergency medical support",
      latitude: 6.93,
      longitude: 79.865,
      priority: "LOW",
    },
  ];

  return (
    <View style={styles.webContainer}>
      <Text style={styles.webTitle}>Danger Map</Text>
      <Text style={styles.webText}>Web version coming in future.</Text>
      <Text style={styles.webText}>
        Open this page on Android or iPhone to see the live disaster map.
      </Text>

      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </Link>

      <View style={styles.webBox}>
        <Text style={styles.legendTitle}>Hardcoded important spots</Text>
        {spots.map((spot) => (
          <Text key={spot.id} style={styles.webSpot}>
            {spot.name} - {spot.priority}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  webTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  webText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  webBox: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    width: "100%",
  },
  webSpot: {
    fontSize: 15,
    marginTop: 6,
  },
  legendTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
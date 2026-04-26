import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert as RNAlert,
  TouchableOpacity,
  Button,
} from "react-native";

type AlertDTO = {
  id: number;
  title: string;
  message: string;
  status: string;
  createdAt?: string;
  readAt?: string | null;
  distanceKm?: number;
};

const USER_ID = 1; // change to dynamic user id as needed
const POLL_INTERVAL_MS = 10000;

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const lastUnreadIds = useRef<Set<number>>(new Set());
  const nextId = useRef<number>(1000);

  useEffect(() => {
    let mounted = true;

    async function fetchAlerts() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/alerts/user/${USER_ID}`,
        );
        if (!res.ok) return;
        const data: AlertDTO[] = await res.json();
        if (!mounted) return;

        // detect new unread alerts
        const unread = data.filter((a) => a.status === "UNREAD");
        const unreadIds = new Set(unread.map((u) => u.id));
        const newlyAdded = Array.from(unreadIds).filter(
          (id) => !lastUnreadIds.current.has(id),
        );
        if (newlyAdded.length > 0) {
          RNAlert.alert(
            "New Flood Alert",
            `${newlyAdded.length} new alert(s) received`,
          );
        }
        lastUnreadIds.current = unreadIds;

        setAlerts(data);
      } catch (e) {
        // silent
      }
    }

    fetchAlerts();
    const timer = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alerts (User {USER_ID})</Text>
      <View style={{ marginBottom: 12 }}>
        <Button
          title="Generate dummy alert"
          onPress={() => {
            const id = nextId.current++;
            const dummy: AlertDTO = {
              id,
              title: "Dummy Flood - HIGH",
              message:
                "This is a generated dummy flood alert for testing nearby users.",
              status: "UNREAD",
              createdAt: new Date().toISOString(),
              distanceKm: 1.2,
            };
            setAlerts((prev) => [dummy, ...prev]);
            RNAlert.alert("Dummy alert created");
          }}
        />
      </View>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => RNAlert.alert(item.title, item.message)}
          >
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.meta}>
                {item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : ""} •{" "}
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No alerts</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700" },
  message: { fontSize: 14, color: "#333", marginTop: 6 },
  meta: { fontSize: 12, color: "#666", marginTop: 8 },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
});

import { useLowPowerContext } from "@/hooks/LowPowerMode/LowPowerContext";
import LowPowerModeScreen from "@/hooks/LowPowerMode/LowPowerModeScreen";
import useTheme from "@/hooks/useTheme";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { isLowPower, enableLowPowerMode, disableLowPowerMode } = useLowPowerContext();

  // Take over full screen when Low Power Mode is active
  if (isLowPower) {
    return <LowPowerModeScreen onExit={disableLowPowerMode} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      {/* ── Appearance ── */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDarkMode ? "#2a2a2a" : "#e5e7eb" }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {isDarkMode ? "Dark theme active" : "Light theme active"}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#d1d5db", true: "#16a34a" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>POWER</Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDarkMode ? "#2a2a2a" : "#e5e7eb" }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Low Power Mode</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
              {isLowPower
                ? "Active — GPS off, alert sent"
                : "Disables non-essential features"}
            </Text>
          </View>
          <Switch
            value={isLowPower}
            onValueChange={(val) => (val ? enableLowPowerMode() : disableLowPowerMode())}
            trackColor={{ false: "#d1d5db", true: "#ffffff" }}
            thumbColor={isLowPower ? "#000000" : "#9ca3af"}
            ios_backgroundColor="#d1d5db"
          />
        </View>
        {isLowPower && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerText}>● LOW POWER MODE ACTIVE</Text>
          </View>
        )}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Pings location once then disables GPS. Sends an immediate flood alert notification.
      </Text>

        
      <Link href="/" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 28,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: "hidden",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 28,
    marginLeft: 2,
  },

  activeBanner: {
    backgroundColor: "#000",
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#333",
  },
  activeBannerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },

  backButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  Alert as RNAlert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SeverityLevel = "Advisory" | "Watch" | "Warning" | "Emergency";

type NearbyUser = {
  id: string;
  name: string;
  role: string;
  location: Coordinates;
  vulnerable: boolean;
};

type GeneratedAlert = {
  id: string;
  createdAt: string;
  score: number;
  severity: SeverityLevel;
  radiusKm: number;
  location: Coordinates;
  recipients: NearbyUser[];
  summary: string;
};

type SeverityPreview = {
  score: number;
  severity: SeverityLevel;
  radiusKm: number;
  accent: string;
};

const DEFAULT_LOCATION: Coordinates = {
  latitude: 6.9271,
  longitude: 79.8612,
};

const MOCK_USERS: NearbyUser[] = [
  {
    id: "u1",
    name: "Anura Perera",
    role: "School zone",
    location: { latitude: 6.9312, longitude: 79.8673 },
    vulnerable: true,
  },
  {
    id: "u2",
    name: "Nalini Silva",
    role: "Residential block",
    location: { latitude: 6.9188, longitude: 79.8568 },
    vulnerable: false,
  },
  {
    id: "u3",
    name: "Ramesh Kumar",
    role: "Clinic support",
    location: { latitude: 6.9404, longitude: 79.8492 },
    vulnerable: true,
  },
  {
    id: "u4",
    name: "Nimal Fernando",
    role: "Market area",
    location: { latitude: 6.9142, longitude: 79.8721 },
    vulnerable: false,
  },
  {
    id: "u5",
    name: "Kasun Weerasinghe",
    role: "Low-lying street",
    location: { latitude: 6.9233, longitude: 79.8765 },
    vulnerable: true,
  },
  {
    id: "u6",
    name: "Priyanka Jayasuriya",
    role: "Relief volunteer",
    location: { latitude: 6.955, longitude: 79.8897 },
    vulnerable: false,
  },
];

const ALERT_RADIUS_OPTIONS = [2, 5, 10, 15];

const SEVERITY_STYLES: Record<
  SeverityLevel,
  { accent: string; label: string }
> = {
  Advisory: { accent: "#2563eb", label: "Advisory" },
  Watch: { accent: "#f59e0b", label: "Watch" },
  Warning: { accent: "#ea580c", label: "Warning" },
  Emergency: { accent: "#dc2626", label: "Emergency" },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function haversineDistance(a: Coordinates, b: Coordinates) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const latitude1 = toRadians(a.latitude);
  const latitude2 = toRadians(b.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function calculateSeverityPreview(params: {
  waterLevelCm: number;
  rainfallMm: number;
  flowSpeedMps: number;
  communityReports: number;
  roadBlocked: boolean;
  vulnerableNearby: boolean;
  trend: string;
}): SeverityPreview {
  const trendBoost =
    params.trend === "Rising" ? 18 : params.trend === "Stable" ? 6 : 0;

  const score = clamp(
    Math.round(
      params.waterLevelCm * 0.22 +
        params.rainfallMm * 0.16 +
        params.flowSpeedMps * 8 +
        params.communityReports * 7 +
        trendBoost +
        (params.roadBlocked ? 10 : 0) +
        (params.vulnerableNearby ? 12 : 0),
    ),
    0,
    100,
  );

  let severity: SeverityLevel = "Advisory";
  if (score >= 80) severity = "Emergency";
  else if (score >= 60) severity = "Warning";
  else if (score >= 35) severity = "Watch";

  const defaultRadius =
    severity === "Emergency"
      ? 15
      : severity === "Warning"
        ? 10
        : severity === "Watch"
          ? 5
          : 2;

  return {
    score,
    severity,
    radiusKm: defaultRadius,
    accent: SEVERITY_STYLES[severity].accent,
  };
}

function formatTimestamp(date: string) {
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsScreen() {
  const { colors } = useTheme();
  const [waterLevelCm, setWaterLevelCm] = useState("145");
  const [rainfallMm, setRainfallMm] = useState("38");
  const [flowSpeedMps, setFlowSpeedMps] = useState("2.1");
  const [communityReports, setCommunityReports] = useState("4");
  const [roadBlocked, setRoadBlocked] = useState(true);
  const [vulnerableNearby, setVulnerableNearby] = useState(true);
  const [trend, setTrend] = useState("Rising");
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [location, setLocation] = useState<Coordinates>(DEFAULT_LOCATION);
  const [notificationState, setNotificationState] = useState(
    "Permission not checked",
  );
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([]);

  useEffect(() => {
    let mounted = true;

    async function bootstrapNotifications() {
      const permission = await Notifications.getPermissionsAsync();
      if (!mounted) return;

      if (permission.granted) {
        setNotificationState("Notifications enabled");
        return;
      }

      setNotificationState("Notifications not granted yet");
    }

    void bootstrapNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const severityPreview = useMemo(() => {
    return calculateSeverityPreview({
      waterLevelCm: parseNumber(waterLevelCm, 0),
      rainfallMm: parseNumber(rainfallMm, 0),
      flowSpeedMps: parseNumber(flowSpeedMps, 0),
      communityReports: parseNumber(communityReports, 0),
      roadBlocked,
      vulnerableNearby,
      trend,
    });
  }, [
    waterLevelCm,
    rainfallMm,
    flowSpeedMps,
    communityReports,
    roadBlocked,
    vulnerableNearby,
    trend,
  ]);

  const effectiveRadiusKm = selectedRadius ?? severityPreview.radiusKm;

  const nearbyUsers = useMemo(() => {
    return MOCK_USERS.map((user) => ({
      ...user,
      distanceKm: haversineDistance(location, user.location),
    }))
      .filter((user) => user.distanceKm <= effectiveRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [location, effectiveRadiusKm]);

  const riskSummary = useMemo(() => {
    if (nearbyUsers.length === 0) {
      return "No subscribers are currently inside the alert radius.";
    }

    const vulnerableCount = nearbyUsers.filter(
      (user) => user.vulnerable,
    ).length;

    return `${nearbyUsers.length} nearby user(s) in range, including ${vulnerableCount} vulnerable contact(s).`;
  }, [nearbyUsers]);

  async function useGpsLocation() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      RNAlert.alert(
        "GPS permission needed",
        "Enable location access to center the alert radius.",
      );
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setNotificationState("GPS location updated");
    } catch {
      RNAlert.alert(
        "GPS unavailable",
        "Using the default flood center instead.",
      );
    }
  }

  async function ensureNotificationsEnabled() {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    const granted = requested.granted;
    setNotificationState(
      granted ? "Notifications enabled" : "Notifications denied",
    );
    return granted;
  }

  async function generateAlert() {
    const allowed = await ensureNotificationsEnabled();
    const recipients = nearbyUsers;
    const alert: GeneratedAlert = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      score: severityPreview.score,
      severity: severityPreview.severity,
      radiusKm: effectiveRadiusKm,
      location,
      recipients,
      summary: `${severityPreview.severity} flood alert generated with ${recipients.length} recipient(s) inside ${effectiveRadiusKm.toFixed(1)} km.`,
    };

    setAlerts((current) => [alert, ...current]);

    if (allowed && Platform.OS !== "web") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Flood ${alert.severity}`,
          body: `${recipients.length} nearby user(s) alerted within ${effectiveRadiusKm.toFixed(1)} km.`,
          data: { alertId: alert.id },
        },
        trigger: null,
      });
    }

    RNAlert.alert(
      `${alert.severity} alert generated`,
      recipients.length > 0
        ? `${recipients.length} nearby user(s) were marked for notification.`
        : "No users are currently within the configured alert radius.",
    );
  }

  const severityStyle = SEVERITY_STYLES[severityPreview.severity];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.hero,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View
            style={[styles.heroIcon, { backgroundColor: severityStyle.accent }]}
          >
            <Ionicons name="notifications" size={24} color="#fff" />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={[styles.kicker, { color: colors.textMuted }]}>
              Alert System
            </Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Nearby users receive flood warnings
            </Text>
          </View>
        </View>
        <Text style={[styles.heroBody, { color: colors.textMuted }]}>
          This frontend simulates severity calculation, alert radius filtering,
          and notification delivery for users near a flood center.
        </Text>
        <View style={styles.heroStatsRow}>
          <StatCard
            label="Severity"
            value={severityPreview.severity}
            colors={colors}
            accent={severityStyle.accent}
          />
          <StatCard
            label="Radius"
            value={`${effectiveRadiusKm.toFixed(1)} km`}
            colors={colors}
            accent={severityStyle.accent}
          />
          <StatCard
            label="Score"
            value={`${severityPreview.score}/100`}
            colors={colors}
            accent={severityStyle.accent}
          />
        </View>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SectionTitle
          title="Incident Inputs"
          subtitle="Adjust the flood signals used to calculate severity."
          colors={colors}
        />

        <LabeledInput
          label="Water level (cm)"
          value={waterLevelCm}
          onChangeText={setWaterLevelCm}
          colors={colors}
          keyboardType="numeric"
        />
        <LabeledInput
          label="Rainfall (mm)"
          value={rainfallMm}
          onChangeText={setRainfallMm}
          colors={colors}
          keyboardType="numeric"
        />
        <LabeledInput
          label="Flow speed (m/s)"
          value={flowSpeedMps}
          onChangeText={setFlowSpeedMps}
          colors={colors}
          keyboardType="numeric"
        />
        <LabeledInput
          label="Community reports"
          value={communityReports}
          onChangeText={setCommunityReports}
          colors={colors}
          keyboardType="numeric"
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Road blocked
            </Text>
            <Text style={[styles.toggleHint, { color: colors.textMuted }]}>
              Blocked access raises severity and radius.
            </Text>
          </View>
          <Switch
            value={roadBlocked}
            onValueChange={setRoadBlocked}
            trackColor={{ false: colors.border, true: severityStyle.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Vulnerable users nearby
            </Text>
            <Text style={[styles.toggleHint, { color: colors.textMuted }]}>
              Boosts the alert score when sensitive users are in range.
            </Text>
          </View>
          <Switch
            value={vulnerableNearby}
            onValueChange={setVulnerableNearby}
            trackColor={{ false: colors.border, true: severityStyle.accent }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.pickerRow}>
          {["Rising", "Stable", "Falling"].map((option) => (
            <Pressable
              key={option}
              onPress={() => setTrend(option)}
              style={[
                styles.pill,
                {
                  borderColor:
                    trend === option ? severityStyle.accent : colors.border,
                  backgroundColor:
                    trend === option ? severityStyle.accent : colors.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: trend === option ? "#fff" : colors.text },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SectionTitle
          title="Alert Radius"
          subtitle="Choose the coverage area for the generated alert."
          colors={colors}
        />

        <View style={styles.radiusRow}>
          <Pressable
            onPress={() => setSelectedRadius(null)}
            style={[
              styles.radiusChip,
              {
                backgroundColor:
                  selectedRadius === null ? severityStyle.accent : colors.bg,
                borderColor:
                  selectedRadius === null
                    ? severityStyle.accent
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.radiusChipText,
                { color: selectedRadius === null ? "#fff" : colors.text },
              ]}
            >
              Auto
            </Text>
          </Pressable>

          {ALERT_RADIUS_OPTIONS.map((radius) => (
            <Pressable
              key={radius}
              onPress={() => setSelectedRadius(radius)}
              style={[
                styles.radiusChip,
                {
                  backgroundColor:
                    selectedRadius === radius
                      ? severityStyle.accent
                      : colors.bg,
                  borderColor:
                    selectedRadius === radius
                      ? severityStyle.accent
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.radiusChipText,
                  { color: selectedRadius === radius ? "#fff" : colors.text },
                ]}
              >
                {radius} km
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.locationCard,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Ionicons name="locate" size={18} color={severityStyle.accent} />
          <View style={styles.locationCopy}>
            <Text style={[styles.locationTitle, { color: colors.text }]}>
              Alert center
            </Text>
            <Text style={[styles.locationValue, { color: colors.textMuted }]}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        <View style={styles.inlineActions}>
          <Pressable
            onPress={useGpsLocation}
            style={[
              styles.actionButton,
              { backgroundColor: severityStyle.accent },
            ]}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Use GPS</Text>
          </Pressable>

          <Pressable
            onPress={() => setLocation(DEFAULT_LOCATION)}
            style={[
              styles.secondaryButton,
              { borderColor: colors.border, backgroundColor: colors.bg },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Reset center
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SectionTitle
          title="Severity Preview"
          subtitle="This is what the alert engine will send."
          colors={colors}
        />

        <View
          style={[
            styles.previewBanner,
            { backgroundColor: severityStyle.accent },
          ]}
        >
          <View>
            <Text style={styles.previewLevel}>{severityPreview.severity}</Text>
            <Text style={styles.previewScore}>
              {severityPreview.score} / 100 risk score
            </Text>
          </View>
          <Text style={styles.previewRadius}>
            {effectiveRadiusKm.toFixed(1)} km radius
          </Text>
        </View>

        <Text style={[styles.summaryText, { color: colors.textMuted }]}>
          {riskSummary}
        </Text>

        <Pressable
          onPress={generateAlert}
          style={[
            styles.primaryButton,
            { backgroundColor: severityStyle.accent },
          ]}
        >
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Generate alerts</Text>
        </Pressable>

        <Text style={[styles.notificationStatus, { color: colors.textMuted }]}>
          Notification status: {notificationState}
        </Text>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SectionTitle
          title="Nearby users"
          subtitle="Only contacts inside the active radius are marked for alerting."
          colors={colors}
        />

        {nearbyUsers.length === 0 ? (
          <EmptyState
            title="No users in range"
            subtitle="Expand the alert radius or move the incident location to preview notifications."
            colors={colors}
          />
        ) : (
          nearbyUsers.map((user) => (
            <View
              key={user.id}
              style={[
                styles.userCard,
                { backgroundColor: colors.bg, borderColor: colors.border },
              ]}
            >
              <View style={styles.userHeader}>
                <View style={styles.userIdentity}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.userRole, { color: colors.textMuted }]}>
                    {user.role}
                  </Text>
                </View>
                <View
                  style={[
                    styles.userBadge,
                    {
                      backgroundColor: user.vulnerable ? "#fef3c7" : "#dbeafe",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.userBadgeText,
                      { color: user.vulnerable ? "#92400e" : "#1d4ed8" },
                    ]}
                  >
                    {user.vulnerable ? "Vulnerable" : "Standard"}
                  </Text>
                </View>
              </View>

              <Text style={[styles.userDistance, { color: colors.textMuted }]}>
                Distance: {user.distanceKm.toFixed(2)} km
              </Text>
            </View>
          ))
        )}
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SectionTitle
          title="Recent alerts"
          subtitle="A feed of the generated notification payloads."
          colors={colors}
        />

        {alerts.length === 0 ? (
          <EmptyState
            title="No generated alerts yet"
            subtitle="Tap Generate alerts to create the first frontend notification batch."
            colors={colors}
          />
        ) : (
          alerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                { backgroundColor: colors.bg, borderColor: colors.border },
              ]}
            >
              <View style={styles.alertHeader}>
                <View>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.severity} alert
                  </Text>
                  <Text style={[styles.alertMeta, { color: colors.textMuted }]}>
                    {formatTimestamp(alert.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.alertScore, { color: colors.text }]}>
                  {alert.score}/100
                </Text>
              </View>
              <Text style={[styles.alertSummary, { color: colors.textMuted }]}>
                {alert.summary}
              </Text>
              <Text style={[styles.alertSummary, { color: colors.textMuted }]}>
                Recipients: {alert.recipients.length}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SectionTitle({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: { text: string; textMuted: string };
}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: string;
  colors: { border: string; text: string; textMuted: string };
  accent: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <View style={[styles.statBar, { backgroundColor: accent }]} />
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  colors,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: {
    text: string;
    textMuted: string;
    border: string;
    bg: string;
    surface: string;
  };
  keyboardType?: "default" | "numeric" | "number-pad";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        style={[
          styles.input,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

function EmptyState({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: { text: string; textMuted: string };
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextBlock: {
    flex: 1,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statBar: {
    height: 4,
    borderRadius: 999,
    marginTop: 2,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  sectionTitleWrap: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  toggleHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  radiusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  radiusChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  locationCopy: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  locationValue: {
    fontSize: 13,
    marginTop: 2,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  previewBanner: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  previewLevel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  previewScore: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  previewRadius: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  notificationStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  userIdentity: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
  },
  userRole: {
    fontSize: 12,
  },
  userBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  userDistance: {
    fontSize: 12,
    fontWeight: "600",
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  alertMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  alertScore: {
    fontSize: 16,
    fontWeight: "900",
  },
  alertSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});

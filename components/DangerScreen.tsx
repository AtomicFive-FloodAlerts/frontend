import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useLowPowerContext } from "../hooks/LowPowerMode/LowPowerContext";
import LowPowerModeScreen from "../hooks/LowPowerMode/LowPowerModeScreen";

const LeafletMap = React.lazy(() => import("../components/LeafletMap.web"));

type Spot = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

export default function DangerScreen() {
  const { isLowPower, disableLowPowerMode } = useLowPowerContext();
  const [spots, setSpots]               = useState<Spot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [fetchError, setFetchError]     = useState(false);
  const [isMounted, setIsMounted]       = useState(false);
  const watchIdRef                      = useRef<number | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode;
const refresh = params.refresh;
  

  const API_URL = `http://${process.env.EXPO_PUBLIC_API_HOST}:8080/api/floods/map`;

  useEffect(() => {
    setIsMounted(true);

    const fetchSpots = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Spot[] = await res.json();
        setSpots(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(true);
      }
    };

 

    const startTracking = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) =>
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => console.warn("Watch error:", err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    };

    fetchSpots();
    startTracking();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [refresh]);

  if (isLowPower) {
    return <LowPowerModeScreen onExit={disableLowPowerMode} />;
  }

  return (
    <View style={styles.container}>

      {isMounted && (
        <View style={StyleSheet.absoluteFill}>
          <Suspense
            fallback={
              <View style={styles.loader}>
                <Text>Loading map…</Text>
              </View>
            }
          >
            <LeafletMap
                spots={spots}
                userLocation={userLocation}
                selectedLocation={selectedLocation}
                onSelectLocation={(lat, lon) =>
                  setSelectedLocation({
                    latitude: lat,
                    longitude: lon,
                  })
                }
            />
          </Suspense>
        </View>
      )}

      <Pressable
        style={styles.attribution}
        onPress={() => Linking.openURL("https://carto.com/attributions")}
      >
        <Text style={styles.attributionText}>
          © OpenStreetMap contributors © CARTO
        </Text>
      </Pressable>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Alerts Screen</Text>
        <Text>🟢 Your live location</Text>
        <Text>🔴 High danger</Text>
        <Text>🟠 Medium danger</Text>
        <Text>🔵 Low danger</Text>
        {fetchError && (
          <Text style={styles.errorText}>⚠️ Could not load map data</Text>
        )}
        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </Pressable>
        </Link>
      </View>

      {mode === "select" && selectedLocation && (
        <Pressable
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/report",
              params: {
                lat: selectedLocation.latitude,
                lon: selectedLocation.longitude,
              },
            });
          }}
        >
          <Text style={styles.buttonText}>Confirm Location</Text>
        </Pressable>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  attribution: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 1000,
  },
  attributionText: {
    fontSize: 11,
    color: "#333",
  },
  legend: {
    position: "absolute",
    bottom: 60,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  legendTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
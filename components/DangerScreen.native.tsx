import * as Location from "expo-location";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Circle, Marker, UrlTile } from "react-native-maps";

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

  const router = useRouter(); 

  const [spots, setSpots] = useState<Spot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null); 
  const params = useLocalSearchParams();
  const mode = params.mode;

  // Change this:
  // Android emulator -> http://10.0.2.2:8080/api/maps
  // Real phone -> http://YOUR_PC_IP:8080/api/maps

  const API_URL = "http://192.168.133.4:8080/api/floods/map";

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const fetchSpots = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: Spot[] = await response.json();
        setSpots(data);
      } catch (error) {
        console.error("Fetch error:", error);
        Alert.alert("Error", "Could not load map data from backend.");
      }
    };

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is needed.");
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.error("Location error:", error);
      }
    };

    fetchSpots();
    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  const getMarkerColor = (priority: Spot["priority"]) => {
    if (priority === "HIGH") return "red";
    if (priority === "MEDIUM") return "orange";
    return "blue";
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}

        
        onPress={(e) => {
          if (mode !== "select") return; 

          setSelectedLocation(e.nativeEvent.coordinate);
        }}
              >
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {spots.map((spot) => (
          <React.Fragment key={spot.id}>
            <Marker
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              description={spot.description}
              pinColor={getMarkerColor(spot.priority)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{spot.name}</Text>
                  <Text>{spot.description}</Text>
                  <Text style={styles.calloutPriority}>
                    Priority: {spot.priority}
                  </Text>
                </View>
              </Callout>
            </Marker>

            {spot.priority === "HIGH" && (
              <Circle
                center={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                radius={5000}
                strokeWidth={2}
                strokeColor="rgba(255,0,0,0.8)"
                fillColor="rgba(255,0,0,0.25)"
              />
            )}

            {spot.priority === "MEDIUM" && (
              <Circle
                center={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                radius={300}
                strokeWidth={2}
                strokeColor="rgba(255,165,0,0.8)"
                fillColor="rgba(255,165,0,0.25)"
              />
            )}
          </React.Fragment>
        ))}

        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            description="Live location"
            pinColor="green"
          />
        )}


        {mode === "select" && selectedLocation && ( (
          <Marker coordinate={selectedLocation} pinColor="green" />
        ))}

      </MapView>

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

        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </Pressable>
        </Link>
      </View>

      {mode === "select" && selectedLocation && (
        <Pressable
          style={{
            position: "absolute",
            bottom: 140,
            left: 20,
            right: 20,
            backgroundColor: "#2563eb",
            padding: 15,
            borderRadius: 10,
          }}
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
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
            Confirm Location
          </Text>
        </Pressable>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: { width: 180 },
  calloutTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  calloutPriority: { marginTop: 4, fontWeight: "bold" },
  attribution: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  attributionText: { fontSize: 11, color: "#333" },
  legend: {
    position: "absolute",
    bottom: 60,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  legendTitle: { fontWeight: "bold", marginBottom: 5 },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
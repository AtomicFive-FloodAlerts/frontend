import useTheme from "@/hooks/useTheme";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function Report() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [waterLevel, setWaterLevel] = useState("");
  const [trend, setTrend] = useState("");

  const [peopleAffected, setPeopleAffected] = useState("");
  const [roadBlocked, setRoadBlocked] = useState("");

  const [peopleCount, setPeopleCount] = useState("");
  const [injuries, setInjuries] = useState("");
  const [vulnerable, setVulnerable] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");

  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (params.lat && params.lon && !coordinates) {
      const lat = Number(params.lat);
      const lon = Number(params.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        setCoordinates({ latitude: lat, longitude: lon });
      }
    }
  }, [params.lat, params.lon]);

  const resetForm = () => {
    setWaterLevel("");
    setTrend("");
    setPeopleAffected("");
    setRoadBlocked("");
    setPeopleCount("");
    setInjuries("");
    setVulnerable("");
    setVehicleStatus("");
    setDescription("");
    setImage(null);
    setCoordinates(null);
  };

  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to gallery");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitReport = async () => {
    if (!waterLevel || !trend) {
      Alert.alert("Error", "Water level and trend are required");
      return;
    }

    if (!coordinates) {
      Alert.alert("Error", "Please select location from map");
      return;
    }

    const fullDescription = `
Trend: ${trend}
People affected: ${peopleAffected}
Road blocked: ${roadBlocked}
People count: ${peopleCount}
Injuries: ${injuries}
Vulnerable: ${vulnerable}
Vehicle: ${vehicleStatus}

${description}
`;

    const reportData = {
      reportedById: 1,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      description: fullDescription,
      waterLevel: parseInt(waterLevel),
      areaName: "Selected from map",
    };

    try {
      console.log("SENDING DATA:", reportData);

      const res = await fetch("http://192.168.133.4:8080/api/floods/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      const text = await res.text();

      console.log("STATUS:", res.status);
      console.log("RESPONSE:", text);

      if (!res.ok) {
        Alert.alert("Error", "Backend rejected request");
        return;
      }

      Alert.alert("Success", "Report submitted successfully!");

      resetForm();

      router.replace({
        pathname: "/danger",
        params: { refresh: Date.now() },
      });

    } catch (error) {
      console.error("FETCH ERROR:", error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      
      <Text style={[styles.title, { color: colors.text }]}>
        Flood Report
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        
        <Text style={[styles.section, { color: colors.text }]}>Basic Info</Text>

        <Text style={{ color: colors.text }}>Water Level (cm)</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={waterLevel}
          onChangeText={setWaterLevel}
          keyboardType="numeric"
        />

        <Text style={{ color: colors.text }}>Water Trend</Text>
        <View style={[styles.pickerBox, { borderColor: colors.border }]}>
          <Picker
            selectedValue={trend}
            onValueChange={setTrend}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Rising" value="Rising" />
            <Picker.Item label="Stable" value="Stable" />
            <Picker.Item label="Falling" value="Falling" />
          </Picker>
        </View>

        <Text style={{ color: colors.text }}>
          {coordinates
            ? `Selected: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
            : "No location selected"}
        </Text>

        <Link href={{ pathname: "/danger", params: { mode: "select" } }} asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Pick Location</Text>
          </TouchableOpacity>
        </Link>

        <Text style={[styles.section, { color: colors.text }]}>Impact</Text>

        <Text style={{ color: colors.text }}>Are people affected?</Text>
        <Picker selectedValue={peopleAffected} onValueChange={setPeopleAffected}>
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>

        {peopleAffected === "yes" && (
          <>
            <Text style={{ color: colors.text }}>People Count</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={peopleCount}
              onChangeText={setPeopleCount}
              keyboardType="numeric"
            />

            <Text style={{ color: colors.text }}>Injuries?</Text>
            <Picker selectedValue={injuries} onValueChange={setInjuries}>
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>

            <Text style={{ color: colors.text }}>Vulnerable Groups</Text>
            <Picker selectedValue={vulnerable} onValueChange={setVulnerable}>
              <Picker.Item label="Select" value="" />
              <Picker.Item label="None" value="None" />
              <Picker.Item label="Children" value="Children" />
              <Picker.Item label="Elderly" value="Elderly" />
              <Picker.Item label="Disabled" value="Disabled" />
              <Picker.Item label="Pregnant" value="Pregnant" />
              <Picker.Item label="Multiple groups" value="Multiple" />
            </Picker>
          </>
        )}

        <Text style={{ color: colors.text }}>Is road blocked?</Text>
        <Picker selectedValue={roadBlocked} onValueChange={setRoadBlocked}>
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Yes" value="yes" />
          <Picker.Item label="No" value="no" />
        </Picker>

        {roadBlocked === "yes" && (
          <>
            <Text style={{ color: colors.text }}>Vehicle Status</Text>
            <Picker selectedValue={vehicleStatus} onValueChange={setVehicleStatus}>
              <Picker.Item label="Select" value="" />
              <Picker.Item label="No vehicles affected" value="None" />
              <Picker.Item label="Vehicles stuck" value="Stuck" />
              <Picker.Item label="Vehicles submerged" value="Submerged" />
              <Picker.Item label="Road not passable" value="Blocked" />
              <Picker.Item label="Rescue needed" value="Rescue needed" />
            </Picker>
          </>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Additional Info</Text>

        <Text style={{ color: colors.text }}>Description</Text>
        <TextInput
          style={[
            styles.input,
            {
              height: 80,
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.uploadBox, { backgroundColor: colors.border }]}
          onPress={pickImage}
        >
          <Text style={{ color: colors.text }}>
            {image ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: 200, marginTop: 10 }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={submitReport}>
        <Text style={styles.buttonText}>Submit Report</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    color: "#1e3a8a",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  section: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
  },

  label: {
    marginBottom: 5,
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  pickerBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },

  uploadBox: {
    backgroundColor: "#e0ecff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  button: {
    backgroundColor: "#2563eb",
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

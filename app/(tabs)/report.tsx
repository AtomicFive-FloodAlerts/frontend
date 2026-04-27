import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Link, useLocalSearchParams } from "expo-router";
import useTheme from "@/hooks/useTheme";

export default function Report() {

  const { colors } = useTheme();

  const [waterLevel, setWaterLevel] = useState("");
  const [trend, setTrend] = useState("");
  const [roadStatus, setRoadStatus] = useState("");
  const [location, setLocation] = useState("");
  const [situation, setSituation] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [vulnerable, setVulnerable] = useState("");
  const [injuries, setInjuries] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<any>(null);

  const params = useLocalSearchParams();


  useEffect(() => {
    if (params.lat && params.lon) {
      setCoordinates({
        latitude: Number(params.lat),
        longitude: Number(params.lon),
      });
      setLocation("Selected from map");
    }
  }, [params]);


  const pickImage = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to gallery");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };


  const submitReport = async () => {

    if (!waterLevel || !trend || !roadStatus || !location) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const fullDescription = `
Trend: ${trend}
Road: ${roadStatus}
Situation: ${situation}
People: ${peopleCount}
Vulnerable: ${vulnerable}
Injuries: ${injuries}
Vehicle: ${vehicleStatus}

${description}
    `;

    const reportData = {
      reportedById: 1,
      latitude: coordinates?.latitude || 6.9271,
      longitude: coordinates?.longitude || 79.8612,
      description: fullDescription,
      waterLevel: parseInt(waterLevel),
      areaName: location
    };

    try {
      const response = await fetch("http://192.168.1.5:8080/api/floods/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.text();
      Alert.alert("Success", result);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send report");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface  }]}>

      <Text style={[styles.title, { color: colors.text }]}>Flood Report</Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>

        <Text style={[styles.label, { color: colors.text }]}>Water Level (cm)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={waterLevel}
          onChangeText={setWaterLevel}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Water Trend</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={trend} onValueChange={setTrend}>
            <Picker.Item label="Select Trend" value="" />
            <Picker.Item label="Rising" value="Rising" />
            <Picker.Item label="Stable" value="Stable" />
            <Picker.Item label="Falling" value="Falling" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Road Status</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={roadStatus} onValueChange={setRoadStatus}>
            <Picker.Item label="Select Status" value="" />
            <Picker.Item label="Open" value="Open" />
            <Picker.Item label="Blocked" value="Blocked" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={location}
          onChangeText={setLocation}
        />

        <Link href="/danger" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Pick Location from Map</Text>
          </TouchableOpacity>
        </Link>

        <Text style={[styles.label, { color: colors.text }]}>Situation</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={situation} onValueChange={setSituation}>
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Building" value="Building" />
            <Picker.Item label="Road" value="Road" />
            <Picker.Item label="Stranded" value="Stranded" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>People Count</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={peopleCount}
          onChangeText={setPeopleCount}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, backgroundColor: colors.surface, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
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
  container: { flex: 1 },
  title: { fontSize: 24, textAlign: "center", marginTop: 20 },
  card: { margin: 15, padding: 15, borderRadius: 10 },
  label: { marginBottom: 5 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10 },
  pickerBox: { borderWidth: 1, marginBottom: 10 },
  uploadBox: { padding: 10, backgroundColor: "#ddd", marginTop: 10 },
  button: { backgroundColor: "#2563eb", padding: 15, margin: 10 },
  buttonText: { color: "#fff", textAlign: "center" }
});
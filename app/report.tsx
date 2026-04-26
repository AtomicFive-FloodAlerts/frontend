import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Report() {

  const [waterLevel, setWaterLevel] = useState("");
  const [trend, setTrend] = useState("");
  const [roadStatus, setRoadStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState("");
  const [situation, setSituation] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [vulnerable, setVulnerable] = useState("");
  const [injuries, setInjuries] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);


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


  const submitReport = () => {

    if (!waterLevel || !trend || !roadStatus || !severity || !location) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const report = {
      waterLevel,
      trend,
      roadStatus,
      severity,
      location,
      description,
      image,
      timestamp: new Date()
    };

    console.log("REPORT:", report);

    Alert.alert("Success", "Report submitted!");
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}> Flood Report</Text>

      <View style={styles.card}>


        <Text style={styles.label}> Water Level (cm)</Text>
        <TextInput
          placeholder="Enter water level"
          style={styles.input}
          value={waterLevel}
          onChangeText={setWaterLevel}
          keyboardType="numeric"
        />

  
        <Text style={styles.label}> Water Trend</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={trend} onValueChange={setTrend}>
            <Picker.Item label="Select Trend" value="" />
            <Picker.Item label="Rising" value="Rising" />
            <Picker.Item label="Stable" value="Stable" />
            <Picker.Item label="Falling" value="Falling" />
          </Picker>
        </View>


        <Text style={styles.label}> Road Status</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={roadStatus} onValueChange={setRoadStatus}>
            <Picker.Item label="Select Status" value="" />
            <Picker.Item label="Open" value="Open" />
            <Picker.Item label="Blocked" value="Blocked" />
            <Picker.Item label="Partially Blocked" value="Partial" />
          </Picker>
        </View>

   
        <Text style={styles.label}> Severity Level</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={severity} onValueChange={setSeverity}>
            <Picker.Item label="Select Severity" value="" />
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
          </Picker>
        </View>

        <Text style={styles.label}> Location</Text>
        <TextInput
          placeholder="Enter location (e.g. Moratuwa, Colombo)"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Current Situation</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={situation} onValueChange={setSituation}>
            <Picker.Item label="Select Situation" value="" />
            <Picker.Item label="In Building" value="Building" />
            <Picker.Item label="On Road" value="Road" />
            <Picker.Item label="Stranded" value="Stranded" />
          </Picker>
        </View>


        <Text style={styles.label}>Number of People</Text>
        <TextInput
          placeholder="Enter number of people"
          style={styles.input}
          value={peopleCount}
          onChangeText={setPeopleCount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Vulnerable People</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={vulnerable} onValueChange={setVulnerable}>
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <Text style={styles.label}>Any Injuries?</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={injuries} onValueChange={setInjuries}>
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>

        <Text style={styles.label}>Vehicle Condition</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={vehicleStatus} onValueChange={setVehicleStatus}>
            <Picker.Item label="Select" value="" />
            <Picker.Item label="Safe" value="Safe" />
            <Picker.Item label="Damaged" value="Damaged" />
            <Picker.Item label="No Vehicle" value="None" />
          </Picker>
        </View>


        <Text style={styles.label}> Description</Text>
        <TextInput
          placeholder="Optional details..."
          style={[styles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

  
        <Text style={styles.label}> Upload Image</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          <Text style={{ color: "#2563eb" }}>
            {image ? "Change Image" : "Tap to upload image"}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 10,
              marginTop: 10
            }}
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
    backgroundColor: "#eef2ff"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    color: "#1e3a8a"
  },
  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  label: {
    marginBottom: 5,
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  pickerBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15
  },
  uploadBox: {
    backgroundColor: "#e0ecff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10
  },
  button: {
    backgroundColor: "#2563eb",
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
    <View>
      <Text>Report Disaster Page</Text>
          <Link href="/" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </Pressable>
          </Link>
    </View>

  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
import { Link } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

const image = require("@/assets/images/teamlogo.png")

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
        <Text style={styles.title}>FLOOD ALERTS</Text>
      
      <Text style={styles.label}>Group Name: <Text style={styles.value}>Atomic Five</Text></Text>
      <Text style={styles.label}>Module: <Text style={styles.value}>CS1040 - Program Construction</Text></Text>
      <Text style={styles.label}>Methodology: <Text style={styles.value}>Object-Oriented Software Development (OOSD)</Text></Text>

      <Text style={styles.sectionTitle}>Group Members</Text>
      <Text style={styles.member}>• P Shaeshanth — 240616J</Text>
      <Text style={styles.member}>• Nethmie ND — 240142C</Text>
      <Text style={styles.member}>• MNF Shameera — 240617M</Text>
      <Text style={styles.member}>• R Sesathviiyaah — 240612T</Text>
      <Text style={styles.member}>• T Kulunu — 240643M</Text>

      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </Link>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1e293b",
    letterSpacing: 1,
  },
  label: {
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 6,
  },
  value: {
    fontWeight: "600",
    color: "#222",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 8,
  },
  member: {
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 4,
  },
  button: {
    marginTop: 28,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
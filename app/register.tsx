import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

const image = require("@/assets/images/Flood.jpg");

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </Pressable>

        <Text style={styles.link} onPress={() => router.push("/login")}>
          Already have an account? Login
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.49)", // overlay effect
    padding: 20,
    borderRadius: 12,
  },

  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.36)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: "white",
  },

  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  link: {
    marginTop: 15,
    color: "#93c5fd",
  },
});
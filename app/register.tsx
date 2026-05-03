import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { googleLogin, registerUser } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

const image = require("@/assets/images/Flood.jpg");

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@sesathviiyaah/FloodAlerts",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      handleGoogleRegister(token);
    }
  }, [response]);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async () => {
    if (!name || !email || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Enter a valid email");
      return;
    }

    try {
      const res = await registerUser({
        name,
        email,
        phoneNumber,
        password,
      });

      console.log("REGISTER RESPONSE:", res.data);

      Alert.alert(
        "Success",
        typeof res.data === "string"
          ? res.data
          : "Registration successful"
      );

      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data || err?.message || "Registration failed";

      Alert.alert("Error", msg);
    }
  };

  const handleGoogleRegister = async (token: string | undefined) => {
    try {
      await googleLogin(token || "");
      Alert.alert("Success", "Google registration successful");
      router.replace("/(tabs)" as any);
    } catch {
      Alert.alert("Error", "Google registration failed");
    }
  };

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput placeholder="Name" style={styles.input} onChangeText={setName} />
        <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
        <TextInput placeholder="Phone" style={styles.input} onChangeText={setPhoneNumber} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />

        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>REGISTER</Text>
        </Pressable>

        {/* GOOGLE REGISTER */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: "#db4437", marginTop: 10 },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => promptAsync()}
        >
          <Text style={styles.buttonText}>Register with Google</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    color: "white",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
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
    shadowColor: "#2563eb",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
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
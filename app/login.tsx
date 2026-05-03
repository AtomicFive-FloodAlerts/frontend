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

import { googleLogin, loginUser } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

const image = require("@/assets/images/Flood.jpg");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@sesathviiyaah/FloodAlerts", // 
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      handleGoogleLogin(token);
    }
  }, [response]);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Enter a valid email");
      return;
    }

    try {
      const res = await loginUser({ email, password });

      console.log("LOGIN RESPONSE:", res.data);

      Alert.alert("Success", "Login successful");

      router.replace("/(tabs)");
    } catch (err: any) {
      const msg =
        err?.response?.data || err?.message || "Login failed";

      Alert.alert("Error", msg);
    }
  };

  const handleGoogleLogin = async (token: string | undefined) => {
    try {
      await googleLogin(token || "");
      Alert.alert("Success", "Google login successful");
      router.replace("/(tabs)" as any);
    } catch {
      Alert.alert("Error", "Google login failed");
    }
  };

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

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

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </Pressable>

        {/* GOOGLE LOGIN */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: "#db4437", marginTop: 10 },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => promptAsync()}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </Pressable>

        <Text style={styles.link} onPress={() => router.push("/register")}>
          Don't have an account? Register
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
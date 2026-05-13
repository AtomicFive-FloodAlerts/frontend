import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { Platform } from "react-native";
import { googleLogin, loginUser } from "../services/api";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://localhost:8080";

WebBrowser.maybeCompleteAuthSession();

const image = require("@/assets/images/Flood.jpg");

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail]       = useState((params.email as string) || "");
  const [password, setPassword] = useState((params.password as string) || "");
  const [loading, setLoading]   = useState(false);

  // CHANGE: added generalError + googleError; emailError was already there
  const [emailError, setEmailError]     = useState("");
  const [generalError, setGeneralError] = useState("");
  const [googleError, setGoogleError]   = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@sesathviiyaah/FloodAlerts",
    androidClientId: "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      handleGoogleLogin(token);
    } else if (response?.type === "error") {
      // CHANGE: was silently ignored; now shown inline
      setGoogleError("Google sign-in failed. Please try again.");
    }
  }, [response]);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fill the above fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      const res = await loginUser({
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      alert("Login successful");

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 500);

    } catch (err: any) {
      console.log(
        "LOGIN ERROR:",
        err?.response?.data
      );

      const msg =
        typeof err?.response?.data === "string"
          ? err.response.data
          : "";

      if (msg === "User not found") {
        alert("Username not found");
      } else if (msg === "Wrong password") {
        alert("Wrong password");
      } else {
        alert(msg || "Login failed");
      }
    }
  };

  const handleGoogleLogin = async (token: string | undefined) => {
    setGoogleError("");
    setLoading(true);
    try {
      await googleLogin(token || "");
      // CHANGE: removed success Alert — just navigate
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      const msg = typeof err?.response?.data === "string" ? err.response.data : "";
      // CHANGE: was Alert — now inline under the Google button
      setGoogleError(msg || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        {/* CHANGE: general error banner (replaces Alert for unexpected errors) */}
        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{generalError}</Text>
          </View>
        ) : null}

        {/* CHANGE: inputError border highlight when emailError present */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          style={[styles.input, emailError ? styles.inputError : null]}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => { setEmail(v); setEmailError(""); setGeneralError(""); }}
          onBlur={() => {
            if (email.length > 0 && !validateEmail(email)) {
              setEmailError("Please enter a valid email address.");
            } else {
              setEmailError("");
            }
          }}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(v) => { setPassword(v); setGeneralError(""); }}
        />

        {/* CHANGE: loading spinner inside button */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>LOGIN</Text>}
        </Pressable>

        {/* CHANGE: Google error shown inline instead of Alert */}
        {googleError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{googleError}</Text>
          </View>
        ) : null}

        {/*<Pressable
          style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
          onPress={() => { setGoogleError(""); promptAsync(); }}
          disabled={!request || loading}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </Pressable>*/}

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
    marginBottom: 6,   // CHANGE: was 15, reduced to sit closer to field error text
    color: "white",
  },
  // CHANGE: new styles added below
  inputError: {
    borderWidth: 1.5,
    borderColor: "#f87171",
  },
  errorBanner: {
    width: "100%",
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 13,
    textAlign: "center",
  },
  fieldError: {
    color: "#f87171",
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 12,
  },
  // unchanged below
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#db4437",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "bold" },
  forgot: { marginTop: 15, color: "#facc15" },
  link: { marginTop: 15, color: "#93c5fd" },
});
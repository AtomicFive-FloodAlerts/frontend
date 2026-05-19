import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { loginUser } from "../services/api";

const API_BASE = "https://r9822kjc-8080.asse.devtunnels.ms";

const image = require("@/assets/images/Flood.jpg");

export default function Login() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] =
    useState((params.email as string) || "");

  const [password, setPassword] =
    useState((params.password as string) || "");

  const [loading, setLoading] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");

  const [generalError, setGeneralError] =
    useState("");

  const validateEmail = (val: string) =>
    /\S+@\S+\.\S+/.test(val);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Fill the above fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    setLoading(true);

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

    } finally {

      setLoading(false);
    }
  };

  return (

    <ImageBackground
      source={image}
      resizeMode="cover"
      style={styles.image}
    >

      <View style={styles.container}>

        <Text style={styles.title}>
          Login
        </Text>

        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {generalError}
            </Text>
          </View>
        ) : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          style={[
            styles.input,
            emailError ? styles.inputError : null
          ]}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => {
            setEmail(v);
            setEmailError("");
            setGeneralError("");
          }}
          onBlur={() => {

            if (
              email.length > 0 &&
              !validateEmail(email)
            ) {

              setEmailError(
                "Please enter a valid email address."
              );

            } else {

              setEmailError("");
            }
          }}
        />

        {emailError ? (
          <Text style={styles.fieldError}>
            {emailError}
          </Text>
        ) : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setGeneralError("");
          }}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >

          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>LOGIN</Text>
          }

        </Pressable>

        <Text
          style={styles.link}
          onPress={() => router.push("/register")}
        >
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
    marginBottom: 6,
    color: "white",
  },

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

  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },

  buttonPressed: {
    opacity: 0.7
  },

  buttonText: {
    color: "white",
    fontWeight: "bold"
  },

  link: {
    marginTop: 15,
    color: "#93c5fd"
  },
});
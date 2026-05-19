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

import { useRouter } from "expo-router";

import { registerUser } from "../services/api";

const image = require("@/assets/images/Flood.jpg");

export default function Register() {

  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [nameError, setNameError] =
    useState("");

  const [emailError, setEmailError] =
    useState("");

  const [phoneError, setPhoneError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [generalError, setGeneralError] =
    useState("");

  const validateEmail = (val: string) =>
    /\S+@\S+\.\S+/.test(val);

  const validatePhone = (val: string) =>
    /^[0-9]{7,15}$/.test(val);

  const handleRegister = async () => {

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !password
    ) {

      alert("Fill the above fields");
      return;
    }

    if (!validateEmail(email)) {

      setEmailError("Invalid email format");
      return;
    }

    if (!validatePhone(phoneNumber)) {

      setPhoneError("Invalid phone number");
      return;
    }

    setLoading(true);

    try {

      const res = await registerUser({
        name,
        email,
        phoneNumber,
        password,
      });

      console.log(
        "REGISTER SUCCESS:",
        res.data
      );

      alert("Registration successful");

      setTimeout(() => {

        router.replace({
          pathname: "/login",
          params: {
            email,
            password,
          },
        });

      }, 500);

    } catch (err: any) {

      console.log(
        "REGISTER ERROR:",
        err?.response?.data
      );

      const msg =
        typeof err?.response?.data === "string"
          ? err.response.data
          : "";

      if (msg === "Email already registered") {

        alert("User already exists");

      } else {

        alert(msg || "Registration failed");
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
          Register
        </Text>

        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {generalError}
            </Text>
          </View>
        ) : null}

        <TextInput
          placeholder="Name"
          placeholderTextColor="#ddd"
          style={styles.input}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setNameError("");
          }}
        />

        {nameError ? (
          <Text style={styles.fieldError}>
            {nameError}
          </Text>
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
          }}
        />

        {emailError ? (
          <Text style={styles.fieldError}>
            {emailError}
          </Text>
        ) : null}

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#ddd"
          style={[
            styles.input,
            phoneError ? styles.inputError : null
          ]}
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(v) => {
            setPhoneNumber(v);
            setPhoneError("");
          }}
        />

        {phoneError ? (
          <Text style={styles.fieldError}>
            {phoneError}
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
            setPasswordError("");
          }}
        />

        {passwordError ? (
          <Text style={styles.fieldError}>
            {passwordError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >

          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>REGISTER</Text>
          }

        </Pressable>

        <Text
          style={styles.link}
          onPress={() => router.push("/login")}
        >
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
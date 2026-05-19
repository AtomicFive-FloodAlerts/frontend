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

import { useRouter } from "expo-router";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { googleLogin, registerUser } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

const image = require("@/assets/images/Flood.jpg");

export default function Register() {
  const router = useRouter();

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);

  // CHANGE: one error state per field + general + google (was only emailError)
  const [nameError, setNameError]         = useState("");
  const [emailError, setEmailError]       = useState("");
  const [phoneError, setPhoneError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError]   = useState("");
  const [googleError, setGoogleError]     = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@sesathviiyaah/FloodAlerts",
    androidClientId: "628231108912-sifnnfqbrjq6gluvfq6pd2cmr2dd4he7.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      handleGoogleRegister(token);
    } else if (response?.type === "error") {
      // CHANGE: was silently ignored
      setGoogleError("Google sign-in failed. Please try again.");
    }
  }, [response]);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);
  // CHANGE: added phone validation
  const validatePhone = (val: string) => /^[0-9]{7,15}$/.test(val);

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

      if (
        msg === "Email already registered"
      ) {
        alert("User already exists");
      } else {
        alert(msg || "Registration failed");
      }
    }
  };

  const handleGoogleRegister = async (token: string | undefined) => {
    setGoogleError("");
    setLoading(true);
    try {
      await googleLogin(token || "");
      // CHANGE: removed success Alert — navigate directly
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      const msg = typeof err?.response?.data === "string" ? err.response.data : "";
      // CHANGE: was Alert — now inline
      setGoogleError(msg || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        {/* CHANGE: general error banner */}
        {generalError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{generalError}</Text>
          </View>
        ) : null}

        {/* CHANGE: red border + field error text under each input */}
        <TextInput
          placeholder="Name"
          placeholderTextColor="#ddd"
          style={[styles.input, nameError ? styles.inputError : null]}
          value={name}
          onChangeText={(v) => { setName(v); setNameError(""); }}
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ddd"
          style={[styles.input, emailError ? styles.inputError : null]}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => { setEmail(v); setEmailError(""); }}
          onBlur={() => {
            if (email.length > 0 && !validateEmail(email)) {
              setEmailError("Please enter a valid email address.");
            }
          }}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <TextInput
          placeholder="Phone"
          placeholderTextColor="#ddd"
          style={[styles.input, phoneError ? styles.inputError : null]}
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(v) => { setPhoneNumber(v); setPhoneError(""); }}
          onBlur={() => {
            if (phoneNumber.length > 0 && !validatePhone(phoneNumber)) {
              setPhoneError("Enter a valid phone number (digits only, 7–15 digits).");
            }
          }}
        />
        {phoneError ? <Text style={styles.fieldError}>{phoneError}</Text> : null}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry
          style={[styles.input, passwordError ? styles.inputError : null]}
          value={password}
          onChangeText={(v) => { setPassword(v); setPasswordError(""); }}
        />
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        {/* CHANGE: loading spinner inside button */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.buttonText}>REGISTER</Text>}
        </Pressable>

        {/* CHANGE: Google error inline instead of Alert */}
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
          <Text style={styles.buttonText}>Register with Google</Text>
        </Pressable>*/}

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
    marginBottom: 6,   // CHANGE: was 15
    color: "white",
  },
  // CHANGE: new styles
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
  link: { marginTop: 15, color: "#93c5fd" },
});
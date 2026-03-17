import useTheme from "@/hooks/useTheme";
import { Link } from "expo-router";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

//needs work !!
const { isDarkMode, toggleDarkMode, colors } = useTheme();

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        You will be able to change your app settings here in the future. For now, this is just a placeholder.
      </Text>
      <Button onPress={toggleDarkMode} title={isDarkMode ? "Light Mode" : "Dark Mode"} />

      <Link href="/" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: 24,
  },
  button: {
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
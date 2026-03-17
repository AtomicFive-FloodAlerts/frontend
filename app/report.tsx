import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Report() {
  return (
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
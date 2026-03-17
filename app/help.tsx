import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function AboutScreen() {
  return (
    
    <View style={styles.container}>
        <Text style={styles.title}>Help Alert Page</Text>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
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
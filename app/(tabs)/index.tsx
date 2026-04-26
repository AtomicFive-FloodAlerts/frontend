import { Link } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const image = require("@/assets/images/Flood.jpg")

export default function HomeScreen() {
  return (
    <View style={styles.container}>
        <SafeAreaProvider>
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <Text style={styles.title}>Disaster Alert App</Text>

      <Link href="/report" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Report a Disaster</Text>
        </Pressable>
      </Link>

      <Link href="/help" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Alert for Help</Text>
        </Pressable>
      </Link>

      <Link href="/danger" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Current Danger Zones</Text>
        </Pressable>
      </Link>

      <Link href="../about" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>About This App</Text>
        </Pressable>
      </Link>
            </ImageBackground>
    </SafeAreaView>
  </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    width: 250,
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
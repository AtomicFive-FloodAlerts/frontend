import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * LowPowerModeScreen
 * This screen simulates a "Low Power Mode" for flood alert situations. When activated, it:
 * What it does:
 *   1. Hides all normal UI (renders its own full-screen black overlay)
 *   2. Pings location ONCE then stops GPS
 *   3. Sends a push notification alert to the user (flood alert)
 *   4. Shows ONLY one button: EXIT LOW POWER MODE
 */


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function LowPowerModeScreen({ onExit }) {
  const [locationPinged, setLocationPinged] = useState(false);
  const [locationText, setLocationText] = useState('Acquiring location...');
  const [notifSent, setNotifSent] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  //  One-time location ping
  useEffect(() => {
    let isMounted = true;

    async function pingLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) setLocationText('Location permission denied.');
          return;
        }

        // Single location fetch 
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          const { latitude, longitude } = loc.coords;
          setLocationText(
            `Last known: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          );
          setLocationPinged(true);
        }
      } catch (err) {
        if (isMounted) setLocationText('Location unavailable.');
      }
    }

    pingLocation();
    return () => { isMounted = false; };
  }, []);

  // Send push notification alert once location is pinged 
  useEffect(() => {
    if (!locationPinged || notifSent) return;

    async function sendFloodAlert() {
      try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: ' FLOOD ALERT — LOW POWER MODE ACTIVE',
            body:
              'Your device has entered Low Power Mode. Location has been recorded. Stay safe and follow evacuation instructions.',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            color: '#FF0000',
          },
          trigger: null, 
        });

        setNotifSent(true);
      } catch (err) {
        console.warn('Notification error:', err);
      }
    }

    sendFloodAlert();
  }, [locationPinged, notifSent]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      
      <View style={styles.header}>
        <Animated.View style={[styles.alertDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.headerTitle}>LOW POWER MODE</Text>
      </View>

      <View style={styles.statusBlock}>
        <Text style={styles.statusLabel}>FLOOD ALERT SYSTEM</Text>
        <Text style={styles.statusDivider}>────────────────────</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>GPS</Text>
          <Text style={[styles.statusValue, locationPinged && styles.done]}>
            {locationPinged ? '✓ PINGED · OFF' : '⏳ ACQUIRING...'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>ALERT</Text>
          <Text style={[styles.statusValue, notifSent && styles.done]}>
            {notifSent ? '✓ SENT' : locationPinged ? '⏳ SENDING...' : '– PENDING'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>UI</Text>
          <Text style={[styles.statusValue, styles.done]}>✓ MINIMAL</Text>
        </View>

        <Text style={styles.statusDivider}>────────────────────</Text>
        <Text style={styles.locationText}>{locationText}</Text>
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={onExit} activeOpacity={0.7}>
        <Text style={styles.exitButtonText}>EXIT LOW POWER MODE</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        All non-essential features are disabled to conserve battery.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    ...(Platform.OS === 'ios' ? {} : {}), 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  alertDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
  },

  statusBlock: {
    width: '100%',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    padding: 20,
    marginBottom: 48,
  },
  statusLabel: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDivider: {
    color: '#333333',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  statusKey: {
    color: '#555555',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
  },
  statusValue: {
    color: '#888888',
    fontSize: 13,
    letterSpacing: 1,
  },
  done: {
    color: '#CCCCCC',
  },
  locationText: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  exitButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 4,
  },

  footerNote: {
    color: '#333333',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

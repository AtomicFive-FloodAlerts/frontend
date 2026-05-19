import useTheme from "@/hooks/useTheme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";


// Team Data
// I will replace dummy data later (OR replace yours if possible)

const TEAM_MEMBERS = [
  {
    name: "P Shaeshanth",
    id: "240616J",
    role: "Team Leader",
    social: {
      email: "shaeshanth@gmail.com",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
    },
  },
  {
    name: "Nethmie ND",
    id: "240142C",
    role: "Developer",
    social: {
      email: "nethmie@gmail.com",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
    },
  },
  {
    name: "MNF Shameera",
    id: "240617M",
    role: "Developer",
    social: {
      email: "shameera@gmail.com",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
    },
  },
  {
    name: "R Sesathviiyaah",
    id: "240612T",
    role: "Developer",
    social: {
      email: "sesathviiyaah@gmail.com",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
    },
  },
  {
    name: "T Kulunu",
    id: "240643M",
    role: "Developer",
    social: {
      email: "kulunu@gmail.com",
      github: "https://github.com/",
      linkedin: "https://linkedin.com/",
      instagram: "https://instagram.com/",
    },
  },
];

// Features


const FEATURES = [
  {
    icon: "🗺️",
    title: "Real-time Flood Severity Maps",
    desc:
      "Dynamic mapping integrates multi-source data to show live severity gradients across your region.",
    dark: false,
  },
  {
    icon: "👥",
    title: "Community Flood Reports",
    desc:
      "Crowdsourced intelligence from boots on the ground for hyper-local verification.",
    dark: false,
  },
  {
    icon: "📍",
    title: "Location-based Alerts",
    desc:
      "Push notifications sent to your device the moment danger enters your geofenced area.",
    dark: true,
  },
  {
    icon: "📈",
    title: "Flood Trend Analysis",
    desc:
      "Analytics that predict potential paths and timing of rising water based on real-time trends.",
    dark: false,
  },
];


// Feature Card

function FeatureCard({
  icon,
  title,
  desc,
  dark = false,
  colors,
}: any) {
  return (
    <View
      style={[
        styles.featureCard,
        dark
          ? {
              backgroundColor:
                colors.primary,
            }
          : {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              borderWidth: 1,
            },
      ]}
    >
      <View
        style={[
          styles.featureIconBox,
          {
            backgroundColor: dark
              ? "rgba(255,255,255,0.15)"
              : colors.bg,
          },
        ]}
      >
        <Text style={styles.featureIcon}>
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.featureTitle,
          {
            color: dark
              ? "#fff"
              : colors.text,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.featureDesc,
          {
            color: dark
              ? "rgba(255,255,255,0.8)"
              : colors.textMuted ||
                colors.text,
          },
        ]}
      >
        {desc}
      </Text>
    </View>
  );
}


// Member Card function

function MemberCard({
  member,
  colors,
}: any) {
  const [expanded, setExpanded] =
    useState(false);

  return (
    <View
      style={[
        styles.memberCard,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() =>
          setExpanded(!expanded)
        }
        style={styles.memberHeader}
      >
        <View>
          <Text
            style={[
              styles.memberName,
              {
                color: colors.text,
              },
            ]}
          >
            {member.name}
          </Text>

          <Text
            style={[
              styles.memberId,
              {
                color:
                  colors.textMuted ||
                  colors.text,
              },
            ]}
          >
            {member.id}
          </Text>
        </View>

        <Text
          style={[
            styles.expandIcon,
            {
              color:
                colors.primary,
            },
          ]}
        >
          {expanded ? "−" : "+"}
        </Text>
      </Pressable>

      {expanded && (
        <View
          style={
            styles.memberExpanded
          }
        >
          <Text
            style={[
              styles.memberRole,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {member.role}
          </Text>

          <Pressable
            onPress={() =>
              Linking.openURL(
                `mailto:${member.social.email}`
              )
            }
          >
            <Text
              style={[
                styles.socialLink,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              📧 Email
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              Linking.openURL(
                member.social.github
              )
            }
          >
            <Text
              style={[
                styles.socialLink,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              💻 GitHub
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              Linking.openURL(
                member.social.linkedin
              )
            }
          >
            <Text
              style={[
                styles.socialLink,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              🔗 LinkedIn
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              Linking.openURL(
                member.social
                  .instagram
              )
            }
          >
            <Text
              style={[
                styles.socialLink,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              📸 Instagram
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}


// Screen

export default function AboutScreen() {
  const { colors: c } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: c.bg,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scroll
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.push("/")
            }
            style={[
              styles.backButton,
              {
                backgroundColor:
                  c.surface,
                borderColor:
                  c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.backButtonText,
                {
                  color:
                    c.primary,
                },
              ]}
            >
              ← Back to Home
            </Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor:
                c.primary,
            },
          ]}
        >
          <View
            style={styles.heroBadge}
          >
            <Text
              style={
                styles.heroBadgeText
              }
            >
              THE RESILIENT SIGNAL
            </Text>
          </View>

          <Text
            style={styles.heroTitle}
          >
            Flood{"\n"}Alerts
          </Text>

          <View
            style={styles.heroLine}
          />

          <Text
            style={styles.heroSub}
          >
            Object-Oriented Software
            Development
          </Text>
        </View>

        {/* Mission */}
        <View
          style={styles.missionWrap}
        >
          <View
            style={[
              styles.missionCard,
              {
                backgroundColor:
                  c.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.missionHeading,
                {
                  color:
                    c.primary,
                },
              ]}
            >
              Our Mission
            </Text>

            <Text
              style={[
                styles.missionBody,
                {
                  color:
                    c.textMuted ||
                    c.text,
                },
              ]}
            >
              The Flood Tracking and
              Alert Application is a
              mobile-based disaster
              monitoring system that
              leverages crowdsourced
              data and real-time
              location services to
              provide timely alerts
              and improve public
              safety.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: c.text,
              },
            ]}
          >
            Key Features
          </Text>

          <View
            style={[
              styles.sectionUnderline,
              {
                backgroundColor:
                  c.primary,
              },
            ]}
          />

          {FEATURES.map(
            (feature) => (
              <FeatureCard
                key={
                  feature.title
                }
                {...feature}
                colors={c}
              />
            )
          )}
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: c.text,
              },
            ]}
          >
            Team Atomic Five
          </Text>

          <View
            style={[
              styles.sectionUnderline,
              {
                backgroundColor:
                  c.primary,
              },
            ]}
          />

          <Text
            style={[
              styles.teamText,
              {
                color:
                  c.textMuted ||
                  c.text,
              },
            ]}
          >
            GROUP — Atomic Five
            {"\n"}
            MODULE — CS1040
            {"\n"}
            METHOD — OOSD
          </Text>

          {TEAM_MEMBERS.map(
            (member) => (
              <MemberCard
                key={member.id}
                member={member}
                colors={c}
              />
            )
          )}
        </View>

        <View
          style={styles.bottomPad}
        />
      </ScrollView>
    </View>
  );
}

// Styles

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
    },

    scroll: {
      paddingBottom: 40,
    },

    header: {
      paddingTop: 60,
      paddingHorizontal: 16,
      marginBottom: 12,
    },

    backButton: {
      alignSelf: "flex-start",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
    },

    backButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },

    hero: {
      paddingTop: 50,
      paddingBottom: 64,
      paddingHorizontal: 24,
      borderBottomLeftRadius: 48,
    },

    heroBadge: {
      alignSelf: "flex-start",
      backgroundColor:
        "rgba(255,255,255,0.15)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 14,
    },

    heroBadgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
    },

    heroTitle: {
      fontSize: 52,
      fontWeight: "900",
      color: "#fff",
      lineHeight: 54,
    },

    heroLine: {
      width: 56,
      height: 4,
      backgroundColor:
        "rgba(255,255,255,0.35)",
      borderRadius: 99,
      marginVertical: 16,
    },

    heroSub: {
      color:
        "rgba(255,255,255,0.75)",
      fontSize: 13,
      fontWeight: "500",
    },

    missionWrap: {
      paddingHorizontal: 16,
      marginTop: -36,
    },

    missionCard: {
      borderRadius: 28,
      padding: 28,
      elevation: 8,
    },

    missionHeading: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 12,
    },

    missionBody: {
      fontSize: 15,
      lineHeight: 24,
    },

    section: {
      paddingHorizontal: 16,
      marginTop: 32,
    },

    sectionTitle: {
      fontSize: 24,
      fontWeight: "800",
    },

    sectionUnderline: {
      width: 36,
      height: 3,
      borderRadius: 10,
      marginTop: 6,
      marginBottom: 20,
    },

    featureCard: {
      borderRadius: 24,
      padding: 22,
      marginBottom: 12,
    },

    featureIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 16,
    },

    featureIcon: {
      fontSize: 22,
    },

    featureTitle: {
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 8,
    },

    featureDesc: {
      fontSize: 13,
      lineHeight: 20,
    },

    teamText: {
      fontSize: 14,
      lineHeight: 24,
      marginBottom: 20,
    },

    memberCard: {
      borderWidth: 1,
      borderRadius: 20,
      marginBottom: 12,
      overflow: "hidden",
    },

    memberHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      padding: 20,
    },

    memberExpanded: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    memberName: {
      fontSize: 17,
      fontWeight: "800",
    },

    memberId: {
      marginTop: 4,
      fontSize: 13,
    },

    memberRole: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 14,
    },

    socialLink: {
      fontSize: 14,
      marginBottom: 10,
    },

    expandIcon: {
      fontSize: 24,
      fontWeight: "700",
    },

    bottomPad: {
      height: 30,
    },
  });
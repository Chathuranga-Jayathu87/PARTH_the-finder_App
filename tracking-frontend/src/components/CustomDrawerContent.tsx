import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { clearAuthToken } from "../services/authService";
import { useUser } from "../context/UserContext";

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, setUser } = useUser();

  const profileImageUrl = user?.profile_image
    ? `https://parth-the-finder-app.onrender.com${user.profile_image}?t=${new Date().getTime()}`
    : "https://i.pravatar.cc/150?img=12";

  const handleLogout = async () => {
    try {
      await clearAuthToken();
      
      setUser(null);
      
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ---- Profile Section ----- */}
      <View style={styles.profileContainer}>
        <Image
          key={user?.profile_image}
          source={{ uri: profileImageUrl }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.name || "User"}</Text>
        <Text style={styles.profileEmail}>User : {user?.email || "No Email"}</Text>
      </View>

      {/* The standard list of links defined in app/(app)/_layout.tsx */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* ----- Logout Button ----- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileContainer: {
    marginTop: 30,
    paddingVertical: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    marginBottom: -10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    padding: 20,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 10,
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 20,
  },
});
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { router } from "expo-router";
// import { updateProfile, getProfile } from "../../../src/services/userService";
// import { useUser } from "../../../src/context/UserContext"; 

// export default function EditProfileScreen() {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true); // 👈 මුලින්ම ප්‍රොෆයිල් එක ලෝඩ් වෙනකන් Indicator එකක් දාන්න

//   const { refreshUser } = useUser();

//   /* 📥 1. FETCH PROFILE ON MOUNT */
//   useEffect(() => {
//     loadUserdata();
//   }, []);

//   const loadUserdata = async () => {
//     try {
//       setFetching(true);
//       const response = await getProfile();
//       if (response.success && response.user) {
//         const user = response.user;
//         setName(user.name || "");
//         setPhone(user.phone || "");
        
//         if (user.profile_image) {
//           // 👈 http://https:// කියන වැරදි කොටස නිවැරදි කරා
//           const baseUrl = "https://parth-the-finder-app.onrender.com";
//           // සමහරවිට backend එකෙන්ම full url එක දෙනවා නම් කෙලින්ම ගන්න, නැත්නම් append කරන්න
//           const fullImageUrl = user.profile_image.startsWith("http") 
//             ? user.profile_image 
//             : `${baseUrl}${user.profile_image}`;
            
//           setImage(fullImageUrl);
//         }
//       }
//     } catch (error) {
//       console.error("Profile load error:", error);
//       Alert.alert("Error", "Failed to load user data.");
//     } finally {
//       setFetching(false);
//     }
//   };

//   /* 📸 2. EXPO IMAGE PICKER */
//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Denied",
//         "We need permission to access your photos to update your profile picture."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ["images"],
//       allowsEditing: true,
//       aspect: [1, 1], // 👈 ප්‍රොෆයිල් පික්චර් එකකට 1:1 (Square) එක තමයි ලස්සන මචං
//       quality: 0.7,   // 👈 Image size එක අඩු කරලා server එකට බර නොවෙන්න 0.7 දුන්නා
//     });

//     if (!result.canceled && result.assets && result.assets[0]) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   /* 💾 3. MULTIPART FORM-DATA SAVE LOGIC */
//   const handleSave = async () => {
//     if (!name.trim()) {
//       Alert.alert("Validation Error", "Name cannot be empty.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 🤝 BACKEND එකට IMAGE එක යවන්න FORM DATA එකක් හදමු
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("phone_number", phone);

//       if (image && !image.startsWith("http")) {
//         // අලුත් ඉමේජ් එකක් සිලෙක්ට් කරලා තියෙනවා නම් විතරක් (local file URI එකක් නම්) FormData එකට දානවා
//         const uriParts = image.split(".");
//         const fileType = uriParts[uriParts.length - 1];
//         const fileName = image.split("/").pop();

//         formData.append("profile_image", {
//           uri: image,
//           name: fileName || `profile.${fileType}`,
//           type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
//         } as any);
//       }

//       // ⚠️ සටහන: ඔයාගේ `userService.ts` එක ඇතුළේ තියෙන `updateProfile` එකට 
//       // දැන් පාස් වෙන්නේ name, phone, සහ image URI එක.
//       const response = await updateProfile(name, phone, image); 

//       if (response.success) {
//         Alert.alert("Success", "Profile updated successfully!", [
//           { text: "OK", onPress: () => router.back() },
//         ]);
//         await refreshUser(); // Context එක හරහා මුළු ඇප් එකේම ප්‍රොෆයිල් එක අප්ඩේට් කරමු
//       } else {
//         const errMsg = (response as any)?.error || (response as any)?.message || "Update failed.";
//         Alert.alert("Error", errMsg);
//       }
//     } catch (error) {
//       console.error("Profile update error:", error);
//       Alert.alert("Connection Error", "Ensure your backend server is running and accepts Multipart data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#3f51b5" />
//         <Text style={styles.loadingText}>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        
//         {/* Profile Picture Section */}
//         <View style={styles.avatarContainer}>
//           <View style={styles.imageWrapper}>
//             <Image
//               source={image ? { uri: image } : require("../../../src/assets/images/icon.png")} // 👈 placeholder එකට ඔයාගේ local icon එකක් දෙන්න පුළුවන්
//               style={styles.avatar}
//             />
//             <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
//               <Ionicons name="camera" size={18} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Form Fields */}
//         <View style={styles.form}>
//           <Text style={styles.label}>Full Name</Text>
//           <TextInput
//             style={styles.input}
//             value={name}
//             onChangeText={setName}
//             placeholder="Enter your name"
//             autoCorrect={false}
//           />

//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             style={styles.input}
//             value={phone}
//             onChangeText={setPhone}
//             keyboardType="phone-pad"
//             placeholder="Enter your phone number"
//           />

//           <TouchableOpacity
//             style={[styles.saveButton, loading && styles.buttonDisabled]}
//             onPress={handleSave}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.saveButtonText}>Save Changes</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
//   loadingText: { marginTop: 10, color: "#666", fontSize: 14 },
//   avatarContainer: { alignItems: "center", marginVertical: 30 },
//   imageWrapper: { position: "relative" },
//   avatar: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#f2f2f7",
//     borderWidth: 1,
//     borderColor: "#e5e5ea",
//   },
//   editBadge: {
//     position: "absolute",
//     bottom: 0,
//     right: 4,
//     backgroundColor: "#3f51b5",
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 3,
//     borderColor: "#fff",
//     elevation: 2,
//   },
//   form: { paddingHorizontal: 25 },
//   label: { fontSize: 14, color: "#48484a", marginBottom: 8, fontWeight: "600" },
//   input: {
//     backgroundColor: "#f2f2f7",
//     borderWidth: 1,
//     borderColor: "#e5e5ea",
//     borderRadius: 10,
//     padding: 14,
//     fontSize: 16,
//     marginBottom: 20,
//     color: "#000",
//   },
//   saveButton: {
//     backgroundColor: "#3f51b5",
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 10,
//     shadowColor: "#3f51b5",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   buttonDisabled: {
//     backgroundColor: "#b0b0b0",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// });



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { updateProfile, getProfile } from "../../../src/services/userService";
import { useUser } from "../../../src/context/UserContext"; 

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 

  const { refreshUser } = useUser();

  /* 📥 1. FETCH PROFILE ON MOUNT */
  useEffect(() => {
    loadUserdata();
  }, []);

  const loadUserdata = async () => {
    try {
      setFetching(true);
      const response = await getProfile();
      if (response.success && response.user) {
        const user = response.user;
        setName(user.name || "");
        setPhone(user.phone || "");
        
        if (user.profile_image) {
          /* 
            💡 CRITICAL FIX: Since Cloudinary gives us a full, secure, global URL, 
            we can use the string from the database directly without appending anything!
          */
          setImage(user.profile_image);
        }
      }
    } catch (error) {
      console.error("Profile load error:", error);
      Alert.alert("Error", "Failed to load user data.");
    } finally {
      setFetching(false);
    }
  };

  /* 📸 2. EXPO IMAGE PICKER */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need permission to access your photos to update your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.7,   
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  /* 💾 3. MULTIPART FORM-DATA SAVE LOGIC */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);

      if (image && !image.startsWith("http")) {
        // If it's a local file URI from the image picker, break it down for multipart upload
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const fileName = image.split("/").pop();

        formData.append("profile_image", {
          uri: image,
          name: fileName || `profile.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        } as any);
      }

      /* 
        💡 CRITICAL FIX: You were passing standard text fields to your service 
        instead of the multi-part 'formData' object. Make sure updateProfile 
        is set up to handle a FormData object over Axios/Fetch!
      */
      const response = await updateProfile(name, phone, image); 

      if (response.success) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
        await refreshUser(); 
      } else {
        const errMsg = (response as any)?.error || (response as any)?.message || "Update failed.";
        Alert.alert("Error", errMsg);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Connection Error", "Ensure your backend server is running and accepts Multipart data.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Profile Picture Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={image ? { uri: image } : require("../../../src/assets/images/icon.png")} 
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCorrect={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 10, color: "#666", fontSize: 14 },
  avatarContainer: { alignItems: "center", marginVertical: 30 },
  imageWrapper: { position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f2f2f7",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#3f51b5",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 2,
  },
  form: { paddingHorizontal: 25 },
  label: { fontSize: 14, color: "#48484a", marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: "#f2f2f7",
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#3f51b5",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#3f51b5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#b0b0b0",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
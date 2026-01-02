// components/CustomDrawerContent.js
import React from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { clearAuthToken } from '@/src/services/authService';
import { useUser } from '@/src/context/UserContext';



export default function CustomDrawerContent(props:any) {
  const { user } = useUser();


   const profileImageUrl = user?.profile_image 
    ? `http://172.20.10.3:5000${user.profile_image}?t=${new Date().getTime()}`
    : 'https://i.pravatar.cc/150?img=12';
      //const isDrawerOpen = useDrawerStatus() === 'open';
//const isDrawerOpen = useDrawerStatus() === 'open';


// const [name, setName] = useState('');
// const [email, setEmail] = useState('');
// const [phone, setPhone] = useState('');
// const [image, setImage] = useState<string | null>(null);


// useEffect(() => {
//   // Listen for the 'profileUpdated' event
//   const subscription = DeviceEventEmitter.addListener('profileUpdated', () => {
//     loadUserdata(); // Refresh data when the event hits
//   });

//   return () => subscription.remove(); // Clean up
// }, []);

// useEffect(() => {
//     if (isDrawerOpen) {
//       loadUserdata();
//     }
//   }, [isDrawerOpen]);


//     const loadUserdata = async () => {
//       console.log("Loading user data in drawer...");
//         try {
//             const response = await getProfile();
//             if (response.success) {
//                 const user = response.user;
//                 setName(user.name || '');
//                 setEmail(user.email || '');
//                 setPhone(user.phone_number || '');
//                 if (user.profile_image) {
//                     const fullImageUrl = `http://172.20.10.3:5000${user.profile_image}?t=${Date.now()}`;
//                     setImage(fullImageUrl);
//                 }
//             }
//         } catch (error) {   
//             Alert.alert("Error", "Failed to load user data.");
//         }

//     };


  const handleLogout = async () => {
    // 1. Clear AsyncStorage (token)
    await clearAuthToken();
    // 2. Redirect to the login screen
    router.replace('/(auth)/Login');
  };

  return (
    <View style={styles.container}>

     {/* ---- profile Section ----- */}
    
      <View style={styles.profileContainer}>
      <Image
        key={user?.profile_image}
        source={{uri: profileImageUrl}}
        style={styles.profileImage}
        />
      
        <Text style={styles.profileName}>{user?.name} </Text>
        <Text style={styles.profileEmail}>User : {user?.email} </Text>
      </View>
      
          {/* The standard list of links defined in app/(app)/_layout.js */}
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
  container: { flex: 1,
    backgroundColor: '#fff',
   },
  profileContainer: {
    marginTop:30,
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    marginBottom: -10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '600',
    color:'#333'
  },
  profileEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
   /* Footer */
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    padding: 20,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 10,
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});

import { useFonts } from 'expo-font';
import { SplashScreen } from "expo-router";
import { useAuthContext } from '../contexts/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import colors from '../colors';
import Signin from '../screens/Signin';
import Profile from '../screens/Profile';
import Sports from '../screens/Sports';

SplashScreen.preventAutoHideAsync();

const NativeStack = createNativeStackNavigator();
const Stack = createStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();


type HomeStackParamList = {
    Home: undefined;
    MainTabs: undefined;
    Signin: undefined;

}

const Navigation = () => {
    const [fontsLoaded, error] = useFonts({
        "Figtree-Light": require("../../assets/fonts/Figtree-Light.ttf"), //300
        "Figtree-Regular": require("../../assets/fonts/Figtree-Regular.ttf"), //400
        "Figtree-Medium": require("../../assets/fonts/Figtree-Medium.ttf"), //500
        "Figtree-SemiBold": require("../../assets/fonts/Figtree-SemiBold.ttf"), //600
        "Figtree-Bold": require("../../assets/fonts/Figtree-Bold.ttf"), //700
        "Figtree-ExtraBold": require("../../assets/fonts/Figtree-ExtraBold.ttf"), //800
        "Figtree-Black": require("../../assets/fonts/Figtree-Black.ttf"), //900
    });

    const { authUser, loading, updateAuthUser, theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();

    useEffect(() => {
        console.log(authUser)
    }, [])

    const HomeStack = () => (
        <NativeStack.Navigator screenOptions={{ headerShown: false }}>
            <NativeStack.Screen name="HomeScreen" component={Home} options={{
                title: 'Announcements',
            }} />
        </NativeStack.Navigator>
    );

    const MainTabNavigator = () => (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: 'home' | 'home-outline' | 'trophy' | 'trophy-outline' | 'person' | 'person-outline' = 'home';

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Sports') {
                    iconName = focused ? 'trophy' : 'trophy-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.text[theme].primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                backgroundColor: colors.background[theme].modalTranslucent
            },
            headerShown: false,
        })}>
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Sports" component={Sports} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
      );
    
    useEffect(() => {
        if (error) throw error;

        if (fontsLoaded && !loading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error, loading, updateAuthUser]);

    if (!fontsLoaded || loading) {
        return null;
      }

    return (
        <>
            {authUser ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Signin" component={Signin} />
                </Stack.Navigator>
            )}
        </>
    );
};

export default Navigation;
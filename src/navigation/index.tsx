import { useFonts } from 'expo-font';
import { SplashScreen } from "expo-router";
import { AuthUserType, useAuthContext } from '../contexts/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Use this one
import { NavigationContainer, useNavigation } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack'; // Remove this import
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import { Text, View, Image } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import colors from '../colors';
import Signin from '../screens/Signin';
import Profile from '../screens/Profile';
import Sports from '../screens/Sports';
import ParentSignIn from '../screens/ParentSignIn';

import SportsHome from '../screens/Sports/index';
import SportsSearch from '../screens/Sports/Search';
import SportsLeague from '../screens/Sports/League';
import SportsTeam from '../screens/Sports/Team';
import SportsGame from '../screens/Sports/Game';
import Sharegame from '../screens/Sports/Sharegame';
import { MeshGradientView } from 'expo-mesh-gradient';
import Notifications from '../screens/Sports/Notifications';
import SharegameStory from '../screens/Sports/SharegameStory';
import Resources from '../screens/Resources';
import Rcreate from '../screens/Resources/RCreate';
import Menu from '../screens/Resources/Menu';
import ProfileGen from '../components/ProfileGen';
import Create from '../screens/Home/Create';
import ImagePreview from '../screens/Home/ImagePreview';
import AddFile, { FileData } from '../screens/Home/AddFile';
import AddLink, { LinkData } from '../screens/Home/AddLink';
import AddDate, { DateType } from '../screens/Home/AddDate';
import ViewModal from '../screens/Home/ViewModal';

SplashScreen.preventAutoHideAsync();

// Standardize on createNativeStackNavigator
const AppStack = createNativeStackNavigator(); // Used for the main app flow
const SportsInnerStack = createNativeStackNavigator(); // Used for the Sports specific flow
const Tab = createBottomTabNavigator();
const ResourceInnerStack = createNativeStackNavigator(); // Used for the Sports specific flow

type AnnouncementDetails = {
    id: string;
    title: string;
    body: string;
    picture?: string;
    startDate: string;
    endDate: string;
}

// Define parameter list for the SportsInnerStack
export type SportsStackParamList = {
    SportsHome: { org: string };
    SportsSearch: { search?: string; org: string };
    SportsLeague: { league: string; org: string };
    SportsTeam: { team: string; league: string; org: string };
    SportsGame: {
        homeTeam: string;
        awayTeam: string;
        homeScore: string;
        awayScore: string;
        league: string;
        notes: string;
    };
    SportsShareGame: {
        org: string,
        mode: "Story" | "Post",
        homeTeam: string,
        awayTeam: string,
        homeScore: string,
        awayScore: string,
    };
    ShareGameStory: {
        org: string,
        mode: "Story" | "Post",
        homeTeam: string,
        awayTeam: string,
        homeScore: string,
        awayScore: string
    }
}

export type HomeStackParamList = {
    [x: string]: any; // Keep this for flexibility if needed, but try to be more specific
    Home: undefined;
    MainTabs: undefined;
    Signin: undefined;
    ParentSignIn: undefined;
    Testrun: undefined;
    Game: {
        homeTeam: string;
        awayTeam: string;
        homeScore: string;
        awayScore: string;
        league: string;
        notes: string;
    };
    League: {
        league: string;
        org: string;
    };
    Team: {
        team: string;
        league: string;
        org: string;
    };
    ShareGame: {
        org: string,
        mode: "Story" | "Post",
        homeTeam: string,
        awayTeam: string,
        homeScore: string,
        awayScore: string
    }
    ShareGameStory: {
        org: string,
        mode: "Story" | "Post",
        homeTeam: string,
        awayTeam: string,
        homeScore: string,
        awayScore: string
    }
    RCreateScreen: {
        id?: string;
        defaultTitle?: string;
        defaultIcon?: string;
        defaultIconColor?: string;
        defaultLink?: string;
    };
    ACreate: {
  
    };
    AddFile: {
        fileChange: (file: FileData | null) => void; 
    }
    AddLink: {
        linkChange: (link: LinkData | null) => void;
    }
    AddDate: {
        dateChange: (date: DateType | null) => void;
        startDefault: Date;
        endDefault: Date;
    }
    Sports: undefined;
    Profile: undefined;
    ImagePreview: {
        image: string;
    }
    ViewModal: {
        id: number;
    }
}

// Define SportsNavigator outside to avoid re-creation on every render
const SportsNavigator = () => (
    <SportsInnerStack.Navigator screenOptions={{ headerShown: false }}>
        <SportsInnerStack.Screen name="SportsHome" component={SportsHome} />
        <SportsInnerStack.Screen name="SportsSearch" component={SportsSearch} />
        <SportsInnerStack.Screen name="SportsLeague" component={SportsLeague} />
        <SportsInnerStack.Screen name="SportsTeam" component={SportsTeam} />
        <SportsInnerStack.Screen name="SportsGame" component={SportsGame} />
        <SportsInnerStack.Screen name="SportsShareGame" component={Sharegame} options={{ presentation: 'modal' }} />
        <SportsInnerStack.Screen name="SportsShareGameStory" component={SharegameStory} options={{ presentation: 'modal' }} />
        <SportsInnerStack.Screen name="SportsNotifications" component={Notifications} options={{ presentation: 'modal' }} />
    </SportsInnerStack.Navigator>
);

const ResourceNavigator = () => (
    <ResourceInnerStack.Navigator screenOptions={{ headerShown: false }}>
        <ResourceInnerStack.Screen name="Resources" component={Resources} />
        <ResourceInnerStack.Screen name="Menu" component={Menu} options={{ presentation: 'modal' }} />
    </ResourceInnerStack.Navigator>
)


const MainTabNavigator = () => {
    const { authUser, theme } = useAuthContext();

    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: 'home' | 'home-outline' | 'trophy' | 'trophy-outline' | 'person' | 'person-outline' | 'grid' | 'grid-outline' = 'home';

                if (route.name === 'SportsTab') { // Changed from 'Sports' to 'SportsTab' as per your Tab.Screen name
                    iconName = focused ? 'trophy' : 'trophy-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                } else if (route.name === 'Home') { // If you later add a dedicated Home tab
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Resources') {
                    iconName = focused ? 'grid' : 'grid-outline'
                }

                if (route.name === 'Profile' && authUser && authUser.picture) {
                    return (
                        <View style={{ top: 6, borderRadius: 250, overflow: 'hidden', borderWidth: focused ? 1 : 0, borderColor: colors.text[theme].primary }}>
                            <Image
                                width={32}
                                height={32}
                                source={{uri: authUser.picture}}
                            />
                            {/* <ProfileGen focused={focused} theme={theme} initials={authUser.email[0] + authUser.email[1]} width={32} font={13} /> */}
                        </View>
                    )
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.text[theme].primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                backgroundColor: colors.background[theme].elevated,
                borderTopColor: colors.fills[theme].stroke,
            },
            headerShown: false,
        })}>
            {/* The 'Home' tab might be missing if it's meant to be a separate tab and not just a screen */}
            <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
            {/* <Tab.Screen name="SportsTab" component={SportsNavigator} options={{ title: 'Sports' }} /> */}
            <Tab.Screen name="Resources" component={Resources} options={{ title: 'Resources' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: authUser ? '' : 'Profile' }} />
        </Tab.Navigator>
    )
};

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

    const { authUser, loading, theme } = useAuthContext();
    // const navigation = useNavigation<HomeStackParamList>(); // useNavigation should typically be within a screen component

    useEffect(() => {
        if (error) throw error;

        if (fontsLoaded && !loading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error, loading]); // Removed updateAuthUser as it's not a dependency for this effect

    if (!fontsLoaded || loading) {
        return null;
    }

    return (
        <>
            {authUser ? (
                <AppStack.Navigator screenOptions={{ headerShown: false }}>
                    <AppStack.Screen name="MainTabs" component={MainTabNavigator} />
                    <AppStack.Screen name="Resources" component={Resources} />
                    <AppStack.Screen name="ACreate" component={Create} />
                    <AppStack.Screen name="AddFile" component={AddFile} options={{ presentation: 'modal' }} />
                    <AppStack.Screen name="AddLink" component={AddLink} options={{ presentation: 'modal' }} />
                    <AppStack.Screen name="AddDate" component={AddDate} options={{ presentation: 'modal' }} />
                    <AppStack.Screen name="ImagePreview" component={ImagePreview} />
                    <AppStack.Screen name="ViewModal" component={ViewModal} />
                    <AppStack.Screen name="Menu" component={Menu} options={{ presentation: 'modal' }} />
                </AppStack.Navigator>
            ) : (
                <AppStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Signin">
                    {/* <AppStack.Screen name="SportsTab" component={SportsNavigator} options={{ title: 'Sports' }} /> */}
                    <AppStack.Screen name="Signin" component={Signin} />
                    <AppStack.Screen name="ParentSignIn" component={ParentSignIn} />
                    <AppStack.Screen name="Profile" component={Profile} options={{ presentation: 'modal' }} />
                </AppStack.Navigator>
            )}
        </>
    );
};

export default Navigation;
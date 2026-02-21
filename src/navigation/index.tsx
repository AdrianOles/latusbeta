import { useFonts } from 'expo-font';
import { SplashScreen } from "expo-router";
import { AuthUserType, useAuthContext } from '../contexts/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Use this one
import { NavigationContainer, useNavigation } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack'; // Remove this import
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import { Text, View, Image } from 'react-native';
import { useEffect, useState } from 'react';
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
import MySchool from '../screens/Sports/MySchool';
import Svg, { Path } from 'react-native-svg';

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
        sets?: {
            home: number[] | undefined;
            visitor: number[] | undefined
        } | undefined;
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
        time?: string;
        dateString?: string
        sets?: {
            home: number[] | undefined;
            visitor: number[] | undefined
        } | undefined;
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
        <SportsInnerStack.Screen name="SportsMySchool" component={MySchool} />
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

    const unfilledSports = (
        <View style={{transform: [{ scale: 0.35}], top: 3}}>
            <Svg height={78} width={78}>
                <Path d="M66.3779 0C72.5205 0.000331843 77.5 4.98036 77.5 11.123V47.7197C77.4999 53.8624 72.5205 58.8424 66.3779 58.8428H11.123C4.9802 58.8428 7.30663e-05 53.8626 0 47.7197V11.123C0 4.98016 4.98016 0 11.123 0H66.3779ZM11.123 5.02344C7.75437 5.02344 5.02344 7.75437 5.02344 11.123V17.2217H11.8408C14.0202 17.222 15.7869 18.9896 15.7871 21.1689V38.3906C15.7871 40.5702 14.0203 42.3376 11.8408 42.3379H5.02344V47.7197C5.02351 51.0883 7.75441 53.8193 11.123 53.8193H36.2383V42.8232C29.9085 41.6442 25.1155 36.0934 25.1152 29.4219C25.1152 22.7501 29.9082 17.1977 36.2383 16.0186V5.02344H11.123ZM41.2617 16.0186C47.5918 17.1975 52.3838 22.75 52.3838 29.4219C52.3835 36.0935 47.5916 41.6444 41.2617 42.8232V53.8193H66.3779C69.7463 53.819 72.4765 51.0881 72.4766 47.7197V42.3379H65.6602C63.4804 42.3379 61.7129 40.5704 61.7129 38.3906V21.1689C61.7131 18.9894 63.4806 17.2217 65.6602 17.2217H72.4766V11.123C72.4766 7.75457 69.7463 5.02377 66.3779 5.02344H41.2617V16.0186ZM36.2383 21.1826C32.7079 22.2577 30.1387 25.54 30.1387 29.4219C30.1389 33.3034 32.7083 36.5831 36.2383 37.6582V21.1826ZM41.2617 37.6582C44.7917 36.5832 47.3601 33.3035 47.3604 29.4219C47.3604 25.5399 44.7921 22.2576 41.2617 21.1826V37.6582ZM5.74121 37.3145H10.7646V22.2451H5.74121V37.3145ZM66.7363 37.3145H71.7598V22.2451H66.7363V37.3145Z"
                    fill={colors.text[theme].tertiary}
                />
            </Svg>
        </View>
    )

    const filledSports = (
        <View style={{ transform: [{ scale: 0.35 }], top: 3 }}>
            <Svg height={78} width={78}>
                <Path d="M36.0645 14.834C29.5088 16.0893 24.5549 21.8528 24.5547 28.7744C24.5547 35.6961 29.5088 41.4595 36.0645 42.7148V57.5498H9.20801C4.12268 57.5498 0.000113856 53.4271 0 48.3418V42.5869H9.97461C12.3053 42.5869 14.1952 40.6969 14.1953 38.3662V19.9502C14.1951 17.6196 12.3053 15.7305 9.97461 15.7305H0V9.20801C0 4.12261 4.12261 0 9.20801 0H36.0645V14.834ZM68.292 0C73.3774 0 77.5 4.12261 77.5 9.20801V15.7305H67.5244C65.194 15.7307 63.3049 17.6198 63.3047 19.9502V38.3662C63.3048 40.6968 65.1939 42.5867 67.5244 42.5869H77.5V48.3418C77.4999 53.4271 73.3773 57.5498 68.292 57.5498H41.4355V42.7148C47.9912 41.4595 52.9453 35.6961 52.9453 28.7744C52.9451 21.8528 47.9912 16.0893 41.4355 14.834V0H68.292ZM36.0645 37.9824C32.0746 36.8206 29.1582 33.1392 29.1582 28.7744C29.1584 24.4097 32.0747 20.7281 36.0645 19.5664V37.9824ZM41.4355 19.5664C45.4253 20.7281 48.3416 24.4098 48.3418 28.7744C48.3418 33.1392 45.4253 36.8206 41.4355 37.9824V19.5664ZM8.82422 37.2158H1.15039V21.1016H8.82422V37.2158ZM76.3496 21.1016V37.2158H68.6758V21.1016H76.3496Z"
                    fill={colors.text[theme].primary} />
            </Svg>
        </View>
    )

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
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

                if (route.name === 'SportsTab' && !focused) {
                    return unfilledSports;
                } else if (route.name === 'SportsTab' && focused) {
                    return filledSports;
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
            })}
            initialRouteName={authUser ? "Home" : "SportsTab"}>
            {/* The 'Home' tab might be missing if it's meant to be a separate tab and not just a screen */}
            <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
            <Tab.Screen name="SportsTab" component={SportsNavigator} options={{ title: 'Sports' }} />
            <Tab.Screen name="Resources" component={Resources} options={{ title: 'Resources' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: authUser ? '' : 'Profile' }} />
        </Tab.Navigator>
    )
};

const SubMainTabNavigator = () => { 
    const { authUser, theme } = useAuthContext();

    const unfilledSports = (
        <View style={{ transform: [{ scale: 0.35 }], top: 3 }}>
            <Svg height={78} width={78}>
                <Path d="M66.3779 0C72.5205 0.000331843 77.5 4.98036 77.5 11.123V47.7197C77.4999 53.8624 72.5205 58.8424 66.3779 58.8428H11.123C4.9802 58.8428 7.30663e-05 53.8626 0 47.7197V11.123C0 4.98016 4.98016 0 11.123 0H66.3779ZM11.123 5.02344C7.75437 5.02344 5.02344 7.75437 5.02344 11.123V17.2217H11.8408C14.0202 17.222 15.7869 18.9896 15.7871 21.1689V38.3906C15.7871 40.5702 14.0203 42.3376 11.8408 42.3379H5.02344V47.7197C5.02351 51.0883 7.75441 53.8193 11.123 53.8193H36.2383V42.8232C29.9085 41.6442 25.1155 36.0934 25.1152 29.4219C25.1152 22.7501 29.9082 17.1977 36.2383 16.0186V5.02344H11.123ZM41.2617 16.0186C47.5918 17.1975 52.3838 22.75 52.3838 29.4219C52.3835 36.0935 47.5916 41.6444 41.2617 42.8232V53.8193H66.3779C69.7463 53.819 72.4765 51.0881 72.4766 47.7197V42.3379H65.6602C63.4804 42.3379 61.7129 40.5704 61.7129 38.3906V21.1689C61.7131 18.9894 63.4806 17.2217 65.6602 17.2217H72.4766V11.123C72.4766 7.75457 69.7463 5.02377 66.3779 5.02344H41.2617V16.0186ZM36.2383 21.1826C32.7079 22.2577 30.1387 25.54 30.1387 29.4219C30.1389 33.3034 32.7083 36.5831 36.2383 37.6582V21.1826ZM41.2617 37.6582C44.7917 36.5832 47.3601 33.3035 47.3604 29.4219C47.3604 25.5399 44.7921 22.2576 41.2617 21.1826V37.6582ZM5.74121 37.3145H10.7646V22.2451H5.74121V37.3145ZM66.7363 37.3145H71.7598V22.2451H66.7363V37.3145Z"
                    fill={colors.text[theme].secondary}
                />
            </Svg>
        </View>
    )

    const filledSports = (
        <View style={{ transform: [{ scale: 0.35 }], top: 3 }}>
            <Svg height={78} width={78}>
                <Path d="M36.0645 14.834C29.5088 16.0893 24.5549 21.8528 24.5547 28.7744C24.5547 35.6961 29.5088 41.4595 36.0645 42.7148V57.5498H9.20801C4.12268 57.5498 0.000113856 53.4271 0 48.3418V42.5869H9.97461C12.3053 42.5869 14.1952 40.6969 14.1953 38.3662V19.9502C14.1951 17.6196 12.3053 15.7305 9.97461 15.7305H0V9.20801C0 4.12261 4.12261 0 9.20801 0H36.0645V14.834ZM68.292 0C73.3774 0 77.5 4.12261 77.5 9.20801V15.7305H67.5244C65.194 15.7307 63.3049 17.6198 63.3047 19.9502V38.3662C63.3048 40.6968 65.1939 42.5867 67.5244 42.5869H77.5V48.3418C77.4999 53.4271 73.3773 57.5498 68.292 57.5498H41.4355V42.7148C47.9912 41.4595 52.9453 35.6961 52.9453 28.7744C52.9451 21.8528 47.9912 16.0893 41.4355 14.834V0H68.292ZM36.0645 37.9824C32.0746 36.8206 29.1582 33.1392 29.1582 28.7744C29.1584 24.4097 32.0747 20.7281 36.0645 19.5664V37.9824ZM41.4355 19.5664C45.4253 20.7281 48.3416 24.4098 48.3418 28.7744C48.3418 33.1392 45.4253 36.8206 41.4355 37.9824V19.5664ZM8.82422 37.2158H1.15039V21.1016H8.82422V37.2158ZM76.3496 21.1016V37.2158H68.6758V21.1016H76.3496Z"
                    fill={colors.text[theme].primary} />
            </Svg>
        </View>
    )

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
                                source={{ uri: authUser.picture }}
                            />
                            {/* <ProfileGen focused={focused} theme={theme} initials={authUser.email[0] + authUser.email[1]} width={32} font={13} /> */}
                        </View>
                    )
                }

                if (route.name === 'SportsTab' && !focused) {
                    return unfilledSports;
                } else if (route.name === 'SportsTab' && focused) {
                    return filledSports;
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

    const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = useState(false);
    
    useEffect(() => {
        // Set a timer for the desired minimum duration (e.g., 2000 milliseconds = 2 seconds)
        const timer = setTimeout(() => {
            setIsMinimumTimeElapsed(true);
        }, 1000); // 2-second minimum display time

        return () => clearTimeout(timer); // Cleanup the timer
    }, []);

    // Effect 2: Hiding the splash screen
    useEffect(() => {
        if (error) throw error;

        // The splash screen hides ONLY when fonts, auth, AND minimum time are ready
        if (fontsLoaded && !loading && isMinimumTimeElapsed) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error, loading, isMinimumTimeElapsed]); // <-- Added isMinimumTimeElapsed dependency

    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        if (fontsLoaded && !loading && isMinimumTimeElapsed) {
            setAppIsReady(true);
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, loading, isMinimumTimeElapsed]);

    if (!appIsReady) {
        return null;
    }

    const earlyAdopters = [
        'olesnieadrian@gmail.com',              // Adrian
        'perusina@stfxavier.ca',                // Perusin
        'omarsarafa@gmail.com',                 // Omar
        'lanktreem@stfxavier.ca',               // Lanktree
        'desousab@my.werbr.ca',                 // DeSousa
        'luisa.olesniewicz.507@my.werbr.ca',    // Luisa
        'mukendij@myhcdsb.org',                 // Joel
        'tester.latus@gmail.com'                // Tester account
    ];

    const contractedSchoolDomains = [
        'stfxavier.ca'
    ]

    return (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen
                name="MainTabs"
                component={MainTabNavigator}
            />
            {/* Other screens for authenticated users */}
            <AppStack.Screen name="ACreate" component={Create} />
            <AppStack.Screen name="AddFile" component={AddFile} options={{ presentation: 'modal' }} />
            <AppStack.Screen name="AddLink" component={AddLink} options={{ presentation: 'modal' }} />
            <AppStack.Screen name="AddDate" component={AddDate} options={{ presentation: 'modal' }} />
            {/* Common Screens accessible in both states */}
            <AppStack.Screen name="Signin" component={Signin} />
            <AppStack.Screen name="ImagePreview" component={ImagePreview} />
            <AppStack.Screen name="ViewModal" component={ViewModal} />
            <AppStack.Screen name="Menu" component={Menu} options={{ presentation: 'modal' }} />
        </AppStack.Navigator>
    );
};

export default Navigation;
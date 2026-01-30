import { useAuthContext } from "../contexts/AuthContext";
import * as Linking from 'expo-linking';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, Platform, StatusBar } from "react-native";
import Navigation from ".";
import Toast from "react-native-toast-message";
import { toastConfig } from "../../App";


// Inside App.tsx or as a new file (e.g., RootNavigationWithContext.tsx)
const RootNavigationWithContext = () => {
    const { theme } = useAuthContext(); // ✅ Now this is called *inside* the provider
    const appTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

    // Re-declare linking or pass it in as a prop if you move this component to another file
    const prefix = Linking.createURL('/');
    const linking = {
        prefixes: [prefix, 'https://latus.ca'], // Add your actual website domain here
        config: {
            screens: {
                MainTabs: {
                    path: '',
                    screens: {
                        SportsTab: { // Matches the Tab.Screen name in MainTabNavigator
                            path: 'sports', // Base path for all sports links
                            screens: {
                                SportsHome: {
                                    // URL: /sports?org=HCAA
                                    path: '', // Default if only '/sports' base is given
                                },
                                SportsSearch: {
                                    // URL: /sports/search?search=keyword&org=HCAA
                                    path: 'search', // Matches the /search path segment
                                },
                                SportsLeague: {
                                    // URL: /sports/league?leagueId=jrboysoccer&org=HCAA
                                    path: 'league', // Matches the /league path segment
                                },
                                SportsTeam: {
                                    // URL: /sports/team?team=stfx&leagueId=jrboysoccer&org=HCAA
                                    path: 'team', // Matches the /team path segment
                                },
                                SportsGame: {
                                    // URL: /sports/game?game=stfxvsbr2025-07-27sportsNinjaId&team=stfx&leagueId=jrboysoccer&org=HCAA
                                    path: 'game', // Matches the /game path segment
                                },
                            },
                        },
                        Profile: {
                            path: 'profile', // If you want a deep link like /profile
                        },
                        Home: {
                            path: '', // Assuming home is the default if just app scheme is opened
                        }
                    }
                },
                // Signin/Auth related screens can also have deep links if desired
                Signin: {
                    path: 'signin',
                },
                ParentSignIn: {
                    path: 'parents-signin',
                },
                Testrun: {
                    path: 'testrun',
                }
            },
        },
    };

    return (
        <NavigationContainer theme={appTheme} linking={linking} fallback={<Text>Loading...</Text>}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF' }}>
                    <Navigation />
                    <Toast config={toastConfig} />
                </View>
            </GestureHandlerRootView>
            {Platform.OS === 'android' ? (
                <StatusBar
                    animated={true}
                    backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
                />
            ) : (
                <StatusBar
                    animated={true}
                    barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                />
            )}
        </NavigationContainer>
    );
};

export default RootNavigationWithContext;
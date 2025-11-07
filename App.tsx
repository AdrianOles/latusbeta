import { Amplify } from 'aws-amplify';
import { StyleSheet, Text, useColorScheme, View, StatusBar, Platform } from 'react-native';
import { SWRConfig } from 'swr';
import amplifyconfig from './src/amplifyconfiguration.json';
import AuthContextProvider, { useAuthContext } from './src/contexts/AuthContext';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

// const userPoolClientId = "4jje2jbjic8g5sgu8vuud3kk2j";
// const userPoolId = amplifyconfig.aws_user_pools_id;

// const correctResponseType: "code" | "token" = "code"

// const oauthConfig = {
//   domain: "entratest-dev.auth.ca-central-1.amazoncognito.com",
//   scopes: amplifyconfig.oauth.scope,
//   redirectSignIn: [amplifyconfig.oauth.redirectSignIn.split(',')[2]],
//   redirectSignOut: [amplifyconfig.oauth.redirectSignOut.split(',')[2]],
//   responseType: correctResponseType,
// }

// Amplify.configure({
//   Auth: {
//     Cognito: {
//       loginWith: {
//         oauth: {
//           ...oauthConfig,
//           redirectSignIn: oauthConfig.redirectSignIn,
//           redirectSignOut: oauthConfig.redirectSignOut
//         }
//       },
//       userPoolClientId,
//       userPoolId
//     }
//   }
// });


Amplify.configure(amplifyconfig);

const toastConfig = {
  success: () => (
    <View style={{ marginTop: '12%', borderRadius: 250, backgroundColor: '#1C1C1C', display: 'flex', flexDirection: 'row', gap: 6, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name='checkmark-circle-outline' color={'#1BCC64'} size={24} />
      <Text style={{ color: '#fff', fontFamily: 'Figtree-SemiBold', lineHeight: 23, fontSize: 18 }}>Success</Text>
    </View>
  ),
  error: () => (
    <View style={{ marginTop: '12%', borderRadius: 250, backgroundColor: '#1C1C1C', paddingVertical: 12, paddingHorizontal: 16, display: 'flex', flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name='alert-circle-outline' color={'#FA3E42'} size={28} />
      <View>
        <Text style={{ color: '#fff', fontFamily: 'Figtree-SemiBold', lineHeight: 23, fontSize: 18 }}>Error</Text>
        <Text style={{ color: '#FFFFFFB2', fontFamily: 'Figtree-Medium', lineHeight: 20, fontSize: 15 }}>Please try again.</Text>
      </View>

    </View>
  ),
  delete: () => (
    <View style={{ marginTop: '12%', borderRadius: 250, backgroundColor: '#1C1C1C', paddingVertical: 12, paddingHorizontal: 16, display: 'flex', flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name='trash-outline' color={'#FA3E42'} size={20} />
      <View>
        <Text style={{ color: '#fff', fontFamily: 'Figtree-SemiBold', lineHeight: 23, fontSize: 18 }}>Deleted</Text>
      </View>
    </View>
  ),
};

export default function App() {
  const { theme } = useAuthContext(); // Get the theme from your context
  const appTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  const prefix = Linking.createURL('/'); // e.g., "exp://..." or "yourapp://"

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
    <SWRConfig
      value={{  
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
      }}
    >
      <AuthContextProvider>
        <NavigationContainer theme={appTheme} linking={linking} fallback={<Text>Loading...</Text>}>
          <GestureHandlerRootView>
            <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF' }}>
              <Navigation />
              <Toast config={toastConfig} />
            </View>
          </GestureHandlerRootView>
          {
            Platform.OS === 'android' ? (
              <StatusBar
                animated={true}
                backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
              />
            ) : (
              <StatusBar
                animated={true}
                  barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
              />
            )
          }
        </NavigationContainer>
      </AuthContextProvider>
    </SWRConfig>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

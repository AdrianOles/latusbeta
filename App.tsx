import { Amplify } from 'aws-amplify';
import { StyleSheet, Text, useColorScheme, View, StatusBar, Platform } from 'react-native';
import { SWRConfig } from 'swr';
import amplifyconfig from './src/amplifyconfiguration.json';
import AuthContextProvider from './src/contexts/AuthContext';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

Amplify.configure(amplifyconfig);

const userPoolClientId = "4jje2jbjic8g5sgu8vuud3kk2j";
const userPoolId = amplifyconfig.aws_user_pools_id;

const correctResponseType: "code" | "token" = "code"

const oauthConfig = {
  domain: "entratest-dev.auth.ca-central-1.amazoncognito.com",
  scopes: amplifyconfig.oauth.scope,
  redirectSignIn: [amplifyconfig.oauth.redirectSignIn.split(',')[2]],
  redirectSignOut: [amplifyconfig.oauth.redirectSignOut.split(',')[2]],
  responseType: correctResponseType,
}

Amplify.configure({
  Auth: {
    Cognito: {
      loginWith: {
        oauth: {
          ...oauthConfig,
          redirectSignIn: oauthConfig.redirectSignIn,
          redirectSignOut: oauthConfig.redirectSignOut
        }
      },
      userPoolClientId,
      userPoolId
    }
  }
});

const myLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgb(255, 255, 255)',
  },
};

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
  const scheme = useColorScheme();

  return (
    <SWRConfig
      value={{  
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
      }}
    >
      <AuthContextProvider>
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : myLightTheme}>
          <GestureHandlerRootView>
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
              <Navigation />
              <Toast config={toastConfig} />
            </View>
          </GestureHandlerRootView>
          {
            Platform.OS === 'android' ? (
              <StatusBar
                animated={true}
                backgroundColor={scheme === 'dark' ? '#000' : '#FFF'}
              />
            ) : (
              <StatusBar
                animated={true}
                  barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
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

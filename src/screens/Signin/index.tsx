import { confirmResetPassword, ConfirmResetPasswordInput, confirmSignUp, ConfirmSignUpInput, fetchAuthSession, fetchUserAttributes, getCurrentUser, resetPassword, signIn, signInWithRedirect, signOut, signUp } from 'aws-amplify/auth'
import React, { useEffect, useRef, useState, } from 'react'
import { View, Text, TouchableOpacity, Platform, useColorScheme, Button, TextInput, Pressable, KeyboardAvoidingView, Keyboard, Linking } from 'react-native'
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context'
import { useAuthContext } from '../../contexts/AuthContext'
import { Hub } from 'aws-amplify/utils'
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message'
import { LIGHTLOGO, SIGNIN, hcdsb, signbg } from '../../../assets/index';
import { loglogo } from '../../../assets/index'
import colors from '../../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons';
import { signinAppVector } from '../../../assets/index'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeOutUp, ZoomIn, FadeOut, FadeIn, ZoomOut, FadeInUp, FadeOutDown } from 'react-native-reanimated'; 
import { Image } from 'expo-image'

const provider = {
  custom: 'HCDSBmobile'
}

type SignUpParameters = {
  username: string;
  password: string; //serves as the email
};

const Signin = () => {
  const navigation = useNavigation<HomeStackParamList>();
  const { authUser, updateAuthUser, error, clearErrorState, setError } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme(); // Returns 'light' or 'dark'
  const { theme } = useAuthContext();
  const [success, setSuccess] = useState(false);
  const [schoolError, setSchoolError] = useState(false);

  //Not sure tbh XD
  useEffect(() => {
    if (error != '') setLoading(false);
  }, [error]);

  //Check auth state before allowing duplicate sign in
  useEffect(() => {
    const checkAuthState = async () => {
      await updateAuthUser();
    };
    checkAuthState();
  }, []);

  useEffect(() => {
    const checkPendingAuth = async () => {
      const isPending = await AsyncStorage.getItem('auth_in_progress');
      if (isPending === 'true') {
        setLoading(true);
      }
    };

    checkPendingAuth();

    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          await AsyncStorage.removeItem('auth_in_progress');

          // 1. Fire the haptic success motor!
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // 2. Trigger the UI animation
          setSuccess(true);
          break;

        case 'signInWithRedirect_failure':
          await AsyncStorage.removeItem('auth_in_progress');
          setLoading(false);
          setSchoolError(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDefaultSignIn = async () => {
    setSchoolError(false)
    clearErrorState(); // FIX: Instantly clear any old errors when they try to sign in
    setLoading(true);
    await AsyncStorage.clear();

    await AsyncStorage.setItem('auth_in_progress', 'true');

    signInWithRedirect({
      provider: 'Google',
      options: {
        prompt: 'SELECT_ACCOUNT'
      }
    });
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setSchoolError(false); // Automatically clears the error
      }, 1500); // 3.5 seconds is usually the sweet spot for reading a short sentence

      return () => clearTimeout(timer); // Cleanup if the user taps something early
    }
  }, [error]);

  const handleGoBack = () => {
    navigation.navigate('Sports');
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        const school = authUser?.school?.toUpperCase();

        if (school === 'STFX') {
          console.log("going into announcement page")
          navigation.navigate('MainTabs', { screen: 'AnnouncementsTab' });
        } else {
          console.log("going into sports page")
          // Navigate to nested tab route from auth navigators
          navigation.navigate('MainTabs', { screen: 'SportsTab' });
        }
      }, 500); // Keep the success state for a moment to show the animation

      return () => clearTimeout(timer);
    }
  }, [success, authUser, navigation]);

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  const demoAccountLogIn = async () => {
    setSchoolError(false);
    clearErrorState();
    setLoading(true);

    try {
      const result = await signIn({
        username: 'demouser',
        password: 'reviewDemoAccount'
      });

      if (result.isSignedIn) {
        await updateAuthUser();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccess(true);
      } else {
        // Handle additional sign-in steps if needed (e.g., MFA)
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Demo sign-in error:', error);
      setLoading(false);
      setError('Failed to sign in with demo account. Please try again.');
    }
  }

  return (
    <>
    <StatusBar translucent={true} style={theme === 'dark' ? 'dark' : 'light'} backgroundColor={'transparent'} />
      <SafeAreaView
        style={{ backgroundColor: colors.background[theme].general, paddingBottom: Platform.OS === 'android' ? 32 : 0}}
        edges={["left", "right"]}
      >
        <View style={{ backgroundColor: colors.background[theme].general }}>
          <View style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0, zIndex: 1, height: 200 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Sports')} style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back" size={24} color={colors.text[theme].primary} />
              <Text maxFontSizeMultiplier={1.2} style={{ color: colors.text[theme].primary, fontSize: 17, fontFamily: 'Figtree-SemiBold' }}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', top: 56,  right: 0, bottom: 0, zIndex: 1, height: 200 }}>
            <TouchableOpacity onPress={demoAccountLogIn} style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Text maxFontSizeMultiplier={1.2} style={{ color: colors.text[theme].primary, fontSize: 17, fontFamily: 'Figtree-SemiBold' }}>Demo</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text[theme].primary} />
            </TouchableOpacity>
          </View>
          <Pressable onPress={Keyboard.dismiss} style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 0, overflow: 'hidden', position: 'relative', height: '100%' }}>
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: colors.background[theme].general, paddingTop: 32 }}>
                <View
                  style={{
                    zIndex: 0, width: '100%',
                    aspectRatio: 1, transform: [{ scale: 1.1 }]
                  }}>
                  <Image
                    source={signbg}
                    style={{
                      width: '100%',
                      aspectRatio: 1,
                      zIndex: 50
                    }}
                    contentFit="contain"
                    transition={300}
                  />
                </View>
              </View>
              <View style={{flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 16
              }}>
                <View style={{ paddingHorizontal: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12 }}>
                  <Text maxFontSizeMultiplier={1.1} style={{ fontSize: 32, lineHeight: 40, fontFamily: 'Figtree-Bold', color: colors.text[theme].primary, textAlign: 'left' }}>
                    Sign in to Latus
                  </Text>
                  <Text maxFontSizeMultiplier={1.1} style={{ fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-Regular', color: colors.text[theme].secondary, textAlign: 'left' }}>
                    Only students & staff in highschool can sign in with their school <Text style={{ fontFamily: 'Figtree-Bold' }}>Google accounts</Text>. We plan on expanding this soon.
                  </Text>
                </View>
                <Pressable style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                  <View style={{ height: 28, justifyContent: 'center' }}>
                    {error !== '' && (
                      <Animated.Text
                        exiting={FadeOut}
                        maxFontSizeMultiplier={1.1}
                        style={{
                          textAlign: 'center',
                          fontSize: 13,
                          lineHeight: 18,
                          fontFamily: 'Figtree-SemiBold',
                          color: '#FA3E42',
                          marginBottom: 10,
                        }}
                      >
                        {error}
                      </Animated.Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{
                      borderRadius: 250,
                      overflow: 'hidden',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
                    }}
                    onPress={() => handleDefaultSignIn()}
                    disabled={loading || success} // Also disable tap while showing error
                  >
                    <LinearGradient
                      colors={
                        success
                          ? [colors.system[theme].green, '#28a745']
                          : loading ? [colors.fills[theme].subtle, colors.fills[theme].subtle]
                            : [colors.fills[theme].ctaFirst, colors.fills[theme].ctaSecond]
                      }
                      style={{ position: 'absolute', width: '100%', height: '100%' }}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                    />

                    <View style={{ paddingHorizontal: 16, alignItems: 'center', height: 56, justifyContent: 'center' }}>
                      {success ? (
                        // 1. SUCCESS STATE
                        <Animated.View entering={ZoomIn.springify().damping(12)} exiting={FadeOut}>
                          <Ionicons name="checkmark-circle" size={28} color={colors.background['light'].general} />
                        </Animated.View>
                      ) : loading ? (
                        // 3. LOADING STATE
                        <Animated.Text maxFontSizeMultiplier={1.2} entering={FadeIn} exiting={FadeOut} style={{ color: colors.background['light'].general, fontSize: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                          Loading...
                        </Animated.Text>
                      ) : (
                        // 4. DEFAULT STATE
                        <Animated.Text maxFontSizeMultiplier={1.2} entering={FadeIn} style={{ color: colors.background['light'].general, fontSize: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                          Sign in
                        </Animated.Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ borderRadius: 250, overflow: 'hidden', backgroundColor: colors.fills[theme].standard, marginTop: 8 }}
                    onPress={() => Linking.openURL("https://www.latus.ca/contact")}// Also disable tap while showing error
                  >

                    <View style={{ paddingHorizontal: 16, alignItems: 'center', height: 56, justifyContent: 'center' }}>
                      <Text maxFontSizeMultiplier={1.2} style={{ color: colors.text[theme].primary, fontSize: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                        Contact us
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  )
}

export default Signin
import { confirmResetPassword, ConfirmResetPasswordInput, confirmSignUp, ConfirmSignUpInput, fetchAuthSession, fetchUserAttributes, getCurrentUser, resetPassword, signIn, signInWithRedirect, signOut, signUp } from 'aws-amplify/auth'
import React, { useEffect, useRef, useState, } from 'react'
import { View, Text, TouchableOpacity, Platform, useColorScheme, Button, TextInput, Pressable, KeyboardAvoidingView, Keyboard, Linking } from 'react-native'
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context'
import { useAuthContext } from '../../contexts/AuthContext'
import { Hub } from 'aws-amplify/utils'
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message'
import { LIGHTLOGO, SIGNIN } from '../../../assets/index';
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
  const { authUser, updateAuthUser, error, clearErrorState } = useAuthContext();
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

  useEffect(() => {
    if (success) {
      const test = setTimeout(() => {
        navigation.goBack();
      }, 500); // Keep the success state for a moment to show the animation

      return () => clearTimeout(test); // Cleanup if the user taps something early
    }
  }, [success]);

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


  return (
    <>
    <StatusBar translucent={true} style={theme === 'dark' ? 'light' : 'light'} backgroundColor={'transparent'} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background['dark'].general }}
        edges={["top"]}
      >
        <View style={{ backgroundColor: colors.background[theme].general }}>
          <View style={{ position: 'absolute', top: 8, left: 0, right: 0, bottom: 0, zIndex: 1, height: 200 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 16, flexDirection: 'row' }}>
              <Ionicons name="chevron-back" size={24} color={colors.system.white} onPress={() => navigation.goBack()} />
              <Text maxFontSizeMultiplier={1.2} style={{ color: colors.system.white, fontSize: 17, fontFamily: 'Figtree-SemiBold' }}>Back</Text>
            </TouchableOpacity>
          </View>

          <Pressable onPress={Keyboard.dismiss} style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 0, overflow: 'hidden', height: '100%' }}>
              <View>
                <View style={{ width: '100%', height: 356, borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 2, marginBottom: 24 }}>
                  <Image
                    source={signinAppVector}
                    style={{ width: '100%', height: 355 }}
                    placeholder={{ blurhash }}
                    contentFit='contain'
                    transition={300}
                  />
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                  <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 32, lineHeight: 40, fontFamily: 'Figtree-Bold', color: colors.text[theme].primary, textAlign: 'left' }}>Welcome to Latus</Text>
                  <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-REgular', color: colors.text[theme].secondary, textAlign: 'left' }}>
                    Only students & staff in highschool can sign in with their school Google accounts. We plan on expanding this soon.
                  </Text>
                </View>
              </View>
              <Pressable style={{ paddingHorizontal: 16, marginBottom: 24 }}>
                <View style={{ height: 28, justifyContent: 'center' }}>
                  {error !== '' && (
                    <Animated.Text
                      exiting={FadeOut}
                      maxFontSizeMultiplier={1.2}
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

                {Platform.OS === 'android' && (
                  <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: colors.system[theme].yellow, marginTop: 8, marginBottom: Platform.OS === 'android' ? 8 : 0 }}>
                    The android version is still in beta. Please send any issues to our email at social.latus@gmail.com.
                  </Text>
                )}
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
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  )
}

export default Signin
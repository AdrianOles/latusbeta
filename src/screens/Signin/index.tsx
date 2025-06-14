import { fetchAuthSession, fetchUserAttributes, getCurrentUser, signIn, signInWithRedirect, signOut } from 'aws-amplify/auth'
import React, { useEffect, useState, } from 'react'
import { View, Text, TouchableOpacity, Image, Platform, useColorScheme, Button } from 'react-native'
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context'
import { useAuthContext } from '../../contexts/AuthContext'
import { Hub } from 'aws-amplify/utils'
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message'
import { DARKLOGO, LIGHTLOGO } from '../../../assets/index';
import colors from '../../colors';
import { authorize } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router'
import { HomeStackParamList } from '../../navigation'

const provider = {
  custom: 'HCDSBmobile'
}

const Signin = () => {
  const navigation = useNavigation<HomeStackParamList>();
  const { authUser, updateAuthUser, error, clearErrorState } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme(); // Returns 'light' or 'dark'

  const checkNetwork = async () => {
    const response = await Network.getNetworkStateAsync();

    if (response?.isConnected && response?.isInternetReachable) {
      return true;
    } else {
      Toast.show({
        type: 'error',
        topOffset: 0
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return false;
    }
  }

  //Triggers sign in proccess
  const handleSignIn = async () => {
    const networkAccess = await checkNetwork();
    if (!loading && networkAccess) {
      clearErrorState();
      setLoading(true);
      try {
        // signOut();
        updateAuthUser();
        signInWithRedirect({ provider })
      } catch (error) {
        console.log('Error signing out: ', error);
      }
    }
  };

  //Not sure tbh XD
  useEffect(() => {
    if (error != '') setLoading(false);
  }, [error])

  //Check auth state before allowing duplicate sign in
  useEffect(() => {
    const checkAuthState = async () => {
      await updateAuthUser();
    };
    checkAuthState();
  }, []);

  useEffect(() => {
  }, [updateAuthUser]);

  return (
    <SafeAreaView style={{ backgroundColor: colors.background[colorScheme ? colorScheme : 'light'].general }}>
      <View style={{ height: '100%' }}>
        {
          error && (
            <View>
              <Text>{error}</Text>
            </View>
          )
        }
        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 0, paddingHorizontal: 16, overflow: 'hidden', height: '100%' }}>
          <View />
          <View>
            <Image
              source={colorScheme ? (colorScheme === 'light' ? LIGHTLOGO : DARKLOGO) : DARKLOGO}
              style={{ height: 148, width: 148, alignSelf: 'center' }}
            />
            <Text style={{ fontSize: 32, lineHeight: 40, fontFamily: 'Figtree-Bold', color: colors.text[colorScheme ? colorScheme : 'light'].primary, textAlign: 'center'}}>Welcome to Latus</Text>
            <Text style={{ fontSize: 16, lineHeight: 20, fontFamily: 'Figtree-Medium', color: colors.text[colorScheme ? colorScheme : 'light'].secondary, textAlign: 'center' }}>Everything you need in one place</Text>
          </View>
          <View>
            <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: '#FA3E42', marginBottom: 10, opacity: error ? 1 : 0 }} >{error}</Text>
            <TouchableOpacity style={{ borderRadius: 16, backgroundColor: colors.text[colorScheme ? colorScheme : 'light'].primary, alignItems: 'center', padding: 16 }} onPress={() => handleSignIn()}>
              {
                loading ? (
                  <Text style={{ color: colors.background[colorScheme ? colorScheme : 'light'].general, fontSize: 17, lineHeight: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                    Loading...
                  </Text>
                ) : (
                    <Text style={{ color: colors.background[colorScheme ? colorScheme : 'light'].general, fontSize: 17, lineHeight: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                    Sign in
                  </Text>
                )
              }
            </TouchableOpacity>
            <View style={{paddingVertical: 16, display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
              <Text>Are you a parent? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ParentSignIn', {})}>
                <Text style={{fontFamily: 'Figtree-SemiBold'}}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Signin
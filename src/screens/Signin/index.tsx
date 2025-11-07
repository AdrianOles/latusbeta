import { confirmResetPassword, ConfirmResetPasswordInput, confirmSignUp, ConfirmSignUpInput, fetchAuthSession, fetchUserAttributes, getCurrentUser, resetPassword, signIn, signInWithRedirect, signOut, signUp } from 'aws-amplify/auth'
import React, { useEffect, useRef, useState, } from 'react'
import { View, Text, TouchableOpacity, Image, Platform, useColorScheme, Button, TextInput, Pressable, KeyboardAvoidingView, Keyboard } from 'react-native'
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
import { useNavigation } from 'expo-router'
import { HomeStackParamList } from '../../navigation'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons';

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

  const [parent, setParent] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rpswd, setRpswd] = useState<string>('');
  const [code, setCode] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [values, setValues] = useState(Array(6).fill(''));

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [reFocus, setReFocus] = useState(false);

  const [hidePassword, setHidePassword] = useState(true);


  const [step, setStep] = useState<number>(0);
  /**
   * 0 - default school vs parent sign in
   * 1 - create account
   * 2 - verify account with code
   * 3 - reset password stage 1 (email)
   * 4 - reset password stage 2 (code)
   * 5 - reset password stage 3 (new password)
   * 6 - Password reset success
   * 7 - Account creation success
   */

  const [authError, setAuthError] = useState<number>(0);
  /**
   * 0 - Nothing wrong
   * 1 - Email not filled
   * 2 - password not filled
   * 3 - Incorrect email or password
   * 4 - wrong password characters
   * 5 - attempt limit
   * 6 - incorrect code
   * 7 - invalid email
   */

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow single digits

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValues.every(v => v !== '')) {
      const code = Number(newValues.join('')); // or parseInt(...)
      setCode(code);
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
  };

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

  const parentSignIn = async () => {
    setLoading(true);

    if (password && email) {
      try {
        const { isSignedIn } = await signIn({ username: email, password: password });
        if (isSignedIn) updateAuthUser();
      } catch (error: any) {
        if (error) {
          console.log(error);
          if (error.message.includes("Incorrect username or password")) {
            setAuthError(3);
          } else if (error.message.includes("Password attempts exceeded")) {
            console.log('--------should initiate time delay thing-----------')
            setAuthError(5);
          } else {
            setAuthError(3);
          }
        }
      } finally {
        setLoading(false);
      }
    } else if (!email) {
      setAuthError(1);
    } else if (!password) {
      setAuthError(2);
    }

    setLoading(false);
  }

  async function handleSignUp({
    username,
    password
  }: SignUpParameters) {
    try {
      setLoading(true);
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
          // optional
          autoSignIn: true // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
        }
      });
      setStep(2); //verify account with code sent to email

      console.log(userId);
      console.log(isSignUpComplete);
      console.log(nextStep);
    } catch (error: any) {
      console.log('error signing up:', error);
      //PreSignUp failed with error Email address is not authorized to sign up
      if (error) {
        console.log(error);
        if (error.message.includes("PreSignUp failed with error Email address is not authorized to sign up")) {
          console.log("Invalid email error");
          setAuthError(7);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleSignUpConfirmation({
    username,
    confirmationCode
  }: ConfirmSignUpInput) {
    try {
      setLoading(true);
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode
      });

      console.log(isSignUpComplete);
      console.log(nextStep);
      setStep(7);
    } catch (error: any) {
      if (error) {
        console.log(error);
        if (error.message.includes("Invalid verification code provided, please try again.")) {
          console.log("Code error");
          setAuthError(6);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  async function confirmResetPass({
    username,
    newPassword,
    confirmationCode
  }: ConfirmResetPasswordInput) {
    try {
      setLoading(true);
      console.log("email: ", username);
      console.log("new password: ", newPassword);
      console.log("confirmationCode: ", confirmationCode)
      const result = await confirmResetPassword({ username, newPassword, confirmationCode });
      console.log(result);
      setStep(6);
    } catch (error: any) {
      if (error) {
        console.log(error);
        if (error.message.includes("Invalid verification code provided, please try again.")) {
          console.log("Code error");
          setStep(4)
          setAuthError(6);
        }
      }
    } finally {
      setLoading(false);
    }
  };

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
    console.log("Use effect with updateAuthUser")
  }, [updateAuthUser]);

  const handleDefaultSignIn = async () => {
    await AsyncStorage.clear(); // Or remove specific auth tokens
    signInWithRedirect({provider : 'Google'})
  }

  let content = (
    <Pressable style={{ width: '100%' }}>
      {/* -----EMAIL---- */}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor={colors.text['light'].secondary}
        maxLength={45}
        value={email}
        onFocus={() => setEmailFocus(true)}
        onBlur={() => setEmailFocus(false)}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        editable={!loading}
        style={{
          padding: 16, borderRadius: 16, borderWidth: 1, color: colors.text['light'].primary, flexGrow: 1,
          borderColor: authError === 3 || (authError === 1 && !emailFocus && !email) ? colors.system.light.red :
            emailFocus
              ? '#526CFF' // your focused color
              : colors.fills['light'].stroke, textTransform: 'lowercase',
          fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22, textAlign: 'left', opacity: loading ? 0.5 : 1, marginBottom: 20
        }}
      />

      {/* -----PASSWORD----- */}
      <View style={{ position: 'relative', marginBottom: 6 }}>
        <TextInput
          placeholder="Password"
          textContentType="password"
          secureTextEntry={hidePassword}
          placeholderTextColor={colors.text['light'].secondary}
          maxLength={45}
          autoCapitalize="none"
          value={password}
          onFocus={() => setPassFocus(true)}
          onBlur={() => setPassFocus(false)}
          onChangeText={(text) => setPassword(text)}
          editable={!loading}
          style={{
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: authError === 3 || (authError === 2 && !passFocus && !password) ? colors.system.light.red : passFocus ? '#526CFF' : colors.fills['light'].stroke,
            color: colors.text['light'].primary,
            fontSize: 17,
            fontFamily: 'Figtree-SemiBold',
            letterSpacing: 0.2,
            lineHeight: 22,
            textAlign: 'left',
            opacity: loading ? 0.5 : 1,
            paddingRight: 60, // make space for the Show/Hide button
          }}
        />
        <TouchableOpacity
          onPress={() => setHidePassword(!hidePassword)}
          style={{
            position: 'absolute',
            right: 16,
            top: 18,
            zIndex: 10,
          }}
        >
          <Text style={{ color: colors.text['light'].secondary, fontFamily: 'Figtree-Medium', fontSize: 15, opacity: password ? 1 : 0 }}>
            {hidePassword ? 'Show' : 'Hide'}
          </Text>
        </TouchableOpacity>
      </View>
      {
        authError === 3 && (
          <Text style={{ paddingLeft: 8, color: colors.system.light.red, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Your email or password is incorrect</Text>
        )
      }

      {/* -----FORGOT PASSWORD------ */}
      <TouchableOpacity onPress={() => setStep(3)}>
        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text.light.secondary, padding: 8 }}>
          Forgot your password?
        </Text>
      </TouchableOpacity>

      {/* -----BUTTON------- */}
      <TouchableOpacity
        onPress={() => parentSignIn()}
        style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 48, backgroundColor: '#526CFF' }}
      >
        <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
          {
            loading ? "Loading..." : "Sign in"
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setStep(1)}
        style={{ padding: 8, marginTop: 12, marginBottom: 50 }}
      >
        <Text style={{ textAlign: 'center', color: '#526CFF', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Create an account</Text>
      </TouchableOpacity>
    </Pressable>
  )

  if (step === 1) { // Create account 
    content = (
      <View>
        {/* ------EMAIL------- */}
        <View>
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            value={email}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            editable={!loading}
            style={{
              padding: 16, borderRadius: 16, borderWidth: 1, color: colors.text['light'].primary, flexGrow: 1,
              borderColor: authError === 3 || authError === 7 || (authError === 1 && !emailFocus && !email) ? colors.system.light.red :
                emailFocus
                  ? '#526CFF' // your focused color
                  : colors.fills['light'].stroke, textTransform: 'lowercase', marginTop: 24,
              fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22, textAlign: 'left', opacity: loading ? 0.5 : 1, marginBottom: 8
            }}
          />
          {
            authError === 7 ? (
              <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, paddingLeft: 8, marginBottom: 20, color: colors.system.light.red }}>
                Email is not recognized by your child(s)'s school <TouchableOpacity><Text style={{ fontFamily: 'Figtree-Medium', textDecorationLine: 'underline', transform: [{ translateY: '30%' }] }}>Learn more</Text></TouchableOpacity>
              </Text>
            ): (
                <Text style={{ fontFamily: 'Figtree-Regular', fontSize: 15, lineHeight: 20, paddingLeft: 8, marginBottom: 20 }}>
                  Use the same email you've given your child(s)'s school <TouchableOpacity><Text style={{ fontFamily: 'Figtree-Medium', textDecorationLine: 'underline', transform: [{ translateY: '30%' }] }}>Learn more</Text></TouchableOpacity>
                </Text>
            )
          }
        </View>

        {/* -----PASSWORD------ */}
        <View style={{ position: 'relative', marginBottom: 20 }}>
          <TextInput
            placeholder="Password"
            textContentType="password"
            secureTextEntry={hidePassword}
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            autoCapitalize="none"
            value={password}
            onFocus={() => setPassFocus(true)}
            onBlur={() => setPassFocus(false)}
            onChangeText={(text) => setPassword(text)}
            editable={!loading}
            style={{
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: authError === 3 || (authError === 2 && !passFocus && !password) ? colors.system.light.red : passFocus ? '#526CFF' : colors.fills['light'].stroke,
              color: colors.text['light'].primary,
              fontSize: 17,
              fontFamily: 'Figtree-SemiBold',
              letterSpacing: 0.2,
              lineHeight: 22,
              textAlign: 'left',
              opacity: loading ? 0.5 : 1,
              paddingRight: 60, // make space for the Show/Hide button
            }}
          />
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{
              position: 'absolute',
              right: 16,
              top: 18,
              zIndex: 10,
            }}
          >
            <Text style={{ color: colors.text['light'].secondary, fontFamily: 'Figtree-Medium', fontSize: 15, opacity: password ? 1 : 0 }}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/*-----RETYPE_PASSWORD------ */}
        <View style={{ position: 'relative', marginBottom: 0 }}>
          <TextInput
            placeholder="Retype password"
            textContentType="password"
            secureTextEntry={hidePassword}
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            autoCapitalize="none"
            value={rpswd}
            onFocus={() => setReFocus(true)}
            onBlur={() => setReFocus(false)}
            onChangeText={(text) => setRpswd(text)}
            editable={!loading}
            style={{
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: authError === 3 || (authError === 2 && !passFocus && !rpswd) ? colors.system.light.red : reFocus ? '#526CFF' : colors.fills['light'].stroke,
              color: colors.text['light'].primary,
              fontSize: 17,
              fontFamily: 'Figtree-SemiBold',
              letterSpacing: 0.2,
              lineHeight: 22,
              textAlign: 'left',
              opacity: loading ? 0.5 : 1,
              paddingRight: 60, // make space for the Show/Hide button
            }}
          />
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{
              position: 'absolute',
              right: 16,
              top: 18,
              zIndex: 10,
            }}
          >
            <Text style={{ color: colors.text['light'].secondary, fontFamily: 'Figtree-Medium', fontSize: 15, opacity: password ? 1 : 0 }}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/*------CONTINUE------- */}
        <TouchableOpacity
          onPress={() => handleSignUp({username: email, password})}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 48, backgroundColor: colors.text.light.primary }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Continue"
            }
          </Text>
        </TouchableOpacity>

        {/* -------BACK------- */}
        <TouchableOpacity
          onPress={() => setStep(0)}
          style={{ padding: 8, marginTop: 12, marginBottom: 50 }}
        >
          <Text style={{ textAlign: 'center', color: colors.text.light.secondary, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Go back to sign in</Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 2) { //Sign up code  
    content = (
      <View>
        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, textAlign: 'center', marginTop: 4 }}>
          Enter the 6 digit code sent to {email}
        </Text>

        {/*------CODE INPUT------- */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'stretch',
          marginTop: 48
        }}>
          {values.map((value, index) => {
            const isActive = index === values.findIndex(v => v === '') || (index === values.length - 1 && value !== '');
            return (

              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={value}
                onChangeText={val => handleChange(index, val)}
                onKeyPress={e => handleKeyPress(index, e)}
                keyboardType="numeric"
                maxLength={1}
                autoFocus={index === 0}
                style={{
                  borderColor: (authError === 6) ? colors.system['light'].red : (!isActive || code?.toString().length == 6) ? colors.fills['light'].stroke : '#526CFF',
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingVertical: 12,
                  fontFamily: 'Figtree-Bold',
                  fontSize: 28,
                  textAlign: 'center',
                  color: colors.text['light'].primary,
                  flexGrow: 0,
                  flexShrink: 0,
                  width: 48,
                  marginHorizontal: 4,
                  flexBasis: 'auto',
                }}
              />
            )
          })}
        </View>
        {
          authError === 6 && (
            <Text style={{textAlign: 'center', marginTop: 16, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.system.light.red}}>The entered code is incorrect</Text>
          )
        }

        {/* -----RESEND CODE------ */}
        <Text style={{padding: 8, fontFamily: 'Figtree-SemiBold', color: colors.text.light.secondary, fontSize: 15, lineHeight: 20, textAlign: 'center', marginTop: 48}}>
          Resend code
        </Text>

        {/* -----CREATE ACCOUNT----- */}
        <TouchableOpacity
          onPress={() => handleSignUpConfirmation({username: email, confirmationCode: code.toString()})}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 12, backgroundColor: '#526CFF' }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Create account"
            }
          </Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 3) { //Reset password (which account)
    content = (
      <View style={{marginTop: 24}}>
        {/* ------EMAIL------- */}
        <View>
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            value={email}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            editable={!loading}
            style={{
              padding: 16, borderRadius: 16, borderWidth: 1, color: colors.text['light'].primary, flexGrow: 1,
              borderColor: authError === 3 || (authError === 1 && !emailFocus && !email) ? colors.system.light.red :
                emailFocus
                  ? '#526CFF' // your focused color
                  : colors.fills['light'].stroke, textTransform: 'lowercase', 
              fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22, textAlign: 'left', opacity: loading ? 0.5 : 1, marginBottom: 60
            }}
          />
        </View>

        {/* -------CONTINUE----- */}
        <TouchableOpacity
          onPress={() => { resetPassword({ username: email }); setStep(4) }}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.text.light.primary }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Continue"
            }
          </Text>
        </TouchableOpacity>

        {/* -------BACK------- */}
        <TouchableOpacity
          onPress={() => setStep(0)}
          style={{ padding: 8, marginTop: 12, marginBottom: 50 }}
        >
          <Text style={{ textAlign: 'center', color: colors.text.light.secondary, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Go back to sign in</Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 4) { //Enter code to verify email
    content = (
      <View>
        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, textAlign: 'center', marginTop: 4 }}>
          Enter the 6 digit code sent to your email to reset password
        </Text>

        {/*------CODE INPUT------- */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'stretch',
          marginTop: 48
        }}>
          {values.map((value, index) => {
            const isActive = index === values.findIndex(v => v === '') || (index === values.length - 1 && value !== '');
            return (

              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={value}
                onChangeText={val => handleChange(index, val)}
                onKeyPress={e => handleKeyPress(index, e)}
                keyboardType="numeric"
                maxLength={1}
                autoFocus={index === 0}
                style={{
                  borderColor: (authError === 6) ? colors.system['light'].red : (!isActive || code?.toString().length == 6) ? colors.fills['light'].stroke : '#526CFF',
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingVertical: 12,
                  fontFamily: 'Figtree-Bold',
                  fontSize: 28,
                  textAlign: 'center',
                  color: colors.text['light'].primary,
                  flexGrow: 0,
                  flexShrink: 0,
                  width: 48,
                  marginHorizontal: 4,
                  flexBasis: 'auto',
                }}
              />
            )
          })}
        </View>
        {
          authError === 6 && (
            <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.system.light.red }}>The entered code is incorrect</Text>
          )
        }

        {/* -----RESEND CODE------ */}
        <Text style={{ padding: 8, fontFamily: 'Figtree-SemiBold', color: colors.text.light.secondary, fontSize: 15, lineHeight: 20, textAlign: 'center', marginTop: 48 }}>
          Resend code
        </Text>

        {/* -----CREATE ACCOUNT----- */}
        <TouchableOpacity
          onPress={() => setStep(5)}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 12, backgroundColor: '#526CFF' }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Continue"
            }
          </Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 5) { //New password
    content = (
      <View>
        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, textAlign: 'center', marginTop: 4 }}>
          This will be your new password for your Latus Account
        </Text>

        {/* -----PASSWORD------ */}
        <View style={{ position: 'relative', marginBottom: 20, marginTop: 24 }}>
          <TextInput
            placeholder="Password"
            textContentType="password"
            secureTextEntry={hidePassword}
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            autoCapitalize="none"
            value={password}
            onFocus={() => setPassFocus(true)}
            onBlur={() => setPassFocus(false)}
            onChangeText={(text) => setPassword(text)}
            editable={!loading}
            style={{
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: authError === 3 || (authError === 2 && !passFocus && !password) ? colors.system.light.red : passFocus ? '#526CFF' : colors.fills['light'].stroke,
              color: colors.text['light'].primary,
              fontSize: 17,
              fontFamily: 'Figtree-SemiBold',
              letterSpacing: 0.2,
              lineHeight: 22,
              textAlign: 'left',
              opacity: loading ? 0.5 : 1,
              paddingRight: 60, // make space for the Show/Hide button
            }}
          />
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{
              position: 'absolute',
              right: 16,
              top: 18,
              zIndex: 10,
            }}
          >
            <Text style={{ color: colors.text['light'].secondary, fontFamily: 'Figtree-Medium', fontSize: 15, opacity: password ? 1 : 0 }}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/*-----RETYPE_PASSWORD------ */}
        <View style={{ position: 'relative', marginBottom: 60 }}>
          <TextInput
            placeholder="Retype password"
            textContentType="password"
            secureTextEntry={hidePassword}
            placeholderTextColor={colors.text['light'].secondary}
            maxLength={45}
            autoCapitalize="none"
            value={rpswd}
            onFocus={() => setReFocus(true)}
            onBlur={() => setReFocus(false)}
            onChangeText={(text) => setRpswd(text)}
            editable={!loading}
            style={{
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: authError === 3 || (authError === 2 && !passFocus && !rpswd) ? colors.system.light.red : reFocus ? '#526CFF' : colors.fills['light'].stroke,
              color: colors.text['light'].primary,
              fontSize: 17,
              fontFamily: 'Figtree-SemiBold',
              letterSpacing: 0.2,
              lineHeight: 22,
              textAlign: 'left',
              opacity: loading ? 0.5 : 1,
              paddingRight: 60, // make space for the Show/Hide button
            }}
          />
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{
              position: 'absolute',
              right: 16,
              top: 18,
              zIndex: 10,
            }}
          >
            <Text style={{ color: colors.text['light'].secondary, fontFamily: 'Figtree-Medium', fontSize: 15, opacity: password ? 1 : 0 }}>
              {hidePassword ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/*------CONTINUE------- */}
        <TouchableOpacity
          onPress={() => confirmResetPass({username: email, newPassword: password, confirmationCode: code.toString()})}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#526CFF' }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Create new password"
            }
          </Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 6) {
    content = (
      <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 48, width: '100%' }}>
        {/* ---HEADER----- */}
        <Ionicons name={'checkmark-circle-outline'} size={60} color={colors.system.light.green}></Ionicons>
        <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 24, marginTop: 24, marginBottom: 4 }}>Your password has been reset</Text>
        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, color: colors.text.light.secondary }}>You can sign in with your new password</Text>

        {/*------CONTINUE------- */}
        <TouchableOpacity
          onPress={() => { }}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 48, backgroundColor: colors.text.light.primary, width: '100%' }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Sign in"
            }
          </Text>
        </TouchableOpacity>

        {/* -------BACK------- */}
        <TouchableOpacity
          onPress={() => setStep(0)}
          style={{ padding: 8, marginTop: 12, marginBottom: 50 }}
        >
          <Text style={{ textAlign: 'center', color: colors.text.light.secondary, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Go back home</Text>
        </TouchableOpacity>
      </View>
    )
  } else if (step === 7) {
    content = (
      <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 48, width: '100%' }}>
        {/* ---HEADER----- */}
        <Ionicons name={'checkmark-circle-outline'} size={60} color={colors.system.light.green}></Ionicons>
        <Text style={{fontFamily: 'Figtree-Bold', fontSize: 24, marginTop: 24, marginBottom: 4}}>Welcome to Latus</Text>
        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, color: colors.text.light.secondary }}>You can sign in with your new account</Text>
        
        {/*------CONTINUE------- */}
        <TouchableOpacity
          onPress={() => { }}
          style={{ borderRadius: 40, paddingHorizontal: 20, paddingVertical: 12, marginTop: 48, backgroundColor: colors.text.light.primary, width: '100%' }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
            {
              loading ? "Loading..." : "Sign in"
            }
          </Text>
        </TouchableOpacity>

        {/* -------BACK------- */}
        <TouchableOpacity
          onPress={() => setStep(0)}
          style={{ padding: 8, marginTop: 12, marginBottom: 50 }}
        >
          <Text style={{ textAlign: 'center', color: colors.text.light.secondary, fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>Go back home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background['dark'].general }}
      edges={["top", "bottom"]}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, backgroundColor: 'black' }}>
        <Pressable onPress={Keyboard.dismiss} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', alignContent: 'center', width: '100%', paddingTop: 84, paddingHorizontal: 24 }}>
          <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 0, paddingHorizontal: 16, overflow: 'hidden', height: '100%' }}>
            <View />
            <View>
              <Image
                source={SIGNIN}
                style={{ height: 148, width: 148, alignSelf: 'center' }}
              />
              <Text style={{ fontSize: 32, lineHeight: 40, fontFamily: 'Figtree-Bold', color: colors.text['dark'].primary, textAlign: 'center' }}>Welcome to Latus</Text>
              <Text style={{ fontSize: 16, lineHeight: 20, fontFamily: 'Figtree-Medium', color: colors.text['dark'].secondary, textAlign: 'center' }}>Everything you need in one place</Text>
            </View>
            <View>
              <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: '#FA3E42', marginBottom: 10, opacity: error ? 1 : 0 }} >{error}</Text>
              <TouchableOpacity style={{ borderRadius: 16, backgroundColor: colors.text['dark'].primary, alignItems: 'center', padding: 16 }} onPress={() => handleDefaultSignIn()}>
                {
                  loading ? (
                    <Text style={{ color: colors.background['dark'].general, fontSize: 17, lineHeight: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                      Loading...
                    </Text>
                  ) : (
                    <Text style={{ color: colors.background['dark'].general, fontSize: 17, lineHeight: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                      Sign in
                    </Text>
                  )
                }
              </TouchableOpacity >
              <Text maxFontSizeMultiplier={0} style={{ textAlign: 'center', fontSize: 13, lineHeight: 18, fontFamily: 'Figtree-SemiBold', color: colors.text['dark'].secondary, marginTop: 8, marginBottom: Platform.OS === 'android' ? 8 : 0 }}>Use your school google account</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Signin
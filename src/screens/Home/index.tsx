import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Platform, Button } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext';
import colors from '../../colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'aws-amplify/auth';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
};

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
    }
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        handleRegistrationError('Project ID not found');
    }
    
    try {
        const pushTokenString = (await Notifications.getExpoPushTokenAsync({projectId,})).data;
        console.log(pushTokenString);
        return pushTokenString;
    } catch (e: unknown) {
        handleRegistrationError(`${e}`);
    }
};

const Home = () => {
    const { authUser, theme } = useAuthContext();
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
      undefined
    ); 

    async function sendPushNotification(expoPushToken: string) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: 'Testing Notifications',
            body: `Created by ${authUser?.role}`,
            data: { someData: 'goes here' },
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
      }

    useEffect(() => {
        registerForPushNotificationsAsync()
          .then(token => setExpoPushToken(token ?? ''))
          .catch((error: any) => setExpoPushToken(`${error}`));
    
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });
    
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });
    
        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      }, []);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background[theme].general }}>
            <Text style={{color: '#000000'}}>
                {authUser?.email}
            </Text>
            <Text style={{ color: '#000000' }}>
                {authUser?.school}
            </Text>
            <Text style={{ color: '#000000' }}>
                {authUser?.role}
            </Text>

            <Button
                title="Press to Send Notification"
                onPress={async () => { await sendPushNotification(expoPushToken);}}
            />
        </SafeAreaView>
    )
}

export default Home
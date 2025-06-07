import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthContext } from '../../contexts/AuthContext';
import colors from '../../colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'aws-amplify/auth';

const Home = () => {
      const { authUser, theme } = useAuthContext();

    return (
        <SafeAreaView style={{ backgroundColor: colors.background[theme].general }}>
            <Text style={{color: '#000000'}}>
                {authUser?.email}
            </Text>
            <Text style={{ color: '#000000' }}>
                {authUser?.school}
            </Text>
            <TouchableOpacity style={{ borderRadius: 16, backgroundColor: colors.text[theme].primary, alignItems: 'center', padding: 16, margin: 16 }} onPress={() => signOut()}>
                <Text style={{ color: colors.background[theme].general, fontSize: 17, lineHeight: 17, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Home
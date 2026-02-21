import React, { useState } from 'react'
import { Text, View, Modal, TouchableOpacity, Platform, Pressable } from 'react-native'
import { AuthContextType, useAuthContext } from '../../contexts/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { MeshGradientView } from 'expo-mesh-gradient';
import ProfileGen from '../../components/ProfileGen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hcdsb } from '../../../assets';
import { Image } from 'expo-image';
import Signin from './../ParentSignIn/index';
import { HomeStackParamList } from '../../navigation';
import { useNavigation } from 'expo-router';

//!DONE
const Profile = () => {
    const { authUser, updateAuthUser, updateSchool, theme }: AuthContextType = useAuthContext();
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation<HomeStackParamList>();

    //Sign out and update UI access
    const handleLocalSignOut = async () => {
        try {
            await AsyncStorage.clear(); // Or remove specific auth tokens
            // Or remove from your state management (e.g., Redux, Context)
            navigation.navigate("SportsTab");
            updateAuthUser(); // Set auth state to unauthenticated
        } catch (error) {
            console.log('Error clearing tokens: ', error);
        }
    };

    //Change school for 'BOARD_ACCESS'
    const handleChangeSchool = (school: string) => {
        setModalVisible(false);
        updateSchool(school)
    }

    const schoolAbrv = {
        "AS": "Assumption",
        "BR": "Bishop Reding",
        "CTK": "Christ the King",
        "CC": "Corpus Christi",
        "HT": "Holy Trinity",
        "ND": "Notre Dame",
        "STFX": "St. Francis Xavier",
        "SKT": "St. Kateri Tekakwitha",
        "LOY": "St. Ignatius of Loyola",
        "STA": "St. Thomas Aquinas"
    } as const

    const schoolData = [
        {
            name: 'Assumption',
            abbrev: 'asu'
        },
        {
            name: 'Bishop P.F. Reding',
            abbrev: 'br'
        },
        {
            name: 'Christ the King',
            abbrev: 'ctk'
        },
        {
            name: 'Corpus Christi',
            abbrev: 'cc'
        },
        {
            name: 'Holy Trinity',
            abbrev: 'ht'
        },
        {
            name: 'Notre Dame',
            abbrev: 'nd'
        },
        {
            name: 'St. Francis Xavier',
            abbrev: 'stfx'
        },
        {
            name: 'St. Kateri Takakwitha',
            abbrev: 'skt'
        },
        {
            name: 'St. Ignatius of Loyola',
            abbrev: 'loy'
        },
        {
            name: 'St. Thomas Aquinas',
            abbrev: 'sta'
        }
    ];

    return (
        <View style={{
            height: '100%', width: '100%', display: 'flex',alignItems: 'center', gap: 16,
            paddingBottom: 24, paddingTop: Platform.OS === 'ios' ? 104 : 72, justifyContent: 'center',
            backgroundColor: colors.background[theme].general
        }}>
            {/* Modal for school selection */}
            {/*  Only seen by developer really */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <Pressable onPress={() => setModalVisible(!modalVisible)} style={{ backgroundColor: '#000000CD', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <View style={{ backgroundColor: '#FFF', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 20, width: '100%' }}>
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 17 }}>Select school:</Text>
                        <View style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', paddingTop: 14 }}>
                            {
                                schoolData.map((school, index) => (
                                    <TouchableOpacity
                                        key={school.abbrev} // Use a unique identifier from your data as the key
                                        onPress={() => handleChangeSchool(school.abbrev.toUpperCase())}
                                        style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: authUser?.school === school.abbrev.toUpperCase() ? '#0000002F' : '#0000000A', borderRadius: 12, marginRight: 6, marginBottom: 10 }}
                                    >
                                        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 14 }}>{school.name}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <View style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 48 }}>
                {
                    authUser ? (
                        <Image
                            source={{ uri: authUser.picture }}
                            style={{ borderRadius: 250, width: 88, height: 88 }}
                        />
                    ) : (
                        <Image
                            source={hcdsb}
                            style={{  width: 88, height: 88 }}
                        />   
                    )
                }
                {
                    authUser ? (
                        <>
                            <Text numberOfLines={1} style={{ color: colors.text[theme].primary, fontSize: 22, lineHeight: 36, marginTop: 12, fontFamily: 'Figtree-Bold' }}>
                                {authUser.name}
                            </Text>
                            <Text style={{
                                color: colors.text[theme].secondary, fontSize: 17, lineHeight: 22, letterSpacing: 0.2,
                                fontFamily: 'Figtree-SemiBold', textTransform: 'capitalize',
                            }}>
                                {authUser?.staffRole} | {authUser?.school ? schoolAbrv[authUser.school as keyof typeof schoolAbrv] : ''}
                            </Text>
                        </>
                    ): (
                        <Text numberOfLines={2} style={{ color: colors.text[theme].primary, fontSize: 22, lineHeight: 36, marginTop: 12, fontFamily: 'Figtree-Bold', textAlign: 'center' }}>
                            Halton Catholic District School Board
                        </Text>
                    )
                }

                {
                    authUser && (
                        <TouchableOpacity onPress={() => { handleLocalSignOut(); }}
                            style={{
                                borderRadius: 250, backgroundColor: theme === 'light' ? '#83818C1A' : '#B7B6BF33',
                                alignItems: 'center', paddingVertical: 16, paddingHorizontal: 48, width: '100%',
                                marginTop: 12
                            }}>
                            <Text style={{ color: colors.system[theme].red, fontSize: 17, lineHeight: 22, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>Sign out</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    )
}

export default Profile
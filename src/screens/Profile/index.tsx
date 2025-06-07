import React, { useState } from 'react'
import { Text, View, Image, Modal, TouchableOpacity, Platform, Pressable } from 'react-native'
import { AuthContextType, useAuthContext } from '../../contexts/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';

//!DONE
const Profile = () => {
    const { authUser, updateAuthUser, updateSchool, theme }: AuthContextType = useAuthContext();
    const [modalVisible, setModalVisible] = useState(false);

    //Sign out and update UI access
    const handleSignOut = async () => {
        try {
            signOut();
            updateAuthUser(); // Trigger re-fetch of auth state
        } catch (error) {
            console.log('Error signing out: ', error);
        }
    };

    //Change school for 'BOARD_ACCESS'
    const handleChangeSchool = (school: string) => {
        setModalVisible(false);
        updateSchool(school)
    }

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
            paddingBottom: 24, paddingTop: Platform.OS === 'ios' ? 104 : 72
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
            <View style={{height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, width: '100%', paddingHorizontal: 62 }}>
                    <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: colors.text[theme].primary, fontSize: 22, lineHeight: 30, fontFamily: 'Figtree-Bold' }}>
                            {authUser?.email}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => { handleSignOut(); }} style={{ borderRadius: 16, backgroundColor: theme === 'light' ? '#83818C1A' : '#FFFFFF1A', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 48, width: '100%' }}>
                        <Text style={{ color: colors.system[theme].red, fontSize: 17, lineHeight: 22, fontWeight: 600, fontFamily: 'Figtree-SemiBold' }}>Sign out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Profile
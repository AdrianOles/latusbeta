import React, { useRef, useState } from 'react'; // Import useRef
import { Text, View, Image, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../colors';
import { useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot'; // Import ViewShot
import * as Sharing from 'expo-sharing'; // Import Sharing

const Notifications = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation();
    const [day, setDay] = useState(false);
    const viewShotRef = useRef<ViewShot>(null); // <--- HERE IS THE KEY CHANGE

    return (
        <SafeAreaView edges={["bottom"]} style={{ paddingTop: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <View style={{ position: 'absolute', top: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', width: '100%', padding: 16, paddingBottom: 8 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, backgroundColor: colors.background[theme].second, borderRadius: 250 }}>
                    <Ionicons name='close-outline' size={28} />
                </TouchableOpacity>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48 }}>
                <Ionicons name='notifications-outline' size={70} color={colors.text[theme].primary} />
                <Text style={{ textAlign: 'center', fontFamily: 'Figtree-Bold', fontSize: 24, marginTop: 20, lineHeight: 32 }}>
                    Notifications
                </Text>
                <Text style={{textAlign: 'center', fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22}}>
                    Customize how you want to receive notifications for Bishop Reding
                </Text>
            </View>

            <ScrollView style={{paddingHorizontal: 24, marginTop: 32}}>
                <View style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: 26, paddingVertical: 24, borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1
                }}>
                    <View>
                        <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 17, lineHeight: 22, color: colors.text[theme].primary}}>Day Before</Text>
                        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary }}>Get notified 1 day before a game</Text>
                    </View>
                    <View>
                        <Switch
                            onValueChange={() => setDay(!day)}
                            value={day}
                        />
                    </View>
                </View>
                <View style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: 26, paddingVertical: 24, borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1
                }}>
                    <View>
                        <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 17, lineHeight: 22, color: colors.text[theme].primary }}>Game Day</Text>
                        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary }}>Get notified an hour before a game</Text>
                    </View>
                    <View>
                        <Switch
                            onValueChange={() => setDay(!day)}
                            value={day}
                        />
                    </View>
                </View>
                <View style={{
                    display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingHorizontal: 26, paddingVertical: 24, borderBottomColor: colors.fills[theme].stroke, borderBottomWidth: 1
                }}>
                    <View>
                        <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 17, lineHeight: 22, color: colors.text[theme].primary }}>Post Game</Text>
                        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary }}>Get notified once the results are out</Text>
                    </View>
                    <View>
                        <Switch
                            onValueChange={() => setDay(!day)}
                            value={day}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                borderTopWidth: 1, borderColor: colors.fills[theme].stroke, paddingBottom: 24, paddingTop: 24, paddingHorizontal: 16
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{
                    marginRight: 16, paddingHorizontal: 24, paddingVertical: 20, borderWidth: 1,
                    borderColor: colors.fills[theme].stroke, borderRadius: 250,
                }}>
                    <Text style={{textAlign: 'center',fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary}}>
                        Go back
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ 
                    marginRight: 16, paddingHorizontal: 24, paddingVertical: 20, borderWidth: 1, flexShrink: 0, flexGrow: 1,
                    borderColor: colors.fills[theme].stroke, borderRadius: 250, flex: 1, backgroundColor: '#526CFF'
                 }}>
                    <Text numberOfLines={1} style={{ textAlign: 'center', fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: 'white'}}>
                        Save preferences
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Notifications;
import React from "react";
import { TouchableOpacity, View, Text, Dimensions, ScrollView, Linking } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import Tab from "./Tab";
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const GameInfo = React.memo(({location, league} : {location: string, league: string}) => {
    const { theme } = useAuthContext();

    const handlePress = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    return (
        <ScrollView style={{
            display: 'flex', flexDirection: 'column', minWidth: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH,
            paddingHorizontal: 16
        }}>
            <View style={{
                backgroundColor: colors.background[theme].elevated, display: 'flex', flexDirection: 'column', borderRadius: 16,
                marginBottom: 16, boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)", 
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center',justifyContent: 'space-between',
                    borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: 1
                }}>
                    <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                        Location
                    </Text>
                    <View style={{
                        borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                        alignItems: 'center', backgroundColor: colors.fills[theme].standard
                    }}>
                        <Ionicons name="location" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{location}</Text>
                    </View>
                </View>
                <View style={{
                    display: 'flex', flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between',
                    borderBottomColor: colors.fills[theme].subtle, borderBottomWidth: 0
                }}>
                    <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                        League
                    </Text>
                    <View style={{
                        borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                        alignItems: 'center', backgroundColor: colors.fills[theme].standard
                    }}>
                        <Ionicons name="football" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{league}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={handlePress} style={{
                display: 'flex', flexDirection: 'row', borderWidth: 0, padding: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 12,
                borderColor: colors.fills[theme].subtle, borderRadius: 16, justifyContent: 'space-between', boxShadow: "0px 1px 12px rgba(38, 38, 38, 0.08)",
                backgroundColor: colors.background[theme].elevated
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Ionicons name="location" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].primary }}>Halton Catholic Athletic Association</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 12, lineHeight: 15, marginLeft: 16, marginBottom: 16, color: colors.text[theme].secondary }}>
                Visit the HCAA home page for complete game details
            </Text>
            <View style={{height: 400, width: 'auto'}} />
        </ScrollView>
    );
});

export default GameInfo;